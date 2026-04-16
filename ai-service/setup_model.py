import os
import sys
import subprocess
import zipfile

KAGGLE_DATASET = "namanmanchanda/asl-detection-99-accuracy"
TARGET_DIR = "./kaggle_model"
H5_PATH = os.path.join(TARGET_DIR, "ASL.h5")
TFLITE_PATH = os.path.join(TARGET_DIR, "ASL.tflite")

def check_kaggle_auth():
    kaggle_json = os.path.expanduser("~/.kaggle/kaggle.json")
    if not os.path.exists(kaggle_json):
        print("❌ Kaggle Authentication not found!")
        print("To download the model automatically, you need a kaggle.json file.")
        print("1. Go to kaggle.com -> Account -> Create New API Token")
        print(f"2. Save the downloaded kaggle.json to: {os.path.expanduser('~/.kaggle/')}")
        print("3. Run this script again.")
        print("\nAlternatively, download the model manually:")
        print(f"URL: https://www.kaggle.com/datasets/{KAGGLE_DATASET}")
        print(f"Place 'ASL.h5' inside: {os.path.abspath(TARGET_DIR)}")
        return False
    return True

def download_model():
    if not os.path.exists(TARGET_DIR):
        os.makedirs(TARGET_DIR)

    if os.path.exists(H5_PATH):
        print(f"✅ Found existing model at {H5_PATH}")
        return True

    print(f"📥 Downloading dataset from {KAGGLE_DATASET}...")
    try:
        subprocess.run(
            ["kaggle", "datasets", "download", "-d", KAGGLE_DATASET, "-p", TARGET_DIR],
            check=True
        )
        zip_path = os.path.join(TARGET_DIR, "asl-detection-99-accuracy.zip")
        
        if os.path.exists(zip_path):
            print("📦 Extracting model...")
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(TARGET_DIR)
            os.remove(zip_path)
            
            # The dataset might put it in a subdirectory, safely move to root
            for root, dirs, files in os.walk(TARGET_DIR):
                for file in files:
                    if file.endswith("ASL.h5"):
                        found_path = os.path.join(root, file)
                        if found_path != H5_PATH:
                            os.rename(found_path, H5_PATH)
            
        print("✅ Download and extraction complete.")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to download from Kaggle using CLI.")
        return False

def convert_to_tflite():
    if os.path.exists(TFLITE_PATH):
        print(f"✅ Found existing TFLite model at {TFLITE_PATH}")
        return
        
    if not os.path.exists(H5_PATH):
        print("❌ Cannot convert to TFLite: ASL.h5 not found.")
        return

    print("🔄 Converting Keras .h5 model to TensorFlow Lite (.tflite)...")
    try:
        import tensorflow as tf
        model = tf.keras.models.load_model(H5_PATH)
        
        # Convert the model
        converter = tf.lite.TFLiteConverter.from_keras_model(model)
        
        # Optimize for size/speed (CPU friendly)
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        # To avoid OOM during inference, we can force float16
        converter.target_spec.supported_types = [tf.float16]
        
        tflite_model = converter.convert()

        # Save the model
        with open(TFLITE_PATH, 'wb') as f:
            f.write(tflite_model)
            
        print(f"✅ Successfully converted and saved TFLite model: {TFLITE_PATH}")
        
    except ImportError:
        print("❌ TensorFlow not installed. Cannot convert to TFLite.")
    except Exception as e:
        print(f"❌ Conversion failed: {e}")

if __name__ == "__main__":
    print("=== Signa AI Model Setup ===")
    if check_kaggle_auth() or os.path.exists(H5_PATH):
        if download_model():
            convert_to_tflite()
    print("=== Done ===")
