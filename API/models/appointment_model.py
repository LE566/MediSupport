from config import db
from bson import ObjectId

# Apuntamos a la colección de citas
appointments_collection = db["appointments"]

def get_appointments_by_doctor(doctor_id):
    query = {}
    if doctor_id:
        query['doctorId'] = ObjectId(doctor_id)
    
    # Retorna el cursor de Mongo con los resultados
    return appointments_collection.find(query)

def update_status(appointment_id, new_status):
    # Actualiza el estado en la base de datos
    return appointments_collection.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": new_status}}
    )

def get_appointments_by_patient(patient_id):
    query = {}
    if patient_id:
        query['patientId'] = ObjectId(patient_id)  # ✅ ¡Corregido!
    
    return appointments_collection.find(query)