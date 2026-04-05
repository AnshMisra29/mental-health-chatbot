from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from chatbot.conversation import get_chatbot_response
from database.models import ChatHistory

chatbot_bp = Blueprint('chatbot', __name__)

@chatbot_bp.route('/message', methods=['POST'])
@jwt_required()
def chat():
    """
    Endpoint for users to send messages to the chatbot.
    Requires authentication to track user history and alerts.
    """
    data = request.get_json()
    message = data.get('message')
    user_id = get_jwt_identity()

    if not message:
        return jsonify({"error": "Message is required"}), 400

    try:
        result = get_chatbot_response(user_id, message)
        return jsonify(result), 200
    except Exception as e:
        # Groq timed out or failed — return 503 so the frontend shows a retry button
        return jsonify({"error": "sia_unavailable", "message": "Sia couldn't respond right now. Please try again."}), 503

@chatbot_bp.route('/reset', methods=['POST'])
@jwt_required()
def reset_chat():
    """
    Clears the conversation context for the user.
    """
    from chatbot.context_manager import context_manager
    user_id = get_jwt_identity()
    context_manager.clear_context(user_id)
    return jsonify({"message": "Conversation history cleared"}), 200

@chatbot_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    """
    Retrieves all chat messages for the authenticated user.
    Returns paginated chat history with emotions and risk levels.
    """
    try:
        user_id = get_jwt_identity()
        user_id = int(user_id)
        
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        # Query chat history (most recent first, excluding hidden ones)
        query = ChatHistory.query.filter_by(user_id=user_id).order_by(ChatHistory.timestamp.desc())
        
        # Pagination
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Calculate true total (including hidden ones) for Dashboard consistency
        total_all = ChatHistory.query.filter_by(user_id=user_id).count()
        
        # Pre-fetch recent alerts to link with crisis messages (avoid N+1 queries)
        from database.models import AlertLog
        recent_alerts = AlertLog.query.filter_by(user_id=user_id).order_by(AlertLog.triggered_at.desc()).limit(50).all()
        
        # Format response
        history = []
        for chat in paginated.items:
            # Find matching alert for crisis messages (within 30s of the chat)
            alert_id = None
            if chat.emotion == "Suicidal":
                for alert in recent_alerts:
                    delta = abs((alert.triggered_at - chat.timestamp).total_seconds())
                    if delta < 30:
                        alert_id = alert.id
                        break

            history.append({
                "id": chat.id,
                "message": chat.message,
                "bot_response": chat.bot_response,
                "emotion": chat.emotion,
                "risk_level": chat.risk_level,
                "alert_id": alert_id,
                "is_crisis": chat.emotion == "Suicidal",
                "timestamp": chat.timestamp.isoformat()
            })
        
        return jsonify({
            "total": total_all,
            "pages": paginated.pages,
            "current_page": page,
            "per_page": per_page,
            "history": history
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@chatbot_bp.route('/history/<int:chat_id>', methods=['DELETE'])
@jwt_required()
def delete_chat(chat_id):
    """
    Soft-deletes a chat message by setting is_hidden to True.
    """
    try:
        user_id = int(get_jwt_identity())
        chat = ChatHistory.query.get_or_404(chat_id)
        
        if chat.user_id != user_id:
            return jsonify({"error": "Unauthorized"}), 403
            
        chat.is_hidden = True
        from database.db import db
        db.session.commit()
        
        return jsonify({"message": "Message hidden successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chatbot_bp.route('/history/delete-bulk', methods=['POST'])
@jwt_required()
def delete_bulk_chats():
    """
    Soft-deletes multiple chat messages by setting is_hidden to True.
    """
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        chat_ids = data.get('chat_ids', [])
        
        if not chat_ids:
            return jsonify({"error": "No chat IDs provided"}), 400
            
        # Bulk update is_hidden for matching chats
        from database.db import db
        ChatHistory.query.filter(
            ChatHistory.id.in_(chat_ids),
            ChatHistory.user_id == user_id
        ).update({ChatHistory.is_hidden: True}, synchronize_session=False)
        
        db.session.commit()
        
        return jsonify({"message": f"{len(chat_ids)} messages hidden successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
