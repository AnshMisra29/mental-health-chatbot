from ml_engine.inference.predictor import predict

def detect_crisis(text: str) -> dict:
    """
    Detect crisis/risk level in a user message using the ML crisis model.
    """
    result = predict(text)

    return {
        "risk_level": "high" if result["is_crisis"] else "none",
        "reason": f"Model classified as {result['label']} ({result['confidence']:.0%})",
        "flagged": result["is_crisis"]
    }
