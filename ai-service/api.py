import os
import pickle
import base64
import io
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import numpy as np
from PIL import Image
from transformers import pipeline

from preprocessing import normalize_landmarks, evaluate_accuracy, heuristic_predict

app = FastAPI(title="Signa AI Service", version="1.0.0")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Models
MODEL_PATH = "model/rf_model.pkl"
rf_model = None
hf_predictor = None
classes = []

@app.on_event("startup")
async def load_models():
    global rf_model, hf_predictor, classes
    
    # 1. Load Random Forest (Practice Mode)
    if os.path.exists(MODEL_PATH):
        try:
            with open(MODEL_PATH, 'rb') as f:
                model_data = pickle.load(f)
                rf_model = model_data.get('model')
                classes = model_data.get('classes', [])
            print(f"✅ RF Model loaded successfully. Classes: {len(classes)}")
        except Exception as e:
            print(f"❌ Error loading RF model: {e}")
            
    # 2. Load Hugging Face Model (Test Mode)
    try:
        print("⏳ Loading Hugging Face CNN Model (Test Mode Upgrade)...")
        hf_predictor = pipeline(
            "image-classification", 
            model="huzaifanasirrr/realtime-sign-language-translator",
            device="cpu" # Force CPU for compatibility
        )
        print("✅ Hugging Face Model loaded successfully.")
    except Exception as e:
        print(f"❌ Error loading Hugging Face model: {e}")

# Request Models
class LandmarkPoint(BaseModel):
    x: float
    y: float
    z: float

class PredictRequest(BaseModel):
    landmarks: List[LandmarkPoint]

class EvaluateRequest(BaseModel):
    landmarks: List[LandmarkPoint]
    target_gesture: str

class PredictImageRequest(BaseModel):
    image: str # Base64 string

@app.get("/health")
def health_check():
    return {
        "status": "ok", 
        "rf_model_loaded": rf_model is not None,
        "hf_model_loaded": hf_predictor is not None
    }

@app.post("/api/predict")
def predict_gesture(request: PredictRequest):
    if rf_model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
        
    landmarks_dict = [{"x": p.x, "y": p.y, "z": p.z} for p in request.landmarks]
    
    # 1. Normalize
    features = normalize_landmarks(landmarks_dict)
    if features is None:
        raise HTTPException(status_code=400, detail="Invalid landmarks data")
        
    # 2. Predict (Requires 2D array)
    features_2d = features.reshape(1, -1)
    
    # Try heuristic first
    h_gesture, h_conf = heuristic_predict(landmarks_dict)
    
    if h_gesture != "Unknown":
        prediction = h_gesture
        # Create mock probabilities where the heuristic choice is dominant
        prob_dict = {str(cls): 0.01 for cls in rf_model.classes_}
        prob_dict[h_gesture] = h_conf
        max_prob = h_conf
    else:
        prediction = rf_model.predict(features_2d)[0]
        probabilities = rf_model.predict_proba(features_2d)[0]
        prob_dict = {str(cls): float(prob) for cls, prob in zip(rf_model.classes_, probabilities)}
        max_prob = float(np.max(probabilities))
    
    return {
        "prediction": str(prediction),
        "confidence": max_prob,
        "probabilities": prob_dict
    }

@app.post("/api/predict_image")
async def predict_image(request: PredictImageRequest):
    if hf_predictor is None:
        raise HTTPException(status_code=503, detail="Hugging Face model not loaded")
        
    try:
        # 1. Decode base64 image
        if "base64," in request.image:
            base64_data = request.image.split("base64,")[1]
        else:
            base64_data = request.image
            
        img_bytes = base64.b64decode(base64_data)
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        
        # 2. Run inference
        results = hf_predictor(img)
        
        # results looks like: [{"label": "A", "score": 0.9}, ...]
        if not results:
            return {"prediction": "Unknown", "confidence": 0.0}
            
        top_result = results[0]
        return {
            "prediction": top_result["label"],
            "confidence": top_result["score"],
            "all_results": results
        }
    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/evaluate")
def evaluate_gesture(request: EvaluateRequest):
    if rf_model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
        
    landmarks_dict = [{"x": p.x, "y": p.y, "z": p.z} for p in request.landmarks]
    
    # 1. Normalize
    features = normalize_landmarks(landmarks_dict)
    if features is None:
        raise HTTPException(status_code=400, detail="Invalid landmarks data")
        
    # 2. Get probabilities
    features_2d = features.reshape(1, -1)
    probabilities = rf_model.predict_proba(features_2d)[0]
    prob_dict = {str(cls): float(prob) for cls, prob in zip(rf_model.classes_, probabilities)}
    
    # 3. Evaluate against target with heuristic override
    feedback = evaluate_accuracy(prob_dict, request.target_gesture.upper(), landmarks_dict)
    
    return feedback

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
