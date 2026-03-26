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
        query['patientId'] = ObjectId(patient_id)
    
    return appointments_collection.find(query)

def create_appointment(appointment_data):
    return appointments_collection.insert_one(appointment_data)

def get_appointments_by_doctor_and_date(doctor_id, date_str):
    query = {
        'doctorId': ObjectId(doctor_id),
        'date': date_str,
        'status': {'$in': ['scheduled', 'accepted']} # Solo contamos las ocupadas o en espera
    }
    return appointments_collection.find(query)

def update_appointment(appointment_id, update_fields):
    # Actualiza cualquier campo que le mandemos en el diccionario update_fields
    return appointments_collection.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": update_fields}
    )