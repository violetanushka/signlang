import os
import numpy as np
import logging
import math
import base64
import cv2
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MODEL_PATH     = os.getenv("MODEL_PATH", "./kaggle_model/ASL.tflite")
MODEL_IMG_SIZE = 64
CONF_THRESHOLD = float(os.getenv("CONF_THRESHOLD", "0.55"))
CLASSES        = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ") + ["del", "nothing", "space"]

interpreter = None
input_details = None
output_details = None

from sign_language.classifier import SignClassifier
from integration.predictor import PredictorPipeline
predictor_pipeline = None

def load_model_once():
    global interpreter, input_details, output_details, MODEL_IMG_SIZE, predictor_pipeline, model
    if interpreter is not None:
        return
        
    if not os.path.exists(MODEL_PATH):
        logger.warning(f"Model not found at {MODEL_PATH}")
        h5_path = "./model/ASL.h5"
        if os.path.exists(h5_path):
            logger.info(f"Found Keras model at {h5_path}. Attempting to convert to TFLite...")
            try:
                import tensorflow as tf
                model = tf.keras.models.load_model(h5_path)
                converter = tf.lite.TFLiteConverter.from_keras_model(model)
                converter.optimizations = [tf.lite.Optimize.DEFAULT]
                converter.target_spec.supported_types = [tf.float16]
                tflite_model = converter.convert()
                
                os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
                with open(MODEL_PATH, "wb") as f:
                    f.write(tflite_model)
                logger.info(f"Successfully converted and saved TFLite model to {MODEL_PATH}")
            except Exception as e:
                logger.error(f"Conversion failed: {e}")
                return
        else:
            return

    try:
        import tensorflow as tf
        interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
        interpreter.allocate_tensors()
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        # Adapt image size dynamically based on model
        shape = input_details[0]['shape']
        if len(shape) == 4:
            MODEL_IMG_SIZE = shape[1] # Usually NHWC
            
        dummy = np.zeros(shape, dtype=np.float32)
        interpreter.set_tensor(input_details[0]['index'], dummy)
        interpreter.invoke()
        
        logger.info(f"TFLite Model loaded and warmed up with size {MODEL_IMG_SIZE}.")
    except Exception as e:
        logger.error(f"Model load failed: {e}")
        interpreter = None

    classifier = SignClassifier(run_cnn_fn=run_cnn if interpreter else None)
    predictor_pipeline = PredictorPipeline(classifier=classifier, history_size=5, confirm_threshold=CONF_THRESHOLD)
    model = interpreter

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model_once()
    yield

