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

# Initialize Groq Client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# Use Llama 3 for best quality-to-speed ratio
MODEL_ID = "llama-3.3-70b-versatile"

CRISIS_LABEL = "Suicidal"

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

    # Check if model is ready
    if not model_loader.is_ready:
        return {
            "response": "I'm just finishing my morning coffee (still booting up), but I'm here to listen! How can I help you today?",
            "emotion": "Normal",
            "is_crisis": False
        }

    # 1. Classification
    analysis = predictor.predict(message)
    detected_emotion = analysis['label']
    confidence = analysis['confidence']
    is_crisis = analysis.get('is_crisis', False)
    
    # 2. Crisis Handling
    if is_crisis:
        try:
            # Log alert for medical/safety oversight
            create_alert(user_id, risk_level="high", reason=f"Suicidal ideation detected ({confidence:.1%})")
        except Exception as e:
            # During standalone testing or if DB is down, we log to console instead of crashing
            print(f"ALERT LOGGING ERROR: {e}")
            print(f"CRISIS DETECTED for user {user_id}: Suicidal ideation ({confidence:.1%})")

        return {
            "response": "I hear that you're going through a very difficult time. Please know that you're not alone and there is support available. If you're in immediate danger, please reach out to local emergency services or a crisis helpline like iCall India at 9152987821.",
            "emotion": detected_emotion,
            "is_crisis": True
        }

    # 3. Conversational Response (Groq)
    try:
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
        
        # Call Groq API
        chat_completion = client.chat.completions.create(
            messages=messages,
            model=MODEL_ID,
            temperature=0.7,
            max_tokens=500
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
                risk_level="high" if is_crisis else "none",
                model_metadata=analysis # Stores raw multi-class confidence scores
            )
            db.session.add(chat_record)
            db.session.commit()
        except Exception as db_err:
            print(f"DEBUG: DB Save Error (skipped): {db_err}")

        return {
            "response": reply,
            "emotion": detected_emotion,
            "is_crisis": False
        }
        
    except Exception as e:
        print(f"Groq API Error: {e}")
        # Fallback Mode
        if detected_emotion == "Normal":
            fallback_msg = "I'm here for you and ready to listen. Would you like to tell me more about what's on your mind?"
        else:
            fallback_msg = f"I'm here for you. It sounds like you're dealing with {detected_emotion.lower()} right now. How can I help?"
        
        # Save fallback response to DB as well
        try:
            chat_record = ChatHistory(
                user_id=user_id,
                message=message,
                bot_response=fallback_msg,
                emotion=detected_emotion,
                risk_level="high" if is_crisis else "none",
                model_metadata=analysis
            )
            db.session.add(chat_record)
            db.session.commit()
        except Exception as db_err:
             print(f"DEBUG: DB Fallback Save Error: {db_err}")

        return {
            "response": fallback_msg,
            "emotion": detected_emotion,
            "is_crisis": False
        }
