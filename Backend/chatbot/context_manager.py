class ContextManager:
    def __init__(self, max_history=10):
        self.history = {}  # user_id -> list of messages
        self.max_history = max_history

    def add_message(self, user_id, role, content):
        if user_id not in self.history:
            self.history[user_id] = []
        
        self.history[user_id].append({"role": role, "content": content})
        
        # Keep only the last N messages
        if len(self.history[user_id]) > self.max_history:
            self.history[user_id] = self.history[user_id][-self.max_history:]

    def get_context(self, user_id):
        return self.history.get(user_id, [])

    def clear_context(self, user_id):
        if user_id in self.history:
            self.history[user_id] = []

# Global instance
context_manager = ContextManager()
