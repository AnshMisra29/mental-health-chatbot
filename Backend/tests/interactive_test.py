import sys
import os

# Add Backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from chatbot.conversation import get_chatbot_response
from chatbot.context_manager import context_manager

def interactive_test():
    print("\n" + "="*50)
    print("Sia Hybrid Chatbot — Interactive Test")
    print("Logic: DistilBERT (Analysis) + Groq Llama 3 (Conversation)")
    print("Type your message and press Enter.")
    print("Type 'quit' to exit or 'reset' to clear history.")
    print("="*50)
    
    user_id = "test_user_123" # Mock user ID
    
    while True:
        user_input = input("\nYou: ").strip()
        
        if user_input.lower() in ['quit', 'exit', 'q']:
            print("Exiting test...")
            break
            
        if user_input.lower() == 'reset':
            context_manager.clear_context(user_id)
            print("Conversation history cleared.")
            continue
            
        if not user_input:
            continue
            
        try:
            result = get_chatbot_response(user_id, user_input)
            
            print(f"\n[Detected Emotion: {result['emotion']}]")
            if result.get('is_crisis'):
                print("⚠️  SYSTEM MODE: CRISIS DETECTED")
            
            print(f"Sia: {result['response']}")
                
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    interactive_test()
