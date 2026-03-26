from datetime import datetime
from flask import Blueprint, request, jsonify
from models.appointment_model import (
    get_appointments_by_doctor, 
    update_status, 
    get_appointments_by_patient, 
    create_appointment, 
    get_appointments_by_doctor_and_date,
    update_appointment # 👈 CORREGIDO: Importamos update_appointment
)
from bson import ObjectId

appointment_bp = Blueprint("appointments", __name__)

# ==========================================
# 1. OBTENER CITAS
# ==========================================
@appointment_bp.route("/", methods=["GET"], strict_slashes=False)
def get_appointments():
    doctor_id = request.args.get('doctorId')
    
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

    result = update_status(appointment_id, new_status)

    if result.matched_count == 0:
        return jsonify({"error": "Cita no encontrada"}), 404

    return jsonify({"message": f"Estado actualizado a {new_status}"}), 200

# ==========================================
# 3. OBTENER CITAS DE UN PACIENTE
# ==========================================
@appointment_bp.route("/patient", methods=["GET"], strict_slashes=False)
def get_patient_appointments():
    patient_id = request.args.get('patientId')
    
    citas_cursor = get_appointments_by_patient(patient_id)
    
    citas_lista = []
    for cita in citas_cursor:
        cita['_id'] = str(cita['_id'])
        cita['doctorId'] = str(cita.get('doctorId'))
        cita['patientId'] = str(cita.get('patientId'))
        citas_lista.append(cita)

    return jsonify({"appointments": citas_lista}), 200

# ==========================================
# 4. AGREGAR CITA
# ==========================================
@appointment_bp.route("/", methods=["POST"], strict_slashes=False)
def add_appointment():
    data = request.json
    
    if not all(k in data for k in ("doctorId", "patientId", "date", "time")):
        return jsonify({"error": "Faltan datos requeridos"}), 400

    new_appointment = {
        "doctorId": ObjectId(data["doctorId"]),
        "patientId": ObjectId(data["patientId"]),
        "date": data["date"],           
        "time": data["time"],           
        "specialty": data.get("reason", "Revisión General"),
        "status": "scheduled",          
        "created_at": datetime.utcnow()
    }

    result = create_appointment(new_appointment)
    
    return jsonify({
        "message": "Cita solicitada exitosamente", 
        "id": str(result.inserted_id)
    }), 201

# ==========================================
# 5. HORARIOS DISPONIBLES
# ==========================================
@appointment_bp.route("/available-times", methods=["GET"], strict_slashes=False)
def get_available_times():
    doctor_id = request.args.get('doctorId')
    date_str = request.args.get('date')

    if not doctor_id or not date_str:
        return jsonify({"error": "Faltan parámetros de doctor o fecha"}), 400

    horario_completo = [
        "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
        "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
        "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"
    ]

    citas_ocupadas = get_appointments_by_doctor_and_date(doctor_id, date_str)
    horas_ocupadas = [cita.get('time') for cita in citas_ocupadas]
    horas_libres = [hora for hora in horario_completo if hora not in horas_ocupadas]

    return jsonify({"available_times": horas_libres}), 200

# ==========================================
# 6. REAGENDAR CITA
# ==========================================
@appointment_bp.route("/reschedule/<appointment_id>", methods=["PATCH", "PUT"], strict_slashes=False)
def reschedule_appointment(appointment_id):
    data = request.json
    new_date = data.get("date")
    new_time = data.get("time")

    if not new_date or not new_time:
        return jsonify({"error": "Faltan datos de fecha u hora"}), 400

    update_fields = {
        "date": new_date,
        "time": new_time,
        "status": "accepted" 
    }

    result = update_appointment(appointment_id, update_fields)

    if result.matched_count == 0:
        return jsonify({"error": "Cita no encontrada"}), 404

    return jsonify({"message": "Cita reagendada exitosamente"}), 200