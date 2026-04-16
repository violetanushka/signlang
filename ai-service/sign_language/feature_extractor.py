import numpy as np

def normalize_landmarks(landmarks):
    """
    Normalizes hand landmarks relative to the wrist (landmark 0) 
    and scales them to be distance-invariant.
    Returns flattened feature vector.
    """
    if not landmarks or len(landmarks) != 21:
        return None
        
    try:
        if isinstance(landmarks[0], dict):
            pts = np.array([[lm.get('x', 0), lm.get('y', 0), lm.get('z', 0)] for lm in landmarks], dtype=np.float32)
        else:
            # Handle object format from client if needed, or already normalized
            pass
    except Exception:
        return None

    # Handle if client already sent 'pts' format from heuristic
    if not isinstance(landmarks[0], dict):
        pts = np.array([[lm.get("x",0), lm.get("y",0), lm.get("z",0)] for lm in landmarks], dtype=np.float32)

    # Translate points so the wrist (index 0) is at the origin (0,0,0)
    wrist = pts[0]
    translated_pts = pts - wrist
    
    # Scale points so the maximum distance from wrist is 1
    max_dist = np.max(np.linalg.norm(translated_pts, axis=1))
    if max_dist > 0:
        normalized_pts = translated_pts / max_dist
    else:
        normalized_pts = translated_pts
        
    return normalized_pts.flatten().tolist()
