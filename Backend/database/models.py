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
