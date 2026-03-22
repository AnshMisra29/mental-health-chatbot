import sqlite3
import os

db_path = "instance/mental_health.db"
if not os.path.exists(db_path):
    print(f"ERROR: DB file not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("--- ALEMBIC VERSION ---")
    try:
        cursor.execute("SELECT version_num FROM alembic_version;")
        row = cursor.fetchone()
        print(row[0] if row else "Empty")
    except Exception as e:
        print(f"Error reading alembic_version: {e}")
    
    conn.close()
