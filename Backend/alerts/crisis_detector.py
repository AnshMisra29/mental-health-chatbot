"""
crisis_detector.py
──────────────────
Thin orchestration layer between chatbot and the ML crisis model.

Chatbot always calls:
    from alerts.crisis_detector import detect_crisis

This file handles:
    - Calling the ML model (loaded once at import time)
    - Applying probability thresholds
    - Returning a structured result

Chatbot never knows about thresholds, probabilities, or model internals.
"""

import logging

logger = logging.getLogger(__name__)

# ── ML model import (once at startup, not per call) ───────────────────────────
try:
    from ml_engine.inference.predictor import predict_crisis
    _ML_AVAILABLE = True
except (ImportError, Exception):
    predict_crisis = None
    _ML_AVAILABLE = False
    logger.warning(
        "ml_engine.inference.predictor not available. "
        "Crisis detection will return 'none' until ML model is implemented."
    )

# ── Probability thresholds ────────────────────────────────────────────────────
THRESHOLD_HIGH   = 0.80
THRESHOLD_MEDIUM = 0.50
THRESHOLD_LOW    = 0.30


def detect_crisis(text: str) -> dict:
    """
    Detect crisis/risk level in a user message using the ML crisis model.

    Args:
        text: The user's raw message.

    Returns:
        A dict with:
            - "risk_level": "none" | "low" | "medium" | "high"
            - "reason":     Human-readable explanation (empty if no risk)
            - "flagged":    True if any risk was detected
    """
    if not _ML_AVAILABLE:
        return {"risk_level": "none", "reason": "", "flagged": False}

    try:
        raw = predict_crisis(text)
        # Clamp to [0.0, 1.0] — guards against unexpected model output
        probability = max(0.0, min(1.0, float(raw)))
    except Exception as e:
        logger.error("Crisis model prediction failed: %s", e)
        return {"risk_level": "none", "reason": "", "flagged": False}

    # Map probability score → risk level
    if probability >= THRESHOLD_HIGH:
        return {
            "risk_level": "high",
            "reason":     f"Crisis model confidence: {probability:.0%}",
            "flagged":    True,
        }
    elif probability >= THRESHOLD_MEDIUM:
        return {
            "risk_level": "medium",
            "reason":     f"Crisis model confidence: {probability:.0%}",
            "flagged":    True,
        }
    elif probability >= THRESHOLD_LOW:
        return {
            "risk_level": "low",
            "reason":     f"Crisis model confidence: {probability:.0%}",
            "flagged":    True,
        }
    else:
        return {"risk_level": "none", "reason": "", "flagged": False}
