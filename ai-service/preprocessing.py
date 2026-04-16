import numpy as np
import cv2

MODEL_IMG_SIZE = 224

def preprocess_frame(frame_bgr: np.ndarray) -> np.ndarray:
    """Preprocess a BGR webcam frame for MobileNetV2/ASL.h5 inference."""
    img = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (MODEL_IMG_SIZE, MODEL_IMG_SIZE))
    img = img.astype(np.float32) / 255.0
    img = (img - 0.5) * 2.0
    return np.expand_dims(img, axis=0)

def crop_hand_roi(frame_bgr: np.ndarray, landmarks: list, padding: float = 0.15) -> np.ndarray:
    """Crop a tight region around the hand using MediaPipe landmark bounding box."""
    if not landmarks or len(landmarks) < 21:
        return frame_bgr
    h, w = frame_bgr.shape[:2]
    xs = [lm.get("x", 0) * w for lm in landmarks]
    ys = [lm.get("y", 0) * h for lm in landmarks]
    x1 = max(0, int(min(xs) - padding * w))
    y1 = max(0, int(min(ys) - padding * h))
    x2 = min(w, int(max(xs) + padding * w))
    y2 = min(h, int(max(ys) + padding * h))
    cropped = frame_bgr[y1:y2, x1:x2]
    return cropped if cropped.size > 0 else frame_bgr

def landmarks_to_image(landmarks: list, size: int = 224) -> np.ndarray:
    """Convert 21 MediaPipe hand landmarks to a skeleton image for CNN input."""
    img = np.ones((size, size, 3), dtype=np.uint8) * 255
    if not landmarks or len(landmarks) < 21:
        return img
    pts = []
    for lm in landmarks:
        x = max(0, min(size-1, int(lm.get("x", 0) * size)))
        y = max(0, min(size-1, int(lm.get("y", 0) * size)))
        pts.append((x, y))
    connections = [
        (0,1),(1,2),(2,3),(3,4),(0,5),(5,6),(6,7),(7,8),
        (5,9),(9,10),(10,11),(11,12),(9,13),(13,14),(14,15),(15,16),
        (13,17),(17,18),(18,19),(19,20),(0,17)
    ]
    for a, b in connections:
        if a < len(pts) and b < len(pts):
            cv2.line(img, pts[a], pts[b], (80, 80, 220), 3)
    for i, pt in enumerate(pts):
        cv2.circle(img, pt, 6 if i == 0 else 4, (0,150,255) if i==0 else (50,50,200), -1)
    return img
