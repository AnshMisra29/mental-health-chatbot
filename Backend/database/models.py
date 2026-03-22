from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

from .db import db


# ── User ──────────────────────────────────────────────────────────────────────

class User(db.Model):
    __tablename__ = "users"

    id            = db.Column(db.Integer, primary_key=True)
    name          = db.Column(db.String(100), nullable=False)
    email         = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    phone         = db.Column(db.String(20), nullable=True)   # optional — included in doctor alert emails
    is_verified   = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(100), nullable=True)
    failed_attempts = db.Column(db.Integer, default=0)
    resend_count   = db.Column(db.Integer, default=0)
    last_resend    = db.Column(db.DateTime, nullable=True)
    reset_otp      = db.Column(db.String(6), nullable=True)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    chats = db.relationship(
        "ChatHistory",
        backref="user",
        lazy=True,
        cascade="all, delete-orphan"
    )
    alerts = db.relationship(
        "AlertLog",
        backref="user",
        lazy=True,
        cascade="all, delete-orphan"
    )

    # Password methods
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.email}>"


# ── ChatHistory ───────────────────────────────────────────────────────────────

class ChatHistory(db.Model):
    __tablename__ = "chat_history"

    id           = db.Column(db.Integer, primary_key=True)
    user_id      = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    message      = db.Column(db.Text, nullable=False)
    bot_response = db.Column(db.Text, nullable=False)
    sentiment      = db.Column(db.String(50))
    emotion        = db.Column(db.String(50))
    risk_level     = db.Column(db.String(50))
    model_metadata = db.Column(db.JSON)  # Stores raw multi-class scores
    timestamp      = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<ChatHistory user_id={self.user_id} at {self.timestamp}>"


# ── AlertLog ──────────────────────────────────────────────────────────────────

class AlertLog(db.Model):
    __tablename__ = "alert_log"

    id           = db.Column(db.Integer, primary_key=True)
    user_id      = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    risk_level   = db.Column(db.String(50), nullable=False)
    reason       = db.Column(db.Text, nullable=False)
    triggered_at = db.Column(db.DateTime, default=datetime.utcnow)
    notified     = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f"<AlertLog user_id={self.user_id} risk={self.risk_level}>"


# ── Doctor ────────────────────────────────────────────────────────────────────

class Doctor(db.Model):
    __tablename__ = "doctors"

    id             = db.Column(db.Integer, primary_key=True)
    name           = db.Column(db.String(100), nullable=False)
    email          = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone          = db.Column(db.String(20), nullable=True)
    specialization = db.Column(db.String(100), nullable=True)   # e.g. "Psychiatry"
    clinic_name    = db.Column(db.String(150), nullable=True)
    address        = db.Column(db.String(255), nullable=True)
    latitude       = db.Column(db.Float, nullable=True)          # for proximity search
    longitude      = db.Column(db.Float, nullable=True)
    place_id       = db.Column(db.String(100), nullable=True)
    maps_url       = db.Column(db.String(500), nullable=True)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self, distance_km=None):
        d = {
            "id":             self.id,
            "name":           self.name,
            "email":          self.email,
            "phone":          self.phone,
            "specialization": self.specialization,
            "clinic_name":    self.clinic_name,
            "address":        self.address,
            "place_id":       self.place_id,
            "maps_url":       self.maps_url,
        }
        if distance_km is not None:
            d["distance_km"] = round(distance_km, 1)
        return d

    def __repr__(self):
        return f"<Doctor {self.name} ({self.email})>"


# ── PendingUser ──────────────────────────────────────────────────────────────

class PendingUser(db.Model):
    __tablename__ = "pending_users"

    id            = db.Column(db.Integer, primary_key=True)
    name          = db.Column(db.String(100), nullable=False)
    email         = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    otp_code      = db.Column(db.String(6), nullable=False)
    resend_count  = db.Column(db.Integer, default=0)
    last_resend   = db.Column(db.DateTime, nullable=True)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def __repr__(self):
        return f"<PendingUser {self.email}>"
