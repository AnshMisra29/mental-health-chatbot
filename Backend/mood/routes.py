from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import mood_bp
from database.db import db
from database.models import MoodLog

@mood_bp.route("/logs", methods=["GET"])
@jwt_required()
def get_mood_logs():
    user_id = int(get_jwt_identity())
    logs = MoodLog.query.filter_by(user_id=user_id).order_by(MoodLog.timestamp.asc()).all()
    return jsonify({"data": [l.to_dict() for l in logs]}), 200

@mood_bp.route("/logs", methods=["POST"])
@jwt_required()
def create_mood_log():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data or not data.get("mood_label"):
        return jsonify({"error": "Missing mood label"}), 400
        
    log = MoodLog(
        user_id=user_id,
        mood_label=data.get("mood_label"),
        mood_emoji=data.get("mood_emoji"),
        note=data.get("note")
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({"message": "Mood logged successfully", "data": log.to_dict()}), 201
