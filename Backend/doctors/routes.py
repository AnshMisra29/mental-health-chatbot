from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import math

from doctors import doctors_bp
from database.db import db
from database.models import Doctor, User, AlertLog
from notifications.email_service import send_doctor_alert, send_patient_confirmation

def calculate_distance(lat1, lon1, lat2, lon2):
    """Haversine formula to calculate distance in km."""
    if not all([lat1, lon1, lat2, lon2]):
        return 9999
    R = 6371  # Earth radius
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@doctors_bp.route('/', methods=['POST'])
@jwt_required()
def add_doctor():
    """Register a new doctor (Admin endpoint)."""
    data = request.get_json()
    try:
        doctor = Doctor(
            name=data['name'],
            email=data['email'],
            phone=data.get('phone'),
            specialization=data.get('specialization'),
            clinic_name=data.get('clinic_name'),
            address=data.get('address'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude')
        )
        db.session.add(doctor)
        db.session.commit()
        return jsonify({"message": "Doctor added successfully", "doctor": doctor.to_dict()}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@doctors_bp.route('/', methods=['GET'])
@jwt_required()
def list_doctors():
    """List all doctors."""
    doctors = Doctor.query.all()
    return jsonify([d.to_dict() for d in doctors]), 200

@doctors_bp.route('/nearby', methods=['GET'])
@jwt_required()
def get_nearby_doctors():
    """Find top 3 nearby doctors based on lat/lon query params."""
    try:
        user_lat = request.args.get('lat', type=float)
        user_lon = request.args.get('lon', type=float)

        if user_lat is None or user_lon is None:
            # Fallback: return any 3 doctors if location missing
            doctors = Doctor.query.limit(3).all()
            return jsonify({"doctors": [d.to_dict() for d in doctors]}), 200

        all_doctors = Doctor.query.all()
        # Sort by distance
        sorted_doctors = sorted(
            all_doctors, 
            key=lambda d: calculate_distance(user_lat, user_lon, d.latitude, d.longitude)
        )
        
        nearby = []
        for d in sorted_doctors[:3]:
            dist = calculate_distance(user_lat, user_lon, d.latitude, d.longitude)
            nearby.append(d.to_dict(distance_km=dist))

        return jsonify({"doctors": nearby}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@doctors_bp.route('/select', methods=['POST'])
@jwt_required()
def select_doctor():
    """User selects a doctor -> fire emails and mark alert notified."""
    data = request.get_json()
    doctor_id = data.get('doctor_id')
    alert_id = data.get('alert_id')
    user_id = get_jwt_identity()

    if not all([doctor_id, alert_id]):
        return jsonify({"error": "Missing doctor_id or alert_id"}), 400

    user = db.session.get(User, int(user_id))
    doctor = db.session.get(Doctor, int(doctor_id))
    alert = db.session.get(AlertLog, int(alert_id))

    if not all([user, doctor, alert]):
        return jsonify({"error": "Data not found"}), 404

    # Fire emails
    patient_ok = send_patient_confirmation(user, doctor)
    doctor_ok = send_doctor_alert(doctor, user, alert)

    # Mark as notified
    alert.notified = True
    db.session.commit()

    return jsonify({
        "message": f"Notifications sent. {doctor.name} has been notified.",
        "status": {"patient_email": patient_ok, "doctor_email": doctor_ok}
    }), 200
