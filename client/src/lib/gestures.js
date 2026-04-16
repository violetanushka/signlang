/**
 * Gesture Dataset for Signa AI
 * Maps A-Z letters to ASL reference image URLs (Wikipedia commons - reliable CDN)
 * Maps common words to their constituent letters for step-by-step learning
 */

// Public domain ASL alphabet images from Wikimedia Commons
const BASE = "https://upload.wikimedia.org/wikipedia/commons/thumb";

export const GESTURE_IMAGES = {
  A: `${BASE}/7/7e/Sign_language_A.svg/120px-Sign_language_A.svg.png`,
  B: `${BASE}/b/b3/Sign_language_B.svg/120px-Sign_language_B.svg.png`,
  C: `${BASE}/9/9e/Sign_language_C.svg/120px-Sign_language_C.svg.png`,
  D: `${BASE}/7/71/Sign_language_D.svg/120px-Sign_language_D.svg.png`,
  E: `${BASE}/e/ea/Sign_language_E.svg/120px-Sign_language_E.svg.png`,
  F: `${BASE}/4/4d/Sign_language_F.svg/120px-Sign_language_F.svg.png`,
  G: `${BASE}/a/ab/Sign_language_G.svg/120px-Sign_language_G.svg.png`,
  H: `${BASE}/2/21/Sign_language_H.svg/120px-Sign_language_H.svg.png`,
  I: `${BASE}/8/8e/Sign_language_I.svg/120px-Sign_language_I.svg.png`,
  J: `${BASE}/a/a5/Sign_language_J.svg/120px-Sign_language_J.svg.png`,
  K: `${BASE}/5/5c/Sign_language_K.svg/120px-Sign_language_K.svg.png`,
  L: `${BASE}/1/1b/Sign_language_L.svg/120px-Sign_language_L.svg.png`,
  M: `${BASE}/5/5e/Sign_language_M.svg/120px-Sign_language_M.svg.png`,
  N: `${BASE}/d/d3/Sign_language_N.svg/120px-Sign_language_N.svg.png`,
  O: `${BASE}/c/c3/Sign_language_O.svg/120px-Sign_language_O.svg.png`,
  P: `${BASE}/0/04/Sign_language_P.svg/120px-Sign_language_P.svg.png`,
  Q: `${BASE}/1/1e/Sign_language_Q.svg/120px-Sign_language_Q.svg.png`,
  R: `${BASE}/2/24/Sign_language_R.svg/120px-Sign_language_R.svg.png`,
  S: `${BASE}/7/77/Sign_language_S.svg/120px-Sign_language_S.svg.png`,
  T: `${BASE}/b/b3/Sign_language_T.svg/120px-Sign_language_T.svg.png`,
  U: `${BASE}/f/f5/Sign_language_U.svg/120px-Sign_language_U.svg.png`,
  V: `${BASE}/2/23/Sign_language_V.svg/120px-Sign_language_V.svg.png`,
  W: `${BASE}/f/f3/Sign_language_W.svg/120px-Sign_language_W.svg.png`,
  X: `${BASE}/4/43/Sign_language_X.svg/120px-Sign_language_X.svg.png`,
  Y: `${BASE}/5/5b/Sign_language_Y.svg/120px-Sign_language_Y.svg.png`,
  Z: `${BASE}/4/46/Sign_language_Z.svg/120px-Sign_language_Z.svg.png`,
  // Special gestures (no standard image - will use emoji fallback)
  SPACE: null,
  DEL: null,
  NOTHING: null,
};

/**
 * ASL fingerspelling instructions per letter
 */
