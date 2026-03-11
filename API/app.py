import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

from routes.auth_routes import auth_bp
from routes.appointment_routes import appointment_bp
from routes.ai_routes import ai_bp

load_dotenv()

app = Flask(__name__)
CORS(app)

# --- CONFIGURACIÓN DE JWT ---
app.config["JWT_SECRET_KEY"] = os.getenv("SECRET_KEY")
jwt = JWTManager(app)

# Register routes
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(appointment_bp, url_prefix="/api/appointments")
app.register_blueprint(ai_bp, url_prefix="/api/ai")

@app.route("/")
def home():
    return {"message": "MediSupport API running"}

if __name__ == "__main__":
    app.run(debug=True)