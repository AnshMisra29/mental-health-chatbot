"""
analytics.py
────────────
Internal data aggregation layer for the dashboard.

Routes call these functions — never query DB directly in routes.
Swappable: add caching, ML insights, or richer queries here later.
"""

from database.db import db
from database.models import User, ChatHistory, AlertLog
from sqlalchemy import func


def get_user_summary(user_id: int) -> dict:
    """
    High-level stats for the dashboard overview card.

    Returns:
        - total_chats:  total messages sent by user
        - total_alerts: total alerts triggered for user
        - high_alerts:  count of high-risk alerts
    """
    total_chats = (
        db.session.query(func.count(ChatHistory.id))
        .filter(ChatHistory.user_id == user_id)
        .scalar() or 0
    )

    total_alerts = (
        db.session.query(func.count(AlertLog.id))
        .filter(AlertLog.user_id == user_id)
        .scalar() or 0
    )

    high_alerts = (
        db.session.query(func.count(AlertLog.id))
        .filter(AlertLog.user_id == user_id, AlertLog.risk_level == "high")
        .scalar() or 0
    )

    medium_alerts = (
        db.session.query(func.count(AlertLog.id))
        .filter(AlertLog.user_id == user_id, AlertLog.risk_level == "medium")
        .scalar() or 0
    )

    low_alerts = (
        db.session.query(func.count(AlertLog.id))
        .filter(AlertLog.user_id == user_id, AlertLog.risk_level == "low")
        .scalar() or 0
    )

    return {
        "total_chats":    total_chats,
        "total_alerts":   total_alerts,
        "high_alerts":    high_alerts,
        "medium_alerts":  medium_alerts,
        "low_alerts":     low_alerts,
    }


def get_recent_alerts(user_id: int, limit: int = 5) -> list:
    """
    Fetch the most recent alerts for the dashboard alert feed.
    """
    alerts = (
        AlertLog.query
        .filter_by(user_id=user_id)
        .order_by(AlertLog.triggered_at.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id":           a.id,
            "risk_level":   a.risk_level,
            "reason":       a.reason,
            "triggered_at": a.triggered_at.isoformat(),
            "notified":     a.notified,
        }
        for a in alerts
    ]


def get_alert_breakdown(user_id: int) -> dict:
    """
    Count of alerts grouped by risk level.
    Useful for charts/graphs on the dashboard.
    """
    rows = (
        db.session.query(AlertLog.risk_level, func.count(AlertLog.id))
        .filter(AlertLog.user_id == user_id)
        .group_by(AlertLog.risk_level)
        .all()
    )

    breakdown = {"high": 0, "medium": 0, "low": 0}
    for risk_level, count in rows:
        if risk_level in breakdown:
            breakdown[risk_level] = count

    return breakdown


def get_emotion_trend(user_id: int) -> list:
    """
    Emotion trend over time — placeholder for ML integration.

    TODO: once ml_engine is implemented, query ChatHistory emotion
    labels and return a time-series list for the dashboard chart.

    Expected return format:
    [
        {"date": "2026-02-21", "emotion": "sad",     "count": 4},
        {"date": "2026-02-21", "emotion": "anxious",  "count": 2},
    ]
    """
    # TODO: implement once ml_engine.inference is built
    return []
