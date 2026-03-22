from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import re
import uuid
from auth import auth_bp
from database.db import db
from database.models import User, PendingUser
from notifications.email_service import send_verification_email


import random

# ── POST /api/auth/register ───────────────────────────────────────────────────
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"error": "Invalid email address"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email is already registered"}), 400

    # Handle existing pending registration (overwrite)
    existing_pending = PendingUser.query.filter_by(email=email).first()
    if existing_pending:
        db.session.delete(existing_pending)
        db.session.commit()

    # Generate 6-digit OTP
    otp = "".join([str(random.randint(0, 9)) for _ in range(6)])

    new_pending = PendingUser(
        name=name,
        email=email,
        otp_code=otp
    )
    new_pending.set_password(password)

    db.session.add(new_pending)
    db.session.commit()

    # Send verification email with OTP
    email_sent = send_verification_email(new_pending)

    return jsonify({
        "message": "OTP sent to your email. Please verify.",
        "email_sent": email_sent
    }), 201


# ── POST /api/auth/login ──────────────────────────────────────────────────────
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        # Check if they are pending
        if PendingUser.query.filter_by(email=email).first():
            return jsonify({
                "error": "Account not verified",
                "message": "Please enter the OTP sent to your email to verify your account."
            }), 403
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }), 200


# ── POST /api/auth/verify-otp ──────────────────────────────────────────────────
@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    otp = data.get("otp", "").strip()

    if not email or not otp:
        return jsonify({"error": "Email and OTP are required"}), 400

    pending = PendingUser.query.filter_by(email=email, otp_code=otp).first()
    
    if not pending:
        return jsonify({"error": "Invalid OTP code"}), 400

    # Move from Pending to User
    new_user = User(
        name=pending.name,
        email=pending.email,
        password_hash=pending.password_hash,
        is_verified=True
    )
    
    db.session.add(new_user)
    db.session.delete(pending)
    db.session.commit()

    return jsonify({
        "message": "Account verified successfully! Please login with your details."
    }), 200


# ── POST /api/auth/resend-otp ──────────────────────────────────────────────────
@auth_bp.route("/resend-otp", methods=["POST"])
def resend_otp():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({"error": "Email is required"}), 400

    pending = PendingUser.query.filter_by(email=email).first()
    
    if not pending:
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email is already verified. Please log in."}), 400
        return jsonify({"error": "No pending registration found for this email."}), 404

    # Regenerate OTP
    new_otp = "".join([str(random.randint(0, 9)) for _ in range(6)])
    pending.otp_code = new_otp
    db.session.commit()

    # Send verification email again
    email_sent = send_verification_email(pending)

    if email_sent:
        return jsonify({ "message": "New OTP sent successfully!" }), 200
    else:
        return jsonify({ "error": "Failed to resend OTP." }), 500


# ── GET /api/auth/me ──────────────────────────────────────────────────────────
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user    = db.session.get(User, user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id":         user.id,
        "name":       user.name,
        "email":      user.email,
        "is_verified": user.is_verified,
        "created_at": user.created_at.isoformat()
    }), 200
