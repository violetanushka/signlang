import numpy as np

class SignClassifier:
    def __init__(self, run_cnn_fn=None):
        self.run_cnn_fn = run_cnn_fn
        
    def predict(self, landmarks, image=None):
        """
        Returns (predicted_class, confidence, top3)
        """
        cls, conf, top3 = None, 0.0, []
        
        # Option A (Preferred): ML Model
        if self.run_cnn_fn and image is not None:
            try:
                cls, conf, top3 = self.run_cnn_fn(image)
                if conf >= 0.55:
                    return cls, conf, top3
            except Exception as e:
                pass
                
        # Option B (Fallback): Rule-based classifier
        h_cls, h_conf = self.heuristic(landmarks)
        
        if h_conf > conf:
            cls = h_cls
            conf = h_conf
            top3 = [{"label": cls, "confidence": conf}]
            
        return cls, conf, top3
        
    def heuristic(self, landmarks):
        if not landmarks or len(landmarks) < 21:
            return "nothing", 0.35
            
        pts = np.array([[lm.get("x",0), lm.get("y",0), lm.get("z",0)] for lm in landmarks])
        tips  = [4, 8, 12, 16, 20]
        bases = [2, 5,  9, 13, 17]
        
        # Basic verticality check
        up = [pts[tips[i]][1] < pts[bases[i]][1] for i in range(5)]
        ti, ii, mi, ri, pi = up
        
        # Horizontal spread check
        thumb_out = abs(pts[4][0] - pts[2][0]) > 0.08
        
        # A: Fist with thumb out
        if thumb_out and not ii and not mi and not ri and not pi:
            return "A", 0.85
            
        # B: All fingers up, thumb sometimes tucked or up
        if ii and mi and ri and pi and not ti: 
            return "B", 0.85
            
        # C: All fingers bent
        bent = [abs(pts[tips[i]][1] - pts[bases[i]][1]) < 0.06 for i in range(1,5)]
        if all(bent):
            return "C", 0.85
            
        # HELLO approximation: Open hand, fingers up, thumb out (salute like)
        if ii and mi and ri and pi and ti:
            # We'll use a slight distinction for THANK YOU below just for testing
            if pts[8][1] < 0.2: # Very high up
                return "HELLO", 0.85
            else:
                return "THANK YOU", 0.82
                
        return "nothing", 0.38
