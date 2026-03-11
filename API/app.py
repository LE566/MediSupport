from flask import Flask
from flask_cors import CORS

from routes.auth_routes import auth_bp
from routes.appointment_routes import appointment_bp
from routes.ai_routes import ai_bp

app = Flask(__name__)
CORS(app)

# Register routes
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(appointment_bp, url_prefix="/api/appointments")
app.register_blueprint(ai_bp, url_prefix="/api/ai")

@app.route("/")
def home():
    return {"message": "MediSupport API running"}

if __name__ == "__main__":
    app.run(debug=True)