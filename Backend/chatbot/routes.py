from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from chatbot.conversation import get_chatbot_response

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
