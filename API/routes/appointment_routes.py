from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId

# 👇 ¡AQUÍ ESTÁ LA MAGIA! Importamos 'db' desde tu archivo config.py
from config import db 

appointment_bp = Blueprint("appointments", __name__)

# ==========================================
# 1. OBTENER CITAS
# ==========================================
@appointment_bp.route("/", methods=["GET"], strict_slashes=False)
def get_appointments():
    doctor_id = request.args.get('doctorId')
    
    query = {}
    if doctor_id:
        # Convertimos el ID de texto a ObjectId para que Mongo lo reconozca
        query['doctorId'] = ObjectId(doctor_id) 

    # Ahora 'db' sí existe y sabe que debe buscar en "medisupport"
    citas_cursor = db.appointments.find(query) 
    
    citas_lista = []
    for cita in citas_cursor:
        cita['_id'] = str(cita['_id'])
        cita['doctorId'] = str(cita.get('doctorId'))
        cita['patientId'] = str(cita.get('patientId'))
        citas_lista.append(cita)

    return jsonify({"appointments": citas_lista}), 200

# ==========================================
# 2. ACTUALIZAR ESTADO DE LA CITA
# ==========================================
@appointment_bp.route("/<appointment_id>/status", methods=["PATCH"])
def update_appointment_status(appointment_id):
    data = request.json
    new_status = data.get("status")

    if not new_status:
        return jsonify({"error": "El status es requerido"}), 400

    result = db.appointments.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": new_status}}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Cita no encontrada"}), 404

    return jsonify({"message": f"Estado actualizado a {new_status}"}), 200