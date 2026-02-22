from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from alerts import alerts_bp
from database.db import db
from database.models import AlertLog


# ── GET /api/alerts ────────────────────────────────────────────────────────────
@alerts_bp.route("/", methods=["GET"])
@jwt_required()
def get_alerts():
    user_id = int(get_jwt_identity())

    alerts = (
        AlertLog.query
        .filter_by(user_id=user_id)
        .order_by(AlertLog.triggered_at.desc())
        .all()
    )

    return jsonify({
        "alerts": [
            {
                "id":           alert.id,
                "risk_level":   alert.risk_level,
                "reason":       alert.reason,
                "triggered_at": alert.triggered_at.isoformat(),
                "notified":     alert.notified
            }
            for alert in alerts
        ]
    }), 200


# ── GET /api/alerts/<alert_id> ────────────────────────────────────────────────
@alerts_bp.route("/<int:alert_id>", methods=["GET"])
@jwt_required()
def get_alert(alert_id):
    user_id = int(get_jwt_identity())

    # Filter by both id AND user_id — prevents accessing other users' alerts
    alert = (
        AlertLog.query
        .filter_by(id=alert_id, user_id=user_id)
        .first()
    )

    if not alert:
        return jsonify({"error": "Alert not found"}), 404

    return jsonify({
        "id":           alert.id,
        "risk_level":   alert.risk_level,
        "reason":       alert.reason,
        "triggered_at": alert.triggered_at.isoformat(),
        "notified":     alert.notified
    }), 200


# ── DELETE /api/alerts/<alert_id> ─────────────────────────────────────────────
@alerts_bp.route("/<int:alert_id>", methods=["DELETE"])
@jwt_required()
def delete_alert(alert_id):
    user_id = int(get_jwt_identity())

    alert = (
        AlertLog.query
        .filter_by(id=alert_id, user_id=user_id)
        .first()
    )

    if not alert:
        return jsonify({"error": "Alert not found"}), 404

    db.session.delete(alert)
    db.session.commit()

    return jsonify({"message": "Alert deleted successfully"}), 200
