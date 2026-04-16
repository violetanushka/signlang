"""
KNN trainer for landmark-based gesture recognition.
Run after collect_dataset.py.
Usage: python train_knn.py
"""
import json
import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import pickle
import os

DATASET_PATH = "./landmark_dataset.json"
MODEL_OUTPUT = "./model/knn_landmarks.pkl"

def normalize_landmarks(flat):
    if len(flat) < 3: return flat
    base_x, base_y, base_z = flat[0], flat[1], flat[2]
    return [flat[i]-base_x if i%3==0 else flat[i]-base_y if i%3==1 else flat[i]-base_z for i in range(len(flat))]

if not os.path.exists(DATASET_PATH):
    print(f"ERROR: {DATASET_PATH} not found.")
    exit(1)

with open(DATASET_PATH) as f:
    data = json.load(f)

# Validate consistency and length
X = []
y = []
for d in data:
    lms = d["landmarks"]
    if len(lms) != 63:
        print(f"WARNING: Skipping sample with length {len(lms)}")
        continue
    X.append(normalize_landmarks(lms))
    y.append(d["label"])

X = np.array(X)
y = np.array(y)

# Warn on class imbalance
classes, counts = np.unique(y, return_counts=True)
for c, count in zip(classes, counts):
    if count < 20:
        print(f"WARNING: Class '{c}' only has {count} samples. Aim for 30+.")

print(f"Dataset: {len(X)} samples, {len(classes)} classes.")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

scaler  = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test  = scaler.transform(X_test)

knn = KNeighborsClassifier(n_neighbors=5, weights="distance", metric="euclidean")
knn.fit(X_train, y_train)

y_pred = knn.predict(X_test)
print("\nClassification Report:")
print(classification_report(y_test, y_pred))
print(f"Test accuracy: {(y_pred == y_test).mean() * 100:.1f}%")

os.makedirs("./model", exist_ok=True)
with open(MODEL_OUTPUT, "wb") as f:
    pickle.dump({"model": knn, "scaler": scaler, "classes": sorted(set(y))}, f)

print(f"\nKNN model saved to {MODEL_OUTPUT}")
