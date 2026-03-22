import sqlite3
import os

db_path = "instance/mental_health.db"
if not os.path.exists(db_path):
    print(f"ERROR: DB file not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("--- TABLES ---")
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    for t in tables:
        print(t[0])
        
    print("\n--- USERS SCHEMA ---")
    cursor.execute("PRAGMA table_info(users);")
    columns = cursor.fetchall()
    for col in columns:
        print(col)
        
    print("\n--- DOCTORS SCHEMA ---")
    cursor.execute("PRAGMA table_info(doctors);")
    columns = cursor.fetchall()
    for col in columns:
        print(col)
    
    conn.close()
