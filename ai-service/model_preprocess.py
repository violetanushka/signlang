"""
model_preprocess.py
====================
EXACT copy of the preprocessing logic from:
  asl_recognizer/recognizer.py  (ironcap95/asl-gesture)

DO NOT modify this logic — the model was trained with precisely
this normalization.  Any deviation breaks predictions.

Pipeline:
  1. Accept 21 landmark dicts {x, y, z}  OR a flat 63-length list
  2. Flatten to [x0,y0,z0, x1,y1,z1, ..., x20,y20,z20]
  3. Subtract wrist (index 0) from every coordinate
  4. Divide by max absolute value (scale to [-1, 1])
  5. Return numpy float32 array of shape (63,)
"""

import numpy as np


def preprocess_landmarks(lms):
    """
    Preprocess 21 MediaPipe landmarks before passing to the ASL model.

    Parameters
    ----------
    lms : list
        Either:
          * 21 dicts with keys 'x', 'y', 'z'
          * A flat list/array of length 63  [x0,y0,z0, ...]

    Returns
    -------
    numpy.ndarray, shape (63,), dtype float32
        Normalised landmark vector ready for model.predict().
    """
    # --- Step 1: flatten to length-63 list ---
    if len(lms) == 21:
        flat = []
        for lm in lms:
            if isinstance(lm, dict):
                flat.extend([lm.get("x", 0.0), lm.get("y", 0.0), lm.get("z", 0.0)])
            else:
                # already a sequence [x, y, z]
                flat.extend([float(lm[0]), float(lm[1]), float(lm[2])])
        sample = np.array(flat, dtype=np.float32)
    elif len(lms) == 63:
        sample = np.array(lms, dtype=np.float32)
    else:
        raise ValueError(f"Expected 21 landmarks or 63 floats, got {len(lms)}")

    # --- Step 2: subtract wrist (landmark 0, indices 0-2) ---
    # (EXACT logic from recognizer.py lines 29-34)
    wrist_x, wrist_y, wrist_z = sample[0], sample[1], sample[2]
    for i in range(21):
        sample[i * 3]     -= wrist_x
        sample[i * 3 + 1] -= wrist_y
        sample[i * 3 + 2] -= wrist_z

    # --- Step 3: scale to [-1, 1] by max absolute value ---
    # (EXACT logic from recognizer.py lines 36-38)
    max_val = np.max(np.abs(sample))
    if max_val > 0:
        sample = sample / max_val

    return sample
