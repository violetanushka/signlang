"""
Landmark dataset collector for KNN training.
Usage: python collect_dataset.py
Show a hand sign to the camera, press A-E to label it, press Q to quit and save.
"""
import cv2
import mediapipe as mp
import json
import os
from collections import defaultdict

DATASET_PATH = "./landmark_dataset.json"
TARGET_CLASSES = ['A', 'B', 'C', 'D', 'E']

def normalize_landmarks(flat):
    if len(flat) < 3: return flat
    base_x, base_y, base_z = flat[0], flat[1], flat[2]
    return [flat[i]-base_x if i%3==0 else flat[i]-base_y if i%3==1 else flat[i]-base_z for i in range(len(flat))]

data = []
counts = defaultdict(int)
if os.path.exists(DATASET_PATH):
    with open(DATASET_PATH) as f:
        data = json.load(f)
    for d in data:
        counts[d['label']] += 1
    print(f"Loaded {len(data)} existing samples.")

mp_hands = mp.solutions.hands
hands    = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.6
)
cap = cv2.VideoCapture(0)
print("Press A-E to label current hand pose. Press Q to save and quit.")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    frame  = cv2.flip(frame, 1)
    rgb    = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb)
    coords = []

    if result.multi_hand_landmarks:
        lm = result.multi_hand_landmarks[0]
        # Only take exactly 21
        lms_sliced = lm.landmark[:21]
        if len(lms_sliced) == 21:
            for point in lms_sliced:
                coords.extend([point.x, point.y, point.z])

    stats = " | ".join([f"{k}:{counts[k]}" for k in TARGET_CLASSES])
    cv2.putText(
        frame,
        f"A-E Labels | {stats} | Q:Quit",
        (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2
    )

    cv2.imshow("Signa — Dataset Collector", frame)
    key = cv2.waitKey(1) & 0xFF

    if key == ord('q'):
        under_20 = [k for k in TARGET_CLASSES if counts[k] < 20]
        if under_20:
            print(f"\nWARNING: Classes {under_20} have < 20 samples. Reliable training needs minimum 20!")
        break
    
    char_key = chr(key).upper() if key > 0 else ''
    if char_key in TARGET_CLASSES:
        if len(coords) == 63: # 21 * 3
            norm_coords = normalize_landmarks(coords)
            data.append({"landmarks": norm_coords, "label": char_key})
            counts[char_key] += 1
            print(f"Saved '{char_key}' — {counts[char_key]} samples")
        else:
            print("Cannot save. Hand not strictly detected (21 landmarks).")

cap.release()
cv2.destroyAllWindows()
hands.close()

with open(DATASET_PATH, "w") as f:
    json.dump(data, f)
print(f"Saved {len(data)} samples to {DATASET_PATH}")

