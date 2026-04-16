import collections
from sign_language.mapping import get_mapping

# State Constants
STATE_IDLE = "IDLE"
STATE_DETECTING = "DETECTING"
STATE_CONFIRMED = "CONFIRMED"

class PredictorPipeline:
    def __init__(self, classifier, history_size=5, confirm_threshold=0.7):
        self.classifier = classifier
        self.history_size = history_size
        self.confirm_threshold = confirm_threshold
        
        self.history = collections.deque(maxlen=history_size)
        self.current_state = STATE_IDLE
        self.confirmed_sign = None
        self.confirmed_conf = 0.0
        
    def process(self, landmarks, image=None):
        """
        Processes a single frame and returns the dynamic outcome.
        """
        # 1. Get raw prediction from ML/Rule classifier
        raw_sign, raw_conf, top3 = self.classifier.predict(landmarks, image)
        
        # 2. Update prediction history
        if raw_conf >= 0.4 and raw_sign and raw_sign != "nothing":
            self.history.append((raw_sign, raw_conf))
        else:
            self.history.append(("nothing", 1.0))
            
        # 3. Smoothing / Majority Vote
        if len(self.history) == 0:
            smoothed_sign = "nothing"
            smoothed_conf = 0.0
        else:
            freq = {}
            for s, c in self.history:
                freq[s] = freq.get(s, 0) + 1
            
            # Find majority
            majority_sign = max(freq, key=freq.get)
            
            # Average confidence of the majority sign
            confs = [c for s, c in self.history if s == majority_sign]
            smoothed_conf = sum(confs) / len(confs) if confs else 0.0
            smoothed_sign = majority_sign
            
        # 4. Trigger Logic (State System)
        if smoothed_sign == "nothing" or smoothed_conf < self.confirm_threshold:
            if self.current_state != STATE_IDLE:
                self.current_state = STATE_DETECTING
            if smoothed_conf < 0.2:
                self.current_state = STATE_IDLE
                self.confirmed_sign = None
        else:
            # We have a stable sign over the threshold
            if freq.get(smoothed_sign, 0) >= (self.history_size // 2) + 1:
                self.current_state = STATE_CONFIRMED
                self.confirmed_sign = smoothed_sign
                self.confirmed_conf = smoothed_conf
            else:
                self.current_state = STATE_DETECTING

        # Evaluate what we return
        final_sign = self.confirmed_sign if self.current_state == STATE_CONFIRMED else smoothed_sign
        final_conf = self.confirmed_conf if self.current_state == STATE_CONFIRMED else smoothed_conf
        
        # 5. Mapping
        mapping = get_mapping(final_sign)
        
        return {
            # Backward compatibility fields
            "predicted_class": final_sign,      
            "confidence": round(final_conf, 4),
            "top3": top3,
            "method": "smoothed_pipeline",
            
            # New specific structured fields
            "detected_sign": final_sign,
            "display_text": mapping["display"],
            "status": "correct" if self.current_state == STATE_CONFIRMED else "detecting",
            "animation": mapping["animation"],
            "state": self.current_state
        }
