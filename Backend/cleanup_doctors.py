import sqlite3
import os

db_path = "instance/mental_health.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Keep only the one with the correct info
    cursor.execute("DELETE FROM doctors WHERE name = 'Dr. Sunil Mittal' AND email = 'sunil@example.com';")
    conn.commit()
    print("✅ Cleaned up duplicate/placeholder Sunil Mittal entry")
    
    conn.close()
