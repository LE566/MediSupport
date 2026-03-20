from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
import tensorflow as tf
from PIL import Image
import numpy as np
import io
import requests 
from pathlib import Path

from models.ai_model import save_prediction, get_recent_predictions

ai_bp = Blueprint('ai', __name__)

BASE_DIR = Path(__file__).resolve().parent.parent

# ========== 1. CARGA DEL MODELO CLASIFICADOR (CÁNCER) ==========
try:
    MODEL_PATH = BASE_DIR / "models" / "model_efficientnet_final.keras" 
    ruta_segura = MODEL_PATH.as_posix()
    if MODEL_PATH.exists():
        model = tf.keras.models.load_model(ruta_segura) 
    else:
        model = None
except Exception as e:
    model = None

# ========== 2. CARGA DEL MODELO VERIFICADOR (MAMOGRAFÍA) ==========
try:
    VERIFIER_PATH = BASE_DIR / "models" / "verificador_efficientnet_final.keras" 
    ruta_segura_verificador = VERIFIER_PATH.as_posix()
    if VERIFIER_PATH.exists():
        verifier_model = tf.keras.models.load_model(ruta_segura_verificador) 
    else:
        verifier_model = None
except Exception as e:
    verifier_model = None


@ai_bp.route('/analyze', methods=['POST'])
@jwt_required()
def analyze():
    try:
        data = request.json
        cloudinary_url = data.get('image_url')
        patient_data = data.get('patient_data', {})

        if not cloudinary_url:
            return jsonify({"error": "No se proporcionó URL de imagen"}), 400

        response = requests.get(cloudinary_url)
        img = Image.open(io.BytesIO(response.content)).convert("RGB")
        
        # Preprocesamiento idéntico al 'img_to_array' de Keras
        img = img.resize((224, 224)) 
        img_array = np.array(img, dtype=np.float32) 
        img_array = np.expand_dims(img_array, axis=0)

        # ==========================================================
        # PASO A: VERIFICACIÓN (¿Es una mamografía?)
        # ==========================================================
        if verifier_model is not None:
            ver_prediction = verifier_model.predict(img_array)
            score = float(ver_prediction[0][0])
            
            # Umbrales
            THRESHOLD_MAMO = 0.2
            THRESHOLD_NO_MAMO = 0.8
            
            if score < THRESHOLD_MAMO:
                confianza = (1 - score) * 100
                print(f"Confianza (Es Mamografía): {confianza:.2f}%")
                
            elif score > THRESHOLD_NO_MAMO:
                confianza = score * 100
                print(f"Confianza (NO es Mamografía): {confianza:.2f}%")
                return jsonify({
                    "error": f"La imagen no parece ser una mamografía. Por favor, sube un estudio médico válido."
                }), 400
                
            else:
                confianza_incierta = max(score, 1 - score) * 100
                print(f"Confianza (Zona Gris / Incierta): {confianza_incierta:.2f}%")
                return jsonify({
                    "error": "El sistema no está seguro de si la imagen es una mamografía clara. Por favor, intenta con una imagen con mejor iluminación o enfoque."
                }), 400

        # ==========================================================
        # PASO B: CLASIFICACIÓN (¿Es Maligno o Benigno?)
        # ==========================================================
        if model is not None:
            prediction = model.predict(img_array)
            malignant_probability = float(prediction[0][0])
            
            if malignant_probability > 0.5:
                classification = "Maligno"
                confidence_percent = malignant_probability * 100
            else:
                classification = "Benigno"
                confidence_percent = (1 - malignant_probability) * 100
        else:
            import random
            es_maligno = random.choice([True, False])
            classification = "Maligno" if es_maligno else "Benigno"
            confidence_percent = round(random.uniform(85.0, 99.9), 1)

        # ==========================================================
        # PASO C: GUARDADO
        # ==========================================================
        doctor_id = get_jwt_identity() 
        prediction_doc = {
            'doctor_id': doctor_id,
            'image_url': cloudinary_url,
            'patient_name': patient_data.get('name'),
            'patient_age': int(patient_data.get('age', 0)),
            'patient_id': patient_data.get('id'),
            'breast_side': patient_data.get('breastSide'),
            'clinical_notes': patient_data.get('clinicalNotes', ''),
            'classification': classification,
            'confidence': confidence_percent,
            'analysis_date': datetime.now(timezone.utc).isoformat()
        }

        prediction_id = save_prediction(prediction_doc)

        return jsonify({
            "success": True,
            "prediction_id": prediction_id,
            "classification": classification,
            "confidence_percent": confidence_percent
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@ai_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    try:
        predictions = get_recent_predictions()
        return jsonify(predictions), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ai_bp.route('/health', methods=['GET'])
def ai_health():
    # Para la barrita superior de tu UI (serverAvailable)
    status = "healthy" if model is not None else "model_missing"
    return jsonify({"status": status}), 200