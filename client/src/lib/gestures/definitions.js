import * as fp from "fingerpose";

const { GestureDescription, Finger, FingerCurl, FingerDirection } = fp;

// ─── SIGN A (Fist) ───────────────────────────────────────────────────────────
export const ASign = new GestureDescription("A");

// All fingers fully curled
[Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky].forEach((finger) => {
  ASign.addCurl(finger, FingerCurl.FullCurl, 1.0);
  ASign.addCurl(finger, FingerCurl.HalfCurl, 0.9);
});

// Thumb should be resting sideways (roughly pointing up or sideways)
ASign.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1.0);
ASign.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.9);
ASign.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.9);


// ─── SIGN B (Flat Hand) ───────────────────────────────────────────────────────
export const BSign = new GestureDescription("B");

// All fingers completely straight
[Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky].forEach((finger) => {
  BSign.addCurl(finger, FingerCurl.NoCurl, 1.0);
});

// Fingers should be pointing up
[Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky].forEach((finger) => {
    BSign.addDirection(finger, FingerDirection.VerticalUp, 1.0);
});

// Thumb usually tucked in across palm
BSign.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.5);
BSign.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.5);


// ─── SIGN C (Curved Hand) ─────────────────────────────────────────────────────
export const CSign = new GestureDescription("C");

// All fingers half-curled or at least curved
[Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky].forEach((finger) => {
  CSign.addCurl(finger, FingerCurl.HalfCurl, 1.0);
});

// Thumb also curved
CSign.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);

// Fingers generally pointing diagonally up
CSign.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.5);
CSign.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.5);
CSign.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 0.5);
CSign.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 0.5);

export const ASL_GESTURES = [ASign, BSign, CSign];
