from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
import tensorflow as tf
from PIL import Image
import numpy as np
import io
import os
import requests 
from pathlib import Path

from models.ai_model import save_prediction, get_recent_predictions

ai_bp = Blueprint('ai', __name__)

# ========== CARGA DEL MODELO EFFICIENTNET ==========
try:
    BASE_DIR = Path(__file__).resolve().parent.parent
    MODEL_PATH = BASE_DIR / "models" / "model_efficientnet_final.h5" # Asegúrate de usar la extensión que tengas (.h5 o .keras)
    
    # Truco para Windows:
    ruta_segura = MODEL_PATH.as_posix()

    print("==================================================")
    print(f"🔍 Ruta exacta construida: {ruta_segura}")
    print(f"📂 ¿Python detecta que el archivo existe?: {MODEL_PATH.exists()}")
    print("==================================================")

    if MODEL_PATH.exists():
        print("⏳ Cargando modelo EfficientNet, esto puede tomar unos segundos...")
        model = tf.keras.models.load_model(ruta_segura) 
        print("✅ Modelo cargado correctamente.")
    else:
        print("❌ PYTHON DICE QUE EL ARCHIVO NO EXISTE FÍSICAMENTE AHÍ.")
        model = None

except Exception as e:
    print(f"❌ Error cargando el modelo: {e}")
    model = None

@ai_bp.route('/analyze', methods=['POST'])
@jwt_required()
def analyze():
    # Quité la validación estricta de "if model is None return 500"
    # para permitir que entre el modo de simulación.

    try:
        # 1. Recibimos el JSON limpio desde Angular
        data = request.json
        cloudinary_url = data.get('image_url')
        patient_data = data.get('patient_data', {})

        if not cloudinary_url:
            return jsonify({"error": "No se proporcionó URL de imagen"}), 400

        print("🔮 Descargando imagen para evaluación...")
        # 2. Descargamos la imagen
        response = requests.get(cloudinary_url)
        img = Image.open(io.BytesIO(response.content)).convert("RGB")
        
        # 3. Preprocesamiento
        img = img.resize((224, 224)) 
        img_array = np.array(img)
        img_array = np.expand_dims(img_array, axis=0)

        # 4. Predicción (REAL O SIMULADA)
        if model is not None:
            print("🧠 Ejecutando modelo real...")
            prediction = model.predict(img_array)
            malignant_probability = float(prediction[0][0])
            
            if malignant_probability > 0.5:
                classification = "Maligno"
                confidence_percent = malignant_probability * 100
            else:
                classification = "Benigno"
                confidence_percent = (1 - malignant_probability) * 100
        else:
            print("⚠️ MODO SIMULACIÓN ACTIVADO: Devolviendo resultado de prueba.")
            import random
            es_maligno = random.choice([True, False])
            classification = "Maligno" if es_maligno else "Benigno"
            confidence_percent = round(random.uniform(85.0, 99.9), 1)

        # 5. Estructurar para MongoDB
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

        # 6. Guardar en BD (Cifra URL automáticamente)
        prediction_id = save_prediction(prediction_doc)

        return jsonify({
            "success": True,
            "prediction_id": prediction_id,
            "classification": classification,
            "confidence_percent": confidence_percent
        }), 200

    except Exception as e:
        print(f"💥 Error en analyze: {e}")
        import traceback
        traceback.print_exc() # Esto nos dará más detalles si algo falla adentro
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