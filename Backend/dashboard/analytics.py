"""
analytics.py
────────────
Internal data aggregation layer for the dashboard.

Routes call these functions — never query DB directly in routes.
Swappable: add caching, ML insights, or richer queries here later.
"""

from database.db import db
from database.models import ChatHistory, AlertLog
from sqlalchemy import func


def get_user_summary(user_id: int) -> dict:
    """
    High-level stats for the dashboard overview card.

    Returns:
        - total_chats:       total messages sent by user
        - total_alerts:      total alerts triggered for user
        - critical_alerts:   count of CRITICAL-risk alerts
        - high_alerts:       count of HIGH-risk alerts
        - medium_alerts:     count of MEDIUM-risk alerts
        - low_alerts:        count of LOW-risk alerts
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

    critical_alerts = (
        db.session.query(func.count(AlertLog.id))
        .filter(AlertLog.user_id == user_id, AlertLog.risk_level == "CRITICAL")
        .scalar() or 0
    )

    high_alerts = (
        db.session.query(func.count(AlertLog.id))
        .filter(AlertLog.user_id == user_id, AlertLog.risk_level == "HIGH")
        .scalar() or 0
    )

    medium_alerts = (
        db.session.query(func.count(AlertLog.id))
        .filter(AlertLog.user_id == user_id, AlertLog.risk_level == "MEDIUM")
        .scalar() or 0
    )

    low_alerts = (
        db.session.query(func.count(AlertLog.id))
        .filter(AlertLog.user_id == user_id, AlertLog.risk_level == "LOW")
        .scalar() or 0
    )

    return {
        "total_chats":       total_chats,
        "total_alerts":      total_alerts,
        "critical_alerts":   critical_alerts,
        "high_alerts":       high_alerts,
        "medium_alerts":     medium_alerts,
        "low_alerts":        low_alerts,
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

    breakdown = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    for risk_level, count in rows:
        if risk_level in breakdown:
            breakdown[risk_level] = count

    return breakdown


def get_emotion_trend(user_id: int) -> list:
    """
    Emotion trend over time.
    Queries ChatHistory for emotion labels grouped by date.
    """
    results = (
        db.session.query(
            func.date(ChatHistory.timestamp).label("date"),
            ChatHistory.emotion,
            func.count(ChatHistory.id).label("count")
        )
        .filter(ChatHistory.user_id == user_id)
        .group_by("date", ChatHistory.emotion)
        .order_by("date")
        .all()
    )

    return [
        {"date": str(r.date), "emotion": r.emotion, "count": r.count}
        for r in results
    ]


def get_emotion_distribution(user_id: int) -> dict:
    """
    Overall emotion distribution — counts by emotion.
    Used for pie/bar charts on dashboard.
    """
    results = (
        db.session.query(ChatHistory.emotion, func.count(ChatHistory.id))
        .filter(ChatHistory.user_id == user_id)
        .group_by(ChatHistory.emotion)
        .all()
    )

    return {r[0]: r[1] for r in results}


def get_risk_level_distribution(user_id: int) -> dict:
    """
    Overall risk level distribution — counts by risk level for all chat messages.
    Separate from alert breakdown (which counts alerts, not messages).
    """
    results = (
        db.session.query(ChatHistory.risk_level, func.count(ChatHistory.id))
        .filter(ChatHistory.user_id == user_id)
        .group_by(ChatHistory.risk_level)
        .all()
    )

    breakdown = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    for risk_level, count in results:
        if risk_level in breakdown:
            breakdown[risk_level] = count

    return breakdown


def get_chat_statistics(user_id: int) -> dict:
    """
    Chat session statistics.
    - total_messages: total chat messages
    - last_chat_date: most recent chat
    """
    total_messages = (
        db.session.query(func.count(ChatHistory.id))
        .filter(ChatHistory.user_id == user_id)
        .scalar() or 0
    )

    last_chat = (
        ChatHistory.query
        .filter_by(user_id=user_id)
        .order_by(ChatHistory.timestamp.desc())
        .first()
    )

    last_chat_date = last_chat.timestamp.isoformat() if last_chat else None

    return {
        "total_messages": total_messages,
        "last_chat_date": last_chat_date,
    }


def get_crisis_events(user_id: int, limit: int = 10) -> list:
    """
    All CRITICAL-level alerts (crisis events).
    Timeline of crises for user awareness.
    """
    alerts = (
        AlertLog.query
        .filter_by(user_id=user_id, risk_level="CRITICAL")
        .order_by(AlertLog.triggered_at.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id": a.id,
            "reason": a.reason,
            "triggered_at": a.triggered_at.isoformat(),
            "notified": a.notified,
        }
        for a in alerts
    ]
