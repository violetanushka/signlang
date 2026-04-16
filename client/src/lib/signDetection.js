/**
 * lib/signDetection.js
 * Client-side rule-based detection and stabilization logic.
 */

/**
 * detectSignLocally
 * Hand-crafted rules for basic sign language gestures.
 */
export function detectSignLocally(landmarks) {
  if (!landmarks || landmarks.length < 21) return null;

  // Helper: check if finger is 'up' (tip y is less than pip y)
  const fingerUp = (tip, pip) => landmarks[tip].y < landmarks[pip].y;

  // Thumb special check (horizontal fold)
  const isThumbClosed = landmarks[4].x < landmarks[3].x;

  // SIGN A (fist - all fingertips below pip joints)
  if (
    !fingerUp(8, 6) &&
    !fingerUp(12, 10) &&
    !fingerUp(16, 14) &&
    !fingerUp(20, 18)
  ) {
    return "A";
  }

  // SIGN B (all fingers up, thumb in)
  if (
    fingerUp(8, 6) &&
    fingerUp(12, 10) &&
    fingerUp(16, 14) &&
    fingerUp(20, 18) &&
    isThumbClosed
  ) {
    return "B";
  }

  // SIGN C (curved hand - distance between index tip and thumb tip)
  const distance = Math.abs(landmarks[8].x - landmarks[4].x);
  if (distance > 0.05 && distance < 0.15) {
    return "C";
  }

  return null;
}

/**
 * getStablePrediction
 * Implements a sliding window majority vote for stability.
 */
export function getStablePrediction(newPred, buffer = []) {
  if (newPred) {
    buffer.push(newPred);
  } else {
    buffer.push("nothing");
  }

  if (buffer.length > 5) {
    buffer.shift();
  }

  const counts = {};
  buffer.forEach((p) => {
    if (p) counts[p] = (counts[p] || 0) + 1;
  });

  // Find the sign with the highest frequency in the buffer
  return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b), "nothing");
}

/**
 * SIGN_MAP
 * Definitive mapping for Phase 1 gestures.
 */
export const SIGN_MAP = {
  A: { text: "A", animation: "A.gif" },
  B: { text: "B", animation: "B.gif" },
  C: { text: "C", animation: "C.gif" },
  HELLO: { text: "Hello", animation: "hello.gif" },
  THANK_YOU: { text: "Thank You", animation: "thankyou.gif" },
};
