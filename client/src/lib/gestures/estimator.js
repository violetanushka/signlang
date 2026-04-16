import * as fp from "fingerpose";
import { ASL_GESTURES } from "./definitions";

// Initialize the Fingerpose Gesture Estimator with our ASL definitions
const GE = new fp.GestureEstimator(ASL_GESTURES);

/**
 * estimateSign
 * Converts MediaPipe landmarks {x, y, z} to Fingerpose format [[x, y, z]]
 * and returns the best matching gesture.
 */
export function estimateSign(landmarks, threshold = 7.5) {
  if (!landmarks || landmarks.length < 21) return null;

  // Convert MediaPipe object landmarks to array landmarks for fingerpose
  const convertedLandmarks = landmarks.map(lm => [lm.x, lm.y, lm.z]);

  const estimation = GE.estimate(convertedLandmarks, threshold);

  if (estimation.gestures && estimation.gestures.length > 0) {
    // Find the gesture with the highest score
    const best = estimation.gestures.reduce((a, b) => (a.confidence > b.confidence ? a : b));
    
    return {
      sign: best.name,
      confidence: best.confidence / 10 // Convert 0-10 score to 0.0-1.0
    };
  }

  return null;
}
