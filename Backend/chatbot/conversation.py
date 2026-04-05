import os
import warnings
from groq import Groq
from dotenv import load_dotenv
from ml_engine.inference.model_loader import model_loader
from ml_engine.inference.predictor import predictor
from chatbot.context_manager import context_manager
from alerts.alert_service import create_alert
from database.db import db
from database.models import ChatHistory

# Suppress the loud deprecation warning (for any other libs)
warnings.filterwarnings("ignore", category=FutureWarning)

load_dotenv() # Load environment variables from .env

# Initialize Groq Client only if API key is present (avoid crash when missing)
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
if GROQ_API_KEY:
    client = Groq(api_key=GROQ_API_KEY)
else:
    client = None
    print("WARNING: GROQ_API_KEY not set — Groq client disabled; using fallback responses.")

# Use Llama 3.1 8B Instant — 5x faster than 70B, well within Groq free tier limits
MODEL_ID = "llama-3.1-8b-instant"

CRISIS_LABEL = "Suicidal"

# Emotion to Risk Level Mapping
EMOTION_TO_RISK_LEVEL = {
    "Normal": "LOW",
    "Anxiety": "MEDIUM",
    "Stress": "MEDIUM",
    "Depression": "HIGH",
    "Bipolar": "HIGH",
    "Personality Disorder": "HIGH",
    "Suicidal": "CRITICAL"
}

def get_risk_level(emotion):
    """
    Maps detected emotion to clinical risk level.
    Returns one of: LOW, MEDIUM, HIGH, CRITICAL
    """
    return EMOTION_TO_RISK_LEVEL.get(emotion, "LOW")

def _seed_context_from_db(user_id):
    """
    Seeds the in-memory context manager with the user's most recent DB messages.
    Called once per session (when context is empty) so Sia has conversation memory
    even after a server restart.
    """
    try:
        recent = (
            ChatHistory.query
            .filter_by(user_id=user_id)
            .order_by(ChatHistory.timestamp.desc())
            .limit(5)
            .all()
        )
        # recent is DESC, so reverse to get chronological order
        for chat in reversed(recent):
            context_manager.add_message(user_id, "user", chat.message)
            context_manager.add_message(user_id, "assistant", chat.bot_response)
    except Exception as e:
        print(f"Context seeding error (non-fatal): {e}")


def get_chatbot_response(user_id, message):
    """
    Hybrid response generation:
    1. Analyze message using the custom DistilBERT model.
    2. Check for crisis; if found, log alert and return safety response.
    3. If no crisis, use Groq (Llama 3) to generate an empathetic response.
    """
    # JWT identity is always a string — cast to int for DB Integer FK columns
    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        user_id = None

    # Seed in-memory context from DB on first message of this session
    # (after a server restart the context_manager is empty — this restores recent turns)
    if user_id is not None and not context_manager.get_context(user_id):
        _seed_context_from_db(user_id)

    # 1. Classification — predictor.load() will block until the model is ready
    # (no more "morning coffee" fallback; the model loads in ~5s on CPU)
    analysis = predictor.predict(message)
    detected_emotion = analysis['label']
    confidence = analysis['confidence']
    is_crisis = analysis.get('is_crisis', False)

    
    # 2. Crisis Handling
    if is_crisis:
        risk_level = "CRITICAL"
        alert = None # Initialize alert to None
        try:
            # Log alert for medical/safety oversight
            alert = create_alert(user_id, risk_level="CRITICAL", reason=f"Suicidal ideation detected ({confidence:.1%})")
        except Exception as e:
            # During standalone testing or if DB is down, we log to console instead of crashing
            print(f"ALERT LOGGING ERROR: {e}")
            alert = None

        # Save crisis interaction to database
        try:
            chat_record = ChatHistory(
                user_id=user_id,
                message=message,
                bot_response="I hear that you're going through a very difficult time. Please know that you're not alone and there is support available. If you're in immediate danger, please reach out to local emergency services or a crisis helpline like iCall India at 9152987821.",
                emotion=detected_emotion,
                risk_level=risk_level
            )
            db.session.add(chat_record)
            db.session.commit()
        except Exception as db_err:
            print(f"DEBUG: DB Save Error (skipped): {db_err}")

        return {
            "id": chat_record.id if 'chat_record' in locals() else None,
            "response": "I hear that you're going through a very difficult time. Please know that you're not alone and there is support available. If you're in immediate danger, please reach out to local emergency services or a crisis helpline like iCall India at 9152987821.",
            "emotion": detected_emotion,
            "is_crisis": True,
            "risk_level": risk_level,
            "alert_id": alert.id if alert else None
        }

    # 3. Conversational Response (Groq)
    try:
        risk_level = get_risk_level(detected_emotion)
        history = context_manager.get_context(user_id)
        
        # Prepare system prompt
        system_prompt = f"""
        You are Sia, a compassionate and empathetic mental health support assistant. 
        Your goal is to provide a safe space for users to talk. 
        The current user emotion is detected as: {detected_emotion}.
        Be supportive, warm, and natural. Don't mention the detection explicitly.
        Keep responses concise and helpful.
        """
        
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add history
        for msg in history:
            messages.append({"role": msg['role'], "content": msg['content']})
            
        # Add current message
        messages.append({"role": "user", "content": message})
        
        # Call Groq API — 25s timeout prevents the Flask worker from hanging indefinitely
        chat_completion = client.chat.completions.create(
            messages=messages,
            model=MODEL_ID,
            temperature=0.7,
            max_tokens=250,
            timeout=25
        )
        
        reply = chat_completion.choices[0].message.content
        
        # 4. Persistence
        # Update in-memory context (for immediate conversation flow)
        context_manager.add_message(user_id, "user", message)
        context_manager.add_message(user_id, "assistant", reply)
        
        # Save to Database (for Dashboard Analytics)
        try:
            chat_record = ChatHistory(
                user_id=user_id,
                message=message,
                bot_response=reply,
                emotion=detected_emotion,
                risk_level=risk_level
            )
            db.session.add(chat_record)
            db.session.commit()
        except Exception as db_err:
            print(f"DEBUG: DB Save Error (skipped): {db_err}")

        return {
            "id": chat_record.id,
            "response": reply,
            "emotion": detected_emotion,
            "is_crisis": False,
            "risk_level": risk_level
        }
        
    except Exception as e:
        # Re-raise so the Flask route catches it and returns a proper 503 error.
        # The frontend will show a "Try Again" button — no hardcoded response is returned.
        print(f"Groq API Error (will 503): {e}")
        raise
