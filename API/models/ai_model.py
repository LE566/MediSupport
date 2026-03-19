import os
import base64
from datetime import datetime, timezone
from bson import ObjectId
from cryptography.fernet import Fernet
from dotenv import load_dotenv

# Asegúrate de importar tu conexión a BD desde donde la tengas configurada (ej. config.py o app.py)
from config import db 

load_dotenv()
clave_env = os.getenv('ENCRYPTION_KEY')

if not clave_env:
    CLAVE_FUNCIONAL = Fernet.generate_key()
    print("⚠️ No se encontró ENCRYPTION_KEY, usando clave temporal.")
else:
    CLAVE_FUNCIONAL = clave_env.encode()

fernet = Fernet(CLAVE_FUNCIONAL)

def cifrar_url_imagen(url: str) -> str:
    try:
        url_cifrada = fernet.encrypt(url.encode())
        return base64.urlsafe_b64encode(url_cifrada).decode()
    except Exception as e:
        print(f"⚠️ Error cifrando URL: {e}")
        return url

def descifrar_url_imagen(url_cifrada: str) -> str:
    try:
        if len(url_cifrada) > 100: # Validación simple
            url_cifrada_bytes = base64.urlsafe_b64decode(url_cifrada.encode())
            return fernet.decrypt(url_cifrada_bytes).decode()
        return url_cifrada
    except Exception as e:
        return url_cifrada

# Colección
predictions_collection = db['predictions']

def save_prediction(prediction_data):
    # Ciframos la URL antes de guardarla
    prediction_data['image_url'] = cifrar_url_imagen(prediction_data['image_url'])
    prediction_data['created_at'] = datetime.now(timezone.utc)
    
    
    result = predictions_collection.insert_one(prediction_data)
    return str(result.inserted_id)

def get_recent_predictions():
    # Obtenemos las más recientes y desciframos la URL para el Frontend
    predictions = list(predictions_collection.find().sort('created_at', -1).limit(20))
    for p in predictions:
        p['_id'] = str(p['_id'])
        p['image_url'] = descifrar_url_imagen(p['image_url'])
    return predictions