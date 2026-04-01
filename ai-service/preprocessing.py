import numpy as np

def normalize_landmarks(landmarks):
    """
    Normalizes 21 3D hand landmarks (x, y, z) into a 42-dimensional 
    feature vector (only using x and y, relative to the wrist).
    """
    if not landmarks or len(landmarks) != 21:
        return None
        
    coords = np.array([[lm['x'], lm['y']] for lm in landmarks])
    
    # 1. Translate points to make the wrist (landmark 0) the origin
    base_x, base_y = coords[0][0], coords[0][1]
    coords[:, 0] -= base_x
    coords[:, 1] -= base_y
    
    # 2. Find the maximum distance from the wrist to any point to scale
    max_value = np.max(np.abs(coords))
    
    if max_value > 0:
        coords = coords / max_value
        
    return coords.flatten()

def get_finger_status(landmarks):
    """
    Returns a list of booleans representing if fingers are extended.
    Indices: 0: Thumb, 1: Index, 2: Middle, 3: Ring, 4: Pinky
    """
    # Landmark indices for finger tips and PIP joints
    tips = [4, 8, 12, 16, 20]
    pips = [2, 6, 10, 14, 18] # Actually using MCP/PIP for better detection
    
    finger_statuses = []
    
    # Thumb (Special case - check x-axis extension relative to index MCP)
    # Using landmark 4 (tip) vs 3 (IP) vs 2 (MCP)
    thumb_is_open = landmarks[4]['x'] > landmarks[3]['x'] + 0.02 if landmarks[4]['x'] > landmarks[0]['x'] else landmarks[4]['x'] < landmarks[3]['x'] - 0.02
    finger_statuses.append(thumb_is_open)
    
    # Other fingers (Compare tip Y to PIP Y - Y is inverted in browser usually)
    for i in range(1, 5):
        # In MediaPipe, Y decreases as you go UP
        is_open = landmarks[tips[i]]['y'] < landmarks[pips[i]]['y']
        finger_statuses.append(is_open)
        
    return finger_statuses

def heuristic_predict(landmarks):
    """
    Predicts gesture based on geometric heuristics for high accuracy in prototype.
    """
    fingers = get_finger_status(landmarks)
    # fingers = [Thumb, Index, Middle, Ring, Pinky]
    
    # Sign 'A': All fingers folded, thumb on the side
    if not any(fingers[1:]):
        return "A", 0.95
        
    # Sign 'B': All fingers extended, thumb folded across palm
    if all(fingers[1:]):
        return "B", 0.95
        
    # Sign 'L': Index and Thumb extended
    if fingers[0] and fingers[1] and not any(fingers[2:]):
        return "L", 0.98
        
    # Sign 'V': Index and Middle extended
    if fingers[1] and fingers[2] and not fingers[0] and not fingers[3] and not fingers[4]:
        return "V", 0.98
        
    # Sign 'C': Heuristic check for curvature is hard with just bitmask, 
    # but we can check if all fingers are partially extended/curved
    # For prototype, if not any of above and many fingers are 'up', we check spacing
    
    return "Unknown", 0.0

def evaluate_accuracy(prediction_proba, target_gesture, landmarks=None):
    """
    Evaluates how confident the model is about a specific target gesture.
    Enhanced with geometric heuristics for the prototype.
    """
    # 1. Try heuristics first if landmarks are provided
    if landmarks:
        h_gesture, h_conf = heuristic_predict(landmarks)
        if h_gesture == target_gesture:
            return {
                "score": int(h_conf * 100),
                "passed": True,
                "top_prediction": h_gesture,
                "message": "Perfect execution!",
                "suggestions": []
            }

    # 2. Fallback to model probability if heuristic didn't match target
    score = prediction_proba.get(target_gesture, 0.0) * 100
    top_gesture = max(prediction_proba, key=prediction_proba.get)
    
    # Override logic for prototype: if target is unknown but user is doing something clear
    if landmarks and score < 50:
        h_gesture, h_conf = heuristic_predict(landmarks)
        if h_gesture != "Unknown":
            top_gesture = h_gesture
            score = 10 # Low score because it's not the target

    feedback = {
        "score": round(score),
        "passed": score >= 70,
        "top_prediction": top_gesture,
    }
    
    if score >= 70:
        feedback["message"] = "Good job!"
        feedback["suggestions"] = []
    else:
        feedback["message"] = f"Keep trying! Looks more like '{top_gesture}'."
        feedback["suggestions"] = ["Check finger positions.", "Ensure your hand is facing the camera."]
            
    return feedback
