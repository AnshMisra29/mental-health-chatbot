import os
os.environ["OMP_NUM_THREADS"] = "1"
from flask import Flask, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from database.db import db
from database.db import db
from database.models import User, CommunityPost, MoodLog, JournalEntry  # Explicitly import models for db.create_all()
from notifications import mail


# Flask setup
app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for all routes and allow common development headers/methods
from flask_cors import CORS
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# JWT setup
jwt = JWTManager(app)

# Database & Mail setup
db.init_app(app)
migrate = Migrate(app, db)
mail.init_app(app)

with app.app_context():
    # Safely create all missing tables (this is additive and non-destructive)
    db.create_all()
    print("--- BACKEND SYNC ACTIVE: Database Tables Verified ---")




# Import models so Flask-Migrate can detect tables
from database import models

# ── Register Blueprints ───────────────────────────────────────────────────────
from auth import auth_bp
from alerts import alerts_bp
from dashboard import dashboard_bp
from doctors import doctors_bp
from chatbot.routes import chatbot_bp
from mood import mood_bp
from community import community_bp
from journal import journal_bp



app.register_blueprint(auth_bp,      url_prefix="/api/auth")
app.register_blueprint(alerts_bp,    url_prefix="/api/alerts")
app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
app.register_blueprint(doctors_bp,   url_prefix="/api/doctors")
app.register_blueprint(chatbot_bp,   url_prefix="/api/chat")
app.register_blueprint(mood_bp,      url_prefix="/api/mood",      strict_slashes=False)
app.register_blueprint(community_bp, url_prefix="/api/community", strict_slashes=False)
app.register_blueprint(journal_bp,   url_prefix="/api/journal",   strict_slashes=False)


# ── Load ML Model ─────────────────────────────────────────────────────────────
from ml_engine.inference.model_loader import load_model_async, model_loader
# Load model in background so Flask starts instantly
load_model_async()

# ── Root route ────────────────────────────────────────────────────────────────
@app.route('/')
def index():
    return jsonify({
        "status": "online",
        "message": "Mental Health Chatbot API is running",
        "model_ready": model_loader.is_ready,
        "endpoints": {
            "health": "/api/health",
            "status": "/api/status",
            "chat": "/api/chat/message",
            "auth": "/api/auth/*",
            "alerts": "/api/alerts/*",
            "dashboard": "/api/dashboard/*"
        }
    })

# ── Status check ──────────────────────────────────────────────────────────────
@app.route('/api/status')
def status():
    return jsonify({
        "ready": model_loader.is_ready,
        "device": str(model_loader.device),
        "error": model_loader.error
    })

# ── Health check ──────────────────────────────────────────────────────────────
@app.route('/api/health')
def health():
    return jsonify({
        "status": "ok", 
        "message": "Mental Health Chatbot API is running",
        "model_ready": model_loader.is_ready
    })

# ── 404 / 500 JSON error handlers ─────────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")
