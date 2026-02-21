from database.db import db
from database.models import AlertLog


def create_alert(user_id: int, risk_level: str, reason: str) -> AlertLog:
    """
    Create and persist an alert for a user.

    Called by the chatbot module when crisis/risk language is detected.
    Never write DB logic directly in chatbot routes — use this function.

    Args:
        user_id:    ID of the user whose message triggered the alert.
        risk_level: Severity string — "low", "medium", or "high".
        reason:     Human-readable explanation of why the alert was created.

    Returns:
        The saved AlertLog instance.
    """
    alert = AlertLog(
        user_id=user_id,
        risk_level=risk_level,
        reason=reason
    )

    # TODO: wrap in try/except when email notifications or batch operations are added
    db.session.add(alert)
    db.session.commit()

    return alert
