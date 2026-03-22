import sqlite3
import os

db_path = "instance/mental_health.db"
if not os.path.exists(db_path):
    print(f"ERROR: DB file not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("--- DOCTORS ---")
    cursor.execute("SELECT name, email, clinic_name FROM doctors;")
    rows = cursor.fetchall()
    if not rows:
        print("Empty")
    for r in rows:
        print(f"Name: {r[0]} | Email: {r[1]} | Clinic: {r[2]}")
        
    conn.close()
