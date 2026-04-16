import { useState, useCallback, useRef } from "react";
import api from "@/lib/api";

const THROTTLE_MS = 300; 

function normalize(lms) {
  const base = lms[0];
  return lms.map(p => ({
    x: p.x - base.x,
    y: p.y - base.y,
    z: p.z - base.z
  }));
}

/**
 * useGesturePredictor
 * Hybrid gesture recognition using server-side ensemble AI.
 * Implements client-side throttling and stability smoothing.
 */
export default function useGesturePredictor() {
  const [prediction, setPrediction] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState(null);

  const predHistoryRef = useRef([]);
  const lastCallRef = useRef(0);
  const stableCountRef = useRef(0);
  const lastStablePredictionRef = useRef(null);

  /**
   * smoothPrediction
   * 5-frame sliding window majority vote to filter jitter.
   */
  const smoothPrediction = (newPred) => {
    if (!newPred) return null;
    
    predHistoryRef.current.push(newPred);
    if (predHistoryRef.current.length > 5) {
      predHistoryRef.current.shift();
    }

    const counts = {};
    predHistoryRef.current.forEach(p => {
      counts[p] = (counts[p] || 0) + 1;
    });

    // Return the most frequent prediction in the history
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  };

  const estimateGesture = useCallback(async (landmarks) => {
    console.log("Frontend Input Landmarks:", landmarks);
    
    if (!landmarks || landmarks.length !== 21) {
      console.warn("Input Landmarks length invalid. Check MediaPipe / camera permission");
      setPrediction({ predicted_class: "No Hand Detected", confidence: 0 });
      return null;
    }

    const now = Date.now();
    if (now - lastCallRef.current < THROTTLE_MS) {
      return prediction; 
    }
    lastCallRef.current = now;

    try {
      // 1. Normalize landmarks (subtract wrist coordinates) using standalone fn
      const normalizedLandmarks = normalize(landmarks);

      // Ensure exactly 21 landmarks are sent
      const payloadLandmarks = normalizedLandmarks.slice(0, 21);

      // 6. Ensure no raw landmarks are sent without normalization
      const res = await api.post("/assessment/predict", { landmarks: payloadLandmarks });
      const rawResult = res.data;

      if (!rawResult) throw new Error("Empty response from AI service");

      // 4. Temporarily disable KNN (use CNN only)
      let finalPred = rawResult.cnn_class || rawResult.predicted_class;
      let conf = rawResult.cnn_confidence !== undefined ? rawResult.cnn_confidence : rawResult.confidence;

      // 2. Add confidence threshold (ignore < 0.5)
      // 5. Return "unknown" if confidence low
      if (conf < 0.5) {
        finalPred = "unknown";
      }

      // Apply 5-frame smoothing
      const smoothed = smoothPrediction(finalPred);

      // Require 2 consecutive frames of the SAME smoothed result to trigger a state update
      // This eliminates "prediction flicker" 
      if (smoothed === lastStablePredictionRef.current) {
        stableCountRef.current++;
      } else {
        stableCountRef.current = 0;
        lastStablePredictionRef.current = smoothed;
      }

      const result = {
        ...rawResult,
        predicted_class: smoothed,
        confidence: conf,
        isStable: stableCountRef.current >= 2
      };

      setPrediction(result);
      setError(null);
      return result;

    } catch (err) {
      console.warn("Gesture prediction failed:", err.message);
      setError(err.message);
      return null;
    }
  }, [prediction]);

  /**
   * evaluateGesture — predicts, then scores the result against a target.
   */
  const evaluateGesture = useCallback(
    async (landmarks, targetGesture) => {
      const result = await estimateGesture(landmarks);
      
      if (!result || !targetGesture) return null;

      const target = targetGesture.toUpperCase();
      const predicted = (result.predicted_class || "").toUpperCase();
      const isMatch = predicted === target;

      const evalResult = {
        ...result,
        score: isMatch && result.confidence > 0.6 ? 100 : 0,
        passed: isMatch && result.confidence > 0.6 && result.isStable,
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
    isPredicting: false 
  };
}
