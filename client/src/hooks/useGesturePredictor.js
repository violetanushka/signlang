import { useState, useCallback, useRef } from "react";
import axios from "axios";

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_URL || "http://localhost:8000";

/**
 * Hook to send landmarks to the Python AI Microservice for prediction or evaluation.
 */
export default function useGesturePredictor() {
  const [prediction, setPrediction] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [error, setError] = useState(null);
  
  // To avoid spamming the backend, we throttle requests
  const lastRequestTime = useRef(0);
  const THROTTLE_MS = 250; // Max 4 FPS sent to server to save resources

  const predictGesture = useCallback(async (landmarks) => {
    if (!landmarks || landmarks.length === 0) return;
    
    // Throttle
    const now = Date.now();
    if (now - lastRequestTime.current < THROTTLE_MS) return;
    lastRequestTime.current = now;

    try {
      setIsPredicting(true);
      setError(null);
      
      const payload = {
        landmarks: landmarks.map(lm => ({ x: lm.x, y: lm.y, z: lm.z }))
      };
      
      const res = await axios.post(`${AI_SERVICE_URL}/api/predict`, payload);
      setPrediction(res.data);
    } catch (err) {
      console.error("Prediction Error:", err);
      setError("AI Service unavailable");
    } finally {
      setIsPredicting(false);
    }
  }, []);

  const evaluateGesture = useCallback(async (landmarks, targetGesture) => {
    if (!landmarks || landmarks.length === 0 || !targetGesture) return null;
    
    const now = Date.now();
    if (now - lastRequestTime.current < THROTTLE_MS) return null;
    lastRequestTime.current = now;

    try {
      setIsPredicting(true);
      setError(null);
      
      const payload = {
        target_gesture: targetGesture,
        landmarks: landmarks.map(lm => ({ x: lm.x, y: lm.y, z: lm.z }))
      };
      
      const res = await axios.post(`${AI_SERVICE_URL}/api/evaluate`, payload);
      setEvaluation(res.data);
      return res.data;
    } catch (err) {
      console.error("Evaluation Error:", err);
      setError("AI Service unavailable");
      return null;
    } finally {
      setIsPredicting(false);
    }
  }, []);

  return {
    prediction,
    evaluation,
    isPredicting,
    error,
    predictGesture,
    evaluateGesture
  };
}
