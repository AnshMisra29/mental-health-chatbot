import sqlite3
import os

db_path = "instance/mental_health.db"
prev_version = "88d7703fcac9"

if not os.path.exists(db_path):
    print(f"ERROR: DB file not found at {db_path}")
else:
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Reset version
        cursor.execute("UPDATE alembic_version SET version_num = ?;", (prev_version,))
        conn.commit()
        print(f"SUCCESS: Reset alembic_version to {prev_version}")
        
        conn.close()
    except Exception as e:
        print(f"ERROR: {e}")
