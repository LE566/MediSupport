from flask import Blueprint

appointment_bp = Blueprint("appointments", __name__)

@appointment_bp.route("/", methods=["GET"])
def get_appointments():
    return {"message": "Appointments route working"}