import mediapipe as mp

class HandDetector:
    def __init__(self, static_image_mode=False, max_num_hands=1, min_detection_confidence=0.5, min_tracking_confidence=0.5):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=static_image_mode,
            max_num_hands=max_num_hands,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )
        
    def find_landmarks(self, image_rgb):
        """
        Returns a list of dicts [{'x': val, 'y': val, 'z': val}, ...] for the primary hand.
        If no hand is found, returns None.
        """
        results = self.hands.process(image_rgb)
        
        if results.multi_hand_landmarks:
            # For simplicity, returning the first detected hand (closest/most prominent)
            hand_landmarks = results.multi_hand_landmarks[0]
            landmarks = []
            for lm in hand_landmarks.landmark:
                landmarks.append({'x': lm.x, 'y': lm.y, 'z': lm.z})
            return landmarks
            
        return None
