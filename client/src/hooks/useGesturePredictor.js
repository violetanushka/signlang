import { useState, useCallback, useRef } from "react";
import api from "@/lib/api";

const THROTTLE_MS = 300;

/**
 * useGesturePredictor
 * Sends RAW MediaPipe landmarks (21 points, {x,y,z}) to the AI service.
 * Normalization is performed server-side by model_preprocess.py so that
 * the input exactly matches what the model was trained on.
 *
 * Frontend responsibilities:
 *  - Validate exactly 21 landmarks exist before sending
 *  - Throttle calls to every 300 ms
 *  - Apply 5-frame majority-vote smoothing to reduce flicker
 *  - Require 2 consecutive stable frames before updating UI state
 */
export default function useGesturePredictor() {
  const [prediction, setPrediction] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState(null);

  const predHistoryRef       = useRef([]);
  const lastCallRef          = useRef(0);
  const stableCountRef       = useRef(0);
  const lastStablePredRef    = useRef(null);

  /**
   * smoothPrediction — 5-frame sliding window majority vote.
   */
  const smoothPrediction = (newPred) => {
    if (!newPred) return null;

    predHistoryRef.current.push(newPred);
    if (predHistoryRef.current.length > 5) {
      predHistoryRef.current.shift();
    }

    const counts = {};
    predHistoryRef.current.forEach((p) => {
      counts[p] = (counts[p] || 0) + 1;
    });

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  };

  const estimateGesture = useCallback(async (landmarks) => {
    // ── Validation ──────────────────────────────────────────────────────────
    if (!landmarks || landmarks.length !== 21) {
      console.warn(
        `[GesturePredictor] Invalid landmark count: ${landmarks?.length}. Need exactly 21.`
      );
      setPrediction({ predicted_class: "No Hand Detected", confidence: 0 });
      return null;
    }

    // ── Throttle ─────────────────────────────────────────────────────────────
    const now = Date.now();
    if (now - lastCallRef.current < THROTTLE_MS) {
      return prediction;
    }
    lastCallRef.current = now;

    // ── Build payload — send RAW {x,y,z} objects, NO client-side normalization
    // The server's model_preprocess.py handles wrist-relative normalization
    // and max-abs scaling exactly as the model was trained.
    const payloadLandmarks = landmarks.slice(0, 21).map((lm) => ({
      x: typeof lm.x === "number" ? lm.x : 0,
      y: typeof lm.y === "number" ? lm.y : 0,
      z: typeof lm.z === "number" ? lm.z : 0,
    }));

    console.log("[GesturePredictor] Sending landmarks count:", payloadLandmarks.length);

    try {
      const res = await api.post("/assessment/predict", { landmarks: payloadLandmarks });
      const rawResult = res.data;

      if (!rawResult) throw new Error("Empty response from AI service");

      // Primary label from external model
      const label = rawResult.predicted_class || "unknown";
      const conf  = typeof rawResult.confidence === "number" ? rawResult.confidence : 0;

      console.log("[GesturePredictor] Raw prediction:", label, "conf:", conf);

      // Apply 5-frame smoothing
      const smoothed = smoothPrediction(label);

      // Require 2 consecutive matching frames to trigger stable state change
      if (smoothed === lastStablePredRef.current) {
        stableCountRef.current++;
      } else {
        stableCountRef.current = 0;
        lastStablePredRef.current = smoothed;
      }

      const result = {
        ...rawResult,
        predicted_class: smoothed,
        confidence: conf,
        isStable: stableCountRef.current >= 2,
      };

      setPrediction(result);
      setError(null);
      return result;
    } catch (err) {
      console.warn("[GesturePredictor] Prediction failed:", err.message);
      setError(err.message);
      return null;
    }
  }, [prediction]);

  /**
   * evaluateGesture — predicts, then scores against a target letter.
   */
  const evaluateGesture = useCallback(
    async (landmarks, targetGesture) => {
      const result = await estimateGesture(landmarks);
      if (!result || !targetGesture) return null;

      const target    = targetGesture.toUpperCase();
      const predicted = (result.predicted_class || "").toUpperCase();
      const isMatch   = predicted === target;

      const evalResult = {
        ...result,
        score:   isMatch && result.confidence > 0.6 ? 100 : 0,
        passed:  isMatch && result.confidence > 0.6 && result.isStable,
        message: isMatch ? "Correct!" : `Detected: ${result.predicted_class}`,
      };

      setEvaluation(evalResult);
      return evalResult;
    },
    [estimateGesture]
  );

  return {
    prediction,
    evaluation,
    error,
    estimateGesture,
    evaluateGesture,
    isPredicting: false,
  };
}
