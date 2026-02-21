import os
from flask import Flask, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from database.db import db

app = Flask(__name__)
app.config.from_object(Config)

# Allow Frontend (any origin in dev) to call the API
CORS(app)

# JWT setup
jwt = JWTManager(app)

db.init_app(app)
migrate = Migrate(app, db)

# Import models so Flask-Migrate can detect tables
from database import models

# ── Register Blueprints ───────────────────────────────────────────────────────
from auth import auth_bp
from alerts import alerts_bp
from dashboard import dashboard_bp

from chatbot.routes import chatbot_bp
app.register_blueprint(auth_bp,      url_prefix="/api/auth")
app.register_blueprint(alerts_bp,    url_prefix="/api/alerts")
app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
app.register_blueprint(chatbot_bp,   url_prefix="/api/chat")

# ── Load ML Model ─────────────────────────────────────────────────────────────
from ml_engine.inference.model_loader import load_model
# Load model once when Flask starts
load_model()

# ── Health check ──────────────────────────────────────────────────────────────
@app.route('/api/health')
def health():
    return jsonify({"status": "ok", "message": "Mental Health Chatbot API is running"})

# ── 404 / 500 JSON error handlers ─────────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True)