app = FastAPI(title="Signa AI", version="2.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class ImageRequest(BaseModel):
    image: str

class LandmarkRequest(BaseModel):
    landmarks: list

class PredictResponse(BaseModel):
    predicted_class: str
    confidence: float
    top3: list
    method: str
    detected_sign: Optional[str] = None
    display_text: Optional[str] = None
    status: Optional[str] = None
    animation: Optional[str] = None
    state: Optional[str] = None

def decode_image(b64: str) -> np.ndarray:
    if "," in b64:
        b64 = b64.split(",")[1]
    arr = np.frombuffer(base64.b64decode(b64), dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Cannot decode image")
    return img

def preprocess(img_bgr: np.ndarray) -> np.ndarray:
    img = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (MODEL_IMG_SIZE, MODEL_IMG_SIZE))
    img = img.astype(np.float32) / 255.0
    img = (img - 0.5) * 2.0
    return np.expand_dims(img, axis=0)

def landmarks_to_image(landmarks: list, size: int = 224) -> np.ndarray:
    size = MODEL_IMG_SIZE if MODEL_IMG_SIZE > 0 else size
    img = np.ones((size, size, 3), dtype=np.uint8) * 255
    if not landmarks or len(landmarks) < 21:
        return img
    pts = []
    for lm in landmarks:
        x = max(0, min(size-1, int(lm.get("x", 0) * size)))
        y = max(0, min(size-1, int(lm.get("y", 0) * size)))
        pts.append((x, y))
    connections = [(0,1),(1,2),(2,3),(3,4),(0,5),(5,6),(6,7),(7,8),(5,9),(9,10),(10,11),(11,12),(9,13),(13,14),(14,15),(15,16),(13,17),(17,18),(18,19),(19,20),(0,17)]
    for a, b in connections:
        if a < len(pts) and b < len(pts):
            cv2.line(img, pts[a], pts[b], (80, 80, 220), max(1, int(size/70)))
    for i, pt in enumerate(pts):
        cv2.circle(img, pt, max(1, int(size/35) + (2 if i==0 else 0)), (0, 150, 255) if i == 0 else (50, 50, 200), -1)
    return img

def is_curved_hand(landmarks: list) -> bool:
    """
    Heuristic to check if the hand is curved (likely C) vs straight (likely B).
    Calculates avg distance from palm to finger tips.
    """
    if not landmarks or len(landmarks) < 21:
        return False
    
    # Handle both dict and list inputs
    pts = []
    if isinstance(landmarks[0], dict):
        pts = [(lm.get('x',0), lm.get('y',0)) for lm in landmarks]
    else:
        for i in range(0, 63, 3):
            pts.append((landmarks[i], landmarks[i+1]))

    palm = pts[0]
    tips = [pts[4], pts[8], pts[12], pts[16], pts[20]]
    
    avg_dist = sum(math.sqrt((palm[0]-t[0])**2 + (palm[1]-t[1])**2) for t in tips) / 5
    return avg_dist < 0.25

def normalize_landmarks(flat: list) -> list:
    """Substracts wrist (pt 0) from all points to make coordinates relative."""
    if len(flat) < 3:
        return flat
    base_x, base_y, base_z = flat[0], flat[1], flat[2]
    out = []
    for i in range(0, len(flat), 3):
        out.append(flat[i] - base_x)
        out.append(flat[i+1] - base_y)
        out.append(flat[i+2] - base_z)
    return out

def heuristic(landmarks: list) -> tuple:
    if not landmarks or len(landmarks) < 21:
        return "nothing", 0.35
    pts = np.array([[lm.get("x",0), lm.get("y",0), lm.get("z",0)] for lm in landmarks])
    tips  = [4, 8, 12, 16, 20]
    bases = [2, 5,  9, 13, 17]
    up    = [pts[tips[i]][1] < pts[bases[i]][1] for i in range(5)]
    ti, ii, mi, ri, pi = up
    thumb_out = abs(pts[4][0] - pts[2][0]) > 0.08

    if ii and mi and ri and pi and not ti:   return "B", 0.72
    if ii and mi and ri and pi and ti:        return "B", 0.65
    if ii and not mi and not ri and not pi:
        return "D", 0.70 if not thumb_out else "G", 0.65
    if ii and mi and not ri and not pi:       return "V", 0.73
    if thumb_out and not ii and not mi and not ri and not pi: return "A", 0.68
    if not ii and not mi and not ri and not pi and not thumb_out:
        return ("S", 0.65) if pts[4][1] > pts[5][1] else ("A", 0.60)
    if ii and not mi and not ri and pi:
        return ("Y", 0.70) if thumb_out else ("U", 0.60)
    if not ii and not mi and not ri and pi:   return "I", 0.68
    if ii and mi and ri and not pi:           return "W", 0.65
    if not ii and mi and not ri and not pi:   return "D", 0.55
    bent = [abs(pts[tips[i]][1] - pts[bases[i]][1]) < 0.06 for i in range(1,5)]
    if all(bent):                             return "C", 0.63
    return "nothing", 0.38

def run_cnn(img: np.ndarray):
    interpreter.set_tensor(input_details[0]['index'], img)
    interpreter.invoke()
    preds = interpreter.get_tensor(output_details[0]['index'])[0]
    top3idx = np.argsort(preds)[::-1][:3]
    top3    = [{"label": CLASSES[i], "confidence": round(float(preds[i]), 4)} for i in top3idx]
    return CLASSES[top3idx[0]], float(preds[top3idx[0]]), top3

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": interpreter is not None, "classes": len(CLASSES)}

@app.get("/warmup")
def warmup():
    if interpreter is None:
        load_model_once()
    return {"status": "warm" if interpreter is not None else "model_missing"}

@app.post("/predict/image", response_model=PredictResponse)
def predict_image(req: ImageRequest):
    try:
        img = decode_image(req.image)
    except Exception as e:
        raise HTTPException(400, f"Bad image: {e}")
    if "interpreter" in globals() and interpreter is not None:
        try:
            cls, conf, top3 = run_cnn(preprocess(img))
            if conf >= CONF_THRESHOLD:
                return PredictResponse(predicted_class=cls, confidence=round(conf,4), top3=top3, method="cnn")
        except Exception as e:
            logger.warning(f"CNN failed: {e}")
    return PredictResponse(predicted_class="nothing", confidence=0.0, top3=[], method="unavailable")

@app.post("/predict/landmarks", response_model=PredictResponse)
def predict_landmarks(req: LandmarkRequest):
    lms = req.landmarks
    if predictor_pipeline:
        img = None
        if "interpreter" in globals() and interpreter is not None:
            try:
                img = preprocess(landmarks_to_image(lms))
            except Exception:
                pass
        result = predictor_pipeline.process(lms, image=img)
        return PredictResponse(**result)
    
    return PredictResponse(predicted_class="nothing", confidence=0.0, top3=[], method="unavailable")

@app.get("/classes")
def get_classes():
    return {"classes": CLASSES, "count": len(CLASSES)}


# ═══════════════════════════════════════════════════════════════════════════════
# KNN LANDMARK MODEL — Phase 3 secondary classifier
# ═══════════════════════════════════════════════════════════════════════════════
import pickle as _pickle

model = None # Will be set to interpreter below
_knn_bundle = None


def _load_knn():
    """Load KNN model once into module-level cache. Returns None if not available."""
    global _knn_bundle
    if _knn_bundle is not None:
        return _knn_bundle
    knn_path = os.getenv("KNN_MODEL_PATH", "./model/knn_landmarks.pkl")
    if not os.path.exists(knn_path):
        return None
    try:
        with open(knn_path, "rb") as f:
            _knn_bundle = _pickle.load(f)
        logger.info(f"KNN model loaded from {knn_path}")
    except Exception as e:
        logger.warning(f"KNN load failed: {e}")
        _knn_bundle = None
    return _knn_bundle


class EnsembleResponse(BaseModel):
    predicted_class: str
    confidence: float
    cnn_class: Optional[str] = "nothing"
    cnn_confidence: Optional[float] = 0.0
    knn_class: Optional[str] = "nothing"
    knn_confidence: Optional[float] = 0.0
    method: str
    agreement: bool
    models_info: Optional[dict] = None


@app.post("/predict/ensemble", response_model=EnsembleResponse)
def predict_ensemble(req: LandmarkRequest):
    """
    Ensemble prediction using CNN + KNN on landmarks.
    Implements hybrid fallbacks if KNN is missing.
    """
    lms = req.landmarks
    print(f"Landmarks received: {len(lms)}")
    
    if len(lms) < 21:
        return EnsembleResponse(
            predicted_class="no_hand",
            confidence=0.0,
            cnn_class="no_hand",
            cnn_confidence=0.0,
            knn_class="no_hand",
            knn_confidence=0.0,
            method="insufficient_data",
            agreement=False
        )

    h_cls, h_conf = heuristic(lms)
    curved = is_curved_hand(lms)
    
    models_info = {
        "cnn": {"status": "offline", "conf": 0.0},
        "knn": {"status": "offline", "conf": 0.0},
        "heuristic": {"status": "online", "conf": h_conf}
    }

    # ── CNN prediction ────────────────────────────────────────────────────────
    cnn_cls, cnn_conf = "nothing", 0.0
    if "interpreter" in globals() and interpreter is not None:
        try:
            img = preprocess(landmarks_to_image(req.landmarks, MODEL_IMG_SIZE))
            cnn_cls, cnn_conf, _ = run_cnn(img)
            models_info["cnn"] = {"status": "online", "conf": round(cnn_conf, 4)}
        except Exception as e:
            logger.warning(f"CNN failed in ensemble: {e}")
            models_info["cnn"]["status"] = "error"

    # ── KNN prediction ────────────────────────────────────────────────────────
    knn_cls, knn_conf = "nothing", 0.0
    bundle = _load_knn()
    if bundle and len(lms) >= 21:
        try:
            if isinstance(lms[0], dict):
                flat = []
                for lm in lms[:21]:
                    flat.extend([lm.get("x", 0), lm.get("y", 0), lm.get("z", 0)])
            else:
                flat = [float(v) for v in lms[:63]]
            
            # Normalize before KNN
            flat = normalize_landmarks(flat)

            arr     = np.array(flat).reshape(1, -1)
            arr     = bundle["scaler"].transform(arr)
            knn_cls = bundle["model"].predict(arr)[0]
            proba   = bundle["model"].predict_proba(arr)[0]
            classes = bundle["model"].classes_
            
            # SAFE CONFIDENCE LOOKUP
            if knn_cls in classes:
                idx = list(classes).index(knn_cls)
                knn_conf = float(proba[idx])
            else:
                knn_conf = 0.0
            
            models_info["knn"] = {"status": "online", "conf": round(knn_conf, 4)}
        except Exception as e:
            logger.warning(f"KNN failed: {e}")
            models_info["knn"]["status"] = "error"
    else:
        models_info["knn"]["status"] = "missing"

    # ── Ensemble decision ─────────────────────────────────────────────────────
    agreement = False
    
    # HEURISTIC OVERRIDE: B vs C
    if knn_cls == "B" and curved:
        knn_cls = "C"
        knn_conf = max(knn_conf, 0.65)

    if bundle and models_info["knn"]["status"] == "online":
        # FULL ENSEMBLE MODE
        agreement = (cnn_cls == knn_cls) and cnn_cls != "nothing"
        
        if agreement:
            final_cls  = cnn_cls
            final_conf = min(0.98, (cnn_conf + knn_conf) / 2 + 0.10)
            method     = "ensemble_agree"
        elif cnn_conf >= 0.55:
            final_cls  = cnn_cls
            final_conf = cnn_conf
            method     = "cnn_primary"
        elif knn_conf >= 0.65:
            final_cls  = knn_cls
            final_conf = knn_conf
            method     = "knn_fallback"
        else:
            final_cls, final_conf = h_cls, h_conf
            method = "heuristic_fallback"
    else:
        # HYBRID MODE: CNN + HEURISTIC
        agreement = (cnn_cls == h_cls) and cnn_cls != "nothing"
        
        if agreement:
            final_cls  = cnn_cls
            final_conf = min(0.95, cnn_conf + 0.15)
            method     = "cnn_heuristic_agree"
        elif cnn_conf >= 0.50:
            final_cls  = cnn_cls
            final_conf = cnn_conf
            method     = "cnn_only"
        else:
            final_cls, final_conf = h_cls, h_conf
            method = "heuristic_only"

    if final_conf < 0.5:
        final_cls = "unknown"

    return EnsembleResponse(
        predicted_class=final_cls,
        confidence=round(final_conf, 4),
        cnn_class=cnn_cls,
        cnn_confidence=round(cnn_conf, 4),
        knn_class=knn_cls,
        knn_confidence=round(knn_conf, 4),
        method=method,
        agreement=agreement,
        models_info=models_info
    )


@app.get("/knn/status")
def knn_status():
    """Returns whether the KNN model is loaded and which classes it knows."""
    bundle = _load_knn()
    return {
        "loaded":      bundle is not None,
        "classes":     bundle["classes"] if bundle else [],
        "class_count": len(bundle["classes"]) if bundle else 0,
    }
