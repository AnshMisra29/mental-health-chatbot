from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from dashboard import dashboard_bp
from dashboard.analytics import (
    get_user_summary,
    get_recent_alerts,
    get_alert_breakdown,
    get_emotion_trend,
    get_emotion_distribution,
    get_risk_level_distribution,
    get_chat_statistics,
    get_crisis_events,
)


# ── GET /api/dashboard/summary ────────────────────────────────────────────────
@dashboard_bp.route("/summary", methods=["GET"])
@jwt_required()
def summary():
    """Overview stats: total chats, alerts, high/medium/low risk count."""
    user_id = int(get_jwt_identity())
    return jsonify({"data": get_user_summary(user_id)}), 200


# ── GET /api/dashboard/recent-alerts ─────────────────────────────────────────
@dashboard_bp.route("/recent-alerts", methods=["GET"])
@jwt_required()
def recent_alerts():
    """Last 5 alerts — for the dashboard alert feed."""
    user_id = int(get_jwt_identity())
    return jsonify({"data": get_recent_alerts(user_id, limit=5)}), 200


# ── GET /api/dashboard/alert-breakdown ───────────────────────────────────────
@dashboard_bp.route("/alert-breakdown", methods=["GET"])
@jwt_required()
def alert_breakdown():
    """Alert counts by risk level — for charts/graphs."""
    user_id = int(get_jwt_identity())
    return jsonify({"data": get_alert_breakdown(user_id)}), 200


# ── GET /api/dashboard/emotion-distribution ───────────────────────────────────
@dashboard_bp.route("/emotion-distribution", methods=["GET"])
@jwt_required()
def emotion_distribution():
    """Overall emotion distribution — counts by emotion for pie charts."""
    user_id = int(get_jwt_identity())
    return jsonify({"data": get_emotion_distribution(user_id)}), 200


# ── GET /api/dashboard/risk-distribution ───────────────────────────────────────
@dashboard_bp.route("/risk-distribution", methods=["GET"])
@jwt_required()
def risk_distribution():
    """Risk level distribution — counts by risk level for all chat messages."""
    user_id = int(get_jwt_identity())
    return jsonify({"data": get_risk_level_distribution(user_id)}), 200


# ── GET /api/dashboard/chat-stats ──────────────────────────────────────────────
@dashboard_bp.route("/chat-stats", methods=["GET"])
@jwt_required()
def chat_stats():
    """Chat session statistics — total messages, last chat date."""
    user_id = int(get_jwt_identity())
    return jsonify({"data": get_chat_statistics(user_id)}), 200


# ── GET /api/dashboard/emotion-trend ───────────────────────────────────────────
@dashboard_bp.route("/emotion-trend", methods=["GET"])
@jwt_required()
def emotion_trend():
    """Emotion trend over time — grouped by date and emotion."""
    user_id = int(get_jwt_identity())
    return jsonify({"data": get_emotion_trend(user_id)}), 200


# ── GET /api/dashboard/crisis-events ───────────────────────────────────────────
@dashboard_bp.route("/crisis-events", methods=["GET"])
@jwt_required()
def crisis_events():
    """Timeline of all CRITICAL-level alerts (crisis events)."""
    user_id = int(get_jwt_identity())
    return jsonify({"data": get_crisis_events(user_id, limit=10)}), 200
