from flask import Blueprint, request, jsonify
from models.user_model import create_user, find_user_by_email, getUsers
from utils.password_utils import hash_password, check_password

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
        "role": data["role"]
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

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": str(user["_id"]),
            "name": user["fullName"],
            "role": user["role"]
        }
    })

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