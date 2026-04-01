from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import re
import uuid
from auth import auth_bp
import random
from datetime import datetime, timedelta
from database.db import db
from database.models import User, PendingUser
from notifications.email_service import send_verification_email, send_reset_otp_email

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

    if not user:
        # Check if they are pending
        if PendingUser.query.filter_by(email=email).first():
            return jsonify({
                "error": "Account not verified",
                "message": "Please enter the OTP sent to your email to verify your account."
            }), 403
        return jsonify({"error": "Invalid email or password"}), 401

    # Check if account is locked
    if user.failed_attempts >= 5:
        return jsonify({"error": "Account locked. 5 incorrect attempts detected. Please use Forgot Password to reset."}), 403

    if not user.check_password(password):
        user.failed_attempts += 1
        db.session.commit()
        
        if user.failed_attempts >= 5:
            return jsonify({"error": "Account locked due to 5 incorrect attempts. Please use Forgot Password to reset."}), 403
            
        remaining = 5 - user.failed_attempts
        return jsonify({"error": f"Invalid password. {remaining} attempts remaining before lockout."}), 401

    # Success: reset failed attempts
    user.failed_attempts = 0
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "profile_picture": user.profile_picture
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

    # Rate Limit Check (3 resends / 1 hour)
    if pending.resend_count >= 3:
        if pending.last_resend and (datetime.utcnow() - pending.last_resend) < timedelta(hours=1):
            return jsonify({ "error": "Too many attempts. Please try after some time." }), 429
        else:
            # Reset after 1 hour pass
            pending.resend_count = 0

    # Regenerate OTP
    new_otp = "".join([str(random.randint(0, 9)) for _ in range(6)])
    pending.otp_code = new_otp
    pending.resend_count += 1
    pending.last_resend = datetime.utcnow()
    db.session.commit()

    # Send verification email again
    email_sent = send_verification_email(pending)

    if email_sent:
        return jsonify({ "message": "New OTP sent successfully!" }), 200
    else:
        return jsonify({ "error": "Failed to resend OTP." }), 500



# ── POST /api/auth/forgot-password ───────────────────────────────────────────
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "No account found with this email"}), 404

    # Rate Limit Check (3 resends / 1 hour)
    if user.resend_count >= 3:
        if user.last_resend and (datetime.utcnow() - user.last_resend) < timedelta(hours=1):
            return jsonify({ "error": "Too many attempts. Please try after some time." }), 429
        else:
            # Reset after 1 hour pass
            user.resend_count = 0

    # Generate 6-digit OTP
    otp = "".join([str(random.randint(0, 9)) for _ in range(6)])
    user.reset_otp = otp
    user.resend_count += 1
    user.last_resend = datetime.utcnow()
    db.session.commit()

    # Send reset email
    email_sent = send_reset_otp_email(user, otp)
    
    if email_sent:
        return jsonify({ "message": "Password reset OTP sent to your email." }), 200
    else:
        return jsonify({ "error": "Failed to send reset email." }), 500


# ── POST /api/auth/verify-reset-otp ───────────────────────────────────────────
@auth_bp.route("/verify-reset-otp", methods=["POST"])
def verify_reset_otp():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    otp = data.get("otp", "").strip()

    if not email or not otp:
        return jsonify({"error": "Email and OTP are required"}), 400

    user = User.query.filter_by(email=email, reset_otp=otp).first()
    if not user:
        return jsonify({"error": "Invalid or expired OTP code"}), 400

    return jsonify({ "message": "OTP verified! Please set your new password." }), 200


# ── POST /api/auth/reset-password ─────────────────────────────────────────────
@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    otp = data.get("otp", "").strip()
    new_password = data.get("password", "")

    if not all([email, otp, new_password]):
        return jsonify({"error": "All fields are required"}), 400

    if len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long"}), 400

    user = User.query.filter_by(email=email, reset_otp=otp).first()
    if not user:
        return jsonify({"error": "Verification failed. Please request a new OTP."}), 400

    # Success: Update password and Reset security fields
    user.set_password(new_password)
    user.reset_otp = None
    user.failed_attempts = 0
    user.resend_count = 0
    db.session.commit()

    return jsonify({ "message": "Password reset successful! Please login." }), 200

# ── GET /api/auth/me ──────────────────────────────────────────────────────────
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    # ... existing code ...
    user_id = int(get_jwt_identity())
    user    = db.session.get(User, user_id)

    if not user:
        # Crucial for sync: if user is not in DB after a wipe, force them to re-login
        return jsonify({"error": "User not found", "msg": "Sync required"}), 401

    return jsonify({
        "id":         user.id,
        "name":       user.name,
        "email":      user.email,
        "profile_picture": user.profile_picture,
        "is_verified": user.is_verified,
        "created_at": user.created_at.isoformat()
    }), 200


# ── POST /api/auth/change-password ───────────────────────────────────────────
@auth_bp.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json() or {}
    current_password = data.get("current_password", "")
    new_password = data.get("new_password", "")

    if not current_password or not new_password:
        return jsonify({"error": "All fields are required"}), 400

    if not user.check_password(current_password):
        return jsonify({"error": "Incorrect current password"}), 400

    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters long"}), 400

    user.set_password(new_password)
    db.session.commit()

    return jsonify({"message": "Password updated successfully"}), 200


# ── DELETE /api/auth/delete-account ──────────────────────────────────────────
@auth_bp.route("/delete-account", methods=["DELETE"])
@jwt_required()
def delete_account():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    
    return jsonify({"message": "Account deleted successfully"}), 200


# ── POST /api/auth/profile-picture ───────────────────────────────────────────
@auth_bp.route("/profile-picture", methods=["POST"])
@jwt_required()
def update_profile_picture():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json() or {}
    picture_data = data.get("picture", None)

    if not picture_data:
        return jsonify({"error": "No picture data provided"}), 400

    user.profile_picture = picture_data
    db.session.commit()

    return jsonify({"message": "Profile picture updated successfully", "profile_picture": user.profile_picture}), 200


# ── DELETE /api/auth/profile-picture ───────────────────────────────────────────
@auth_bp.route("/profile-picture", methods=["DELETE"])
@jwt_required()
def delete_profile_picture():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.profile_picture = None
    db.session.commit()

    return jsonify({"message": "Profile picture removed successfully"}), 200
