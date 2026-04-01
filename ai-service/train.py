import os
import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier

# Define the dummy classes (ASL Alphabet A-Z)
CLASSES = [chr(i) for i in range(ord('A'), ord('Z')+1)]

def create_model_dir():
    os.makedirs("model", exist_ok=True)

def train_dummy_model():
    """
    Trains a simple Random Forest model on dummy data.
    In a real scenario, this would load a CSV of collected landmarks.
    """
    print("Training dummy Random Forest Model for prototype...")
    
    # 42 features (21 landmarks * 2 coords)
    num_features = 42
    
    # Generate synthetic data
    # 50 samples per class
    samples_per_class = 50
    X = []
    y = []
    
    for cls in CLASSES:
        # Create a base "pattern" for this class
        base_pattern = np.random.uniform(-1, 1, num_features)
        
        for _ in range(samples_per_class):
            # Add some noise to the base pattern to simulate different people
            noise = np.random.normal(0, 0.2, num_features)
            sample = np.clip(base_pattern + noise, -1, 1)
            
            X.append(sample)
            y.append(cls)
            
    X = np.array(X)
    y = np.array(y)
    
    # Initialize and train model
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X, y)
    
    # Save model and classes list
    create_model_dir()
    
    model_data = {
        'model': clf,
        'classes': clf.classes_.tolist()
    }
    
    with open('model/rf_model.pkl', 'wb') as f:
        pickle.dump(model_data, f)
        
    print(f"Model trained and saved to model/rf_model.pkl")
    print(f"Classes: {len(clf.classes_)}")

if __name__ == "__main__":
    train_dummy_model()
