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
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        print(f"--- MOOD SYNC DEBUG ---")
        print(f"User ID: {user_id}")
        print(f"Request Data: {data}")
        
        if not data or not data.get("mood_label"):
            return jsonify({"error": "Mood label is required"}), 400
            
        new_log = MoodLog(
            user_id=user_id,
            mood_label=data.get("mood_label"),
            mood_emoji=data.get("mood_emoji"),
            note=data.get("note")
        )
        db.session.add(new_log)
        db.session.commit()
        
        return jsonify({
            "message": "Mood logged successfully!",
            "data": new_log.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"ERROR in create_mood_log: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Internal server error", "message": str(e)}), 500
