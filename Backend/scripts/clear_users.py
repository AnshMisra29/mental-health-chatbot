
import sys
import os
from flask import Flask

# Add Backend to path
sys.path.append(os.getcwd())

from database.db import db
from database.models import User, PendingUser, ChatHistory, AlertLog

# Minimal app for DB operations
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mental_health.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def clear_users():
    with app.app_context():
        # Due to cascades, deleting users should handle chats/alerts, 
        # but let's be explicit and safe.
        try:
            db.session.query(AlertLog).delete()
            db.session.query(ChatHistory).delete()
            db.session.query(PendingUser).delete()
            db.session.query(User).delete()
            db.session.commit()
            print("Successfully cleared User, PendingUser, ChatHistory, and AlertLog tables.")
        except Exception as e:
            db.session.rollback()
            print(f"Error clearing user tables: {e}")

if __name__ == "__main__":
    clear_users()