export const LETTER_INSTRUCTIONS = {
  A: "A → Close fingers into a fist, thumb on side.",
  B: "B → Open palm, all fingers straight up, thumb tucked inward.",
  C: "C → Curve your fingers and thumb to form a perfect 'C' shape.",
  D: "D → Point your index finger up, touch other fingers to your thumb.",
  E: "E → Curl all fingers and thumb tightly against your palm.",
  F: "Touch index finger to thumb; other three fingers point up.",
  G: "Point index finger sideways, thumb parallel to it.",
  H: "Point index and middle finger together sideways.",
  I: "Raise only the pinky finger; rest in a fist.",
  J: "Raise pinky; draw a 'J' curve in the air.",
  K: "Index and middle finger point up in a 'V'; thumb between them.",
  L: "Extend index finger up, thumb out; like an 'L' shape.",
  M: "Tuck three fingers over thumb.",
  N: "Tuck two fingers over thumb.",
  O: "Curve all fingers to touch thumb forming an 'O'.",
  P: "Like 'K' but pointing downward.",
  Q: "Like 'G' but pointing downward.",
  R: "Cross your index and middle fingers.",
  S: "Make a fist with thumb over fingers.",
  T: "Thumb between index and middle fingers in a fist.",
  U: "Index and middle finger point straight up together.",
  V: "Index and middle finger spread in a 'V' shape.",
  W: "Spread index, middle, and ring fingers in a 'W'.",
  X: "Hook your index finger into a claw.",
  Y: "Extend thumb and pinky, curl other fingers.",
  Z: "Draw a 'Z' in the air with your index finger.",
  SPACE: "Indicate a space/break between words.",
  DEL: "Delete gesture — brush fingers across palm.",
  NOTHING: "Neutral resting hand position.",
};

/**
 * Common ASL words mapped to their fingerspelling letter sequence.
 * For phrases the AI doesn't natively support.
 */
export const WORD_LETTER_MAP = {
  HELLO: ["H", "E", "L", "L", "O"],
  "THANK YOU": ["T", "H", "A", "N", "K", "Y", "O", "U"],
  THANKS: ["T", "H", "A", "N", "K", "S"],
  GOODBYE: ["G", "O", "O", "D", "B", "Y", "E"],
  YES: ["Y", "E", "S"],
  NO: ["N", "O"],
  PLEASE: ["P", "L", "E", "A", "S", "E"],
  SORRY: ["S", "O", "R", "R", "Y"],
  LOVE: ["L", "O", "V", "E"],
  HELP: ["H", "E", "L", "P"],
  GOOD: ["G", "O", "O", "D"],
  BAD: ["B", "A", "D"],
  FOOD: ["F", "O", "O", "D"],
  WATER: ["W", "A", "T", "E", "R"],
  HOME: ["H", "O", "M", "E"],
  SCHOOL: ["S", "C", "H", "O", "O", "L"],
  FRIEND: ["F", "R", "I", "E", "N", "D"],
  FAMILY: ["F", "A", "M", "I", "L", "Y"],
  LEARN: ["L", "E", "A", "R", "N"],
  SIGN: ["S", "I", "G", "N"],
  NAME: ["N", "A", "M", "E"],
  WHAT: ["W", "H", "A", "T"],
  MY: ["M", "Y"],
  YOU: ["Y", "O", "U"],
  ME: ["M", "E"],
  EAT: ["E", "A", "T"],
};

/**
 * Supported AI classes (what the TFLite model can detect)
 */
export const AI_SUPPORTED = new Set([
  ...Object.keys(GESTURE_IMAGES).filter((k) => !["SPACE", "DEL", "NOTHING"].includes(k)),
  "HELLO",
  "THANK YOU",
]);

/**
 * Given a lesson content value, figure out its type and letter sequence.
 * @param {string} value - e.g. "A", "Hello", "Thank You"
 * @returns {{ type: 'letter'|'word', letters: string[], displayValue: string }}
 */
export function getLessonGestureInfo(value) {
  if (!value) return { type: "letter", letters: ["A"], displayValue: "A" };

  const upper = value.toUpperCase().trim();

  // Single letter
  if (upper.length === 1 && /[A-Z]/.test(upper)) {
    return { type: "letter", letters: [upper], displayValue: upper };
  }

  // Known word mapping
  if (WORD_LETTER_MAP[upper]) {
    return { type: "word", letters: WORD_LETTER_MAP[upper], displayValue: value };
  }

  // Unknown word — fingerspell each letter
  const letters = upper
    .replace(/[^A-Z]/g, "")
    .split("")
    .filter((l) => /[A-Z]/.test(l));

  if (letters.length > 0) {
    return { type: "word", letters, displayValue: value };
  }

  // Final fallback
  return { type: "letter", letters: [upper.charAt(0) || "A"], displayValue: upper };
}
