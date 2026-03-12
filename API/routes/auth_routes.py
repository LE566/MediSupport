from flask import Blueprint, request, jsonify
from utils.password_utils import hash_password, check_password
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user_model import create_user, find_user_by_email, getUsers, update_user_profile

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    user = find_user_by_email(data["email"])

    if user:
        return jsonify({"error": "User already exists"}), 400

    new_user = {
        "fullName": data["fullName"],
        "email": data["email"],
        "password": hash_password(data["password"]),
        "role": data["role"],
        "avatarUrl": "https://ionicframework.com/docs/img/demos/avatar.svg"
    }

    create_user(new_user)
    return jsonify({"message": "User created"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    user = find_user_by_email(data["email"])

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    if not check_password(data["password"], user["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    # --- CREAR EL TOKEN JWT ---
    # Usamos el ID de MongoDB como la "identidad" de esta sesión
    access_token = create_access_token(identity=str(user["_id"]))

    return jsonify({
    "message": "Login successful",
    "access_token": access_token,
    "user": {
        "id": str(user["_id"]),
        "name": user["fullName"],
        "email": user["email"],
        "role": user["role"],
        "avatarUrl": user.get(
            "avatarUrl",
            "https://ionicframework.com/docs/img/demos/avatar.svg"
        )
    }
}), 200


@auth_bp.route("/users", methods=["GET"])
def get_users():
    users = []
    for user in getUsers():
        users.append({
            "id": str(user["_id"]),
            "fullName": user.get("fullName"),
            "email": user.get("email"),
            "role": user.get("role")
        })
    return jsonify(users), 200

@auth_bp.route("/update-profile", methods=["PUT"])
@jwt_required() 
def update_profile():
    
    current_user_id = get_jwt_identity()
    data = request.json

    update_user_profile(current_user_id, data)

    return jsonify({"message": "Perfil actualizado correctamente"}), 200