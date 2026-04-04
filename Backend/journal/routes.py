from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import journal_bp
from database.db import db
from database.models import JournalEntry

@journal_bp.route("/entries", methods=["GET"])
@jwt_required()
def get_entries():
    try:
        user_id = int(get_jwt_identity())
        entries = JournalEntry.query.filter_by(user_id=user_id).order_by(JournalEntry.updated_at.desc()).all()
        return jsonify([e.to_dict() for e in entries]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@journal_bp.route("/entries", methods=["POST"])
@jwt_required()
def create_entry():
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data or not data.get("content"):
            return jsonify({"error": "Content is required"}), 400
            
        new_entry = JournalEntry(
            user_id=user_id,
            title=data.get("title", ""),
            content=data.get("content")
        )
        db.session.add(new_entry)
        db.session.commit()
        
        return jsonify({
            "message": "Entry created successfully",
            "entry": new_entry.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@journal_bp.route("/entries/<int:entry_id>", methods=["PUT"])
@jwt_required()
def update_entry(entry_id):
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        entry = JournalEntry.query.filter_by(id=entry_id, user_id=user_id).first()
        if not entry:
            return jsonify({"error": "Entry not found"}), 404
            
        if "title" in data:
            entry.title = data.get("title")
        if "content" in data:
            entry.content = data.get("content")
            
        db.session.commit()
        
        return jsonify({
            "message": "Entry updated successfully",
            "entry": entry.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@journal_bp.route("/entries/<int:entry_id>", methods=["DELETE"])
@jwt_required()
def delete_entry(entry_id):
    try:
        user_id = int(get_jwt_identity())
        entry = JournalEntry.query.filter_by(id=entry_id, user_id=user_id).first()
        
        if not entry:
            return jsonify({"error": "Entry not found"}), 404
            
        db.session.delete(entry)
        db.session.commit()
        
        return jsonify({"message": "Entry deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
