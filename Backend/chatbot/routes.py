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
        return jsonify({"error": str(e)}), 500

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
        
        # Query chat history (most recent first)
        query = ChatHistory.query.filter_by(user_id=user_id).order_by(ChatHistory.timestamp.desc())
        
        # Pagination
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Format response
        history = []
        for chat in paginated.items:
            history.append({
                "id": chat.id,
                "message": chat.message,
                "bot_response": chat.bot_response,
                "emotion": chat.emotion,
                "risk_level": chat.risk_level,
                "is_crisis": chat.emotion == "Suicidal",
                "timestamp": chat.timestamp.isoformat(),
                "model_metadata": chat.model_metadata
            })
        
        return jsonify({
            "total": paginated.total,
            "pages": paginated.pages,
            "current_page": page,
            "per_page": per_page,
            "history": history
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
