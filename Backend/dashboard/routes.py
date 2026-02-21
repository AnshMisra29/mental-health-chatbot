from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from dashboard import dashboard_bp
from dashboard.analytics import get_user_summary, get_recent_alerts, get_alert_breakdown


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
