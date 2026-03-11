from flask import Blueprint

ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/", methods=["GET"])
def ai_test():
    return {"message": "AI route working"}