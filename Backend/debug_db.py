from app import app
from database.db import db
from sqlalchemy import inspect
from database.models import MoodLog

with app.app_context():
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"Tables found: {tables}")
    
    if "mood_logs" in tables:
        cols = [c["name"] for c in inspector.get_columns("mood_logs")]
        print(f"MoodLog columns: {cols}")
        count = MoodLog.query.count()
        print(f"Total Mood Logs: {count}")
    else:
        print("MoodLog table is MISSING!")
