from flask import Blueprint, request, jsonify
# 👇 Importamos las funciones desde tu nuevo modelo
from models.appointment_model import get_appointments_by_doctor, update_status

appointment_bp = Blueprint("appointments", __name__)

# ==========================================
# 1. OBTENER CITAS
# ==========================================
@appointment_bp.route("/", methods=["GET"], strict_slashes=False)
def get_appointments():
    doctor_id = request.args.get('doctorId')
    
    # Llamamos al modelo en lugar de a la base de datos directamente
    citas_cursor = get_appointments_by_doctor(doctor_id)
    
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
@appointment_bp.route("/<appointment_id>/status", methods=["PATCH"], strict_slashes=False)
def update_appointment_status(appointment_id):
    data = request.json
    new_status = data.get("status")

    if not new_status:
        return jsonify({"error": "El status es requerido"}), 400

    # Llamamos al modelo para actualizar
    result = update_status(appointment_id, new_status)

    if result.matched_count == 0:
        return jsonify({"error": "Cita no encontrada"}), 404

    return jsonify({"message": f"Estado actualizado a {new_status}"}), 200