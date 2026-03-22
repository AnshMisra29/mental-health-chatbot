import sqlite3
import os

db_path = "instance/mental_health.db"
target_email = "zyzy@gmail.com"

if not os.path.exists(db_path):
    print(f"ERROR: DB file not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print(f"--- SEARCHING FOR {target_email} ---")
    cursor.execute("SELECT id, name, email, phone FROM users WHERE email = ?;", (target_email,))
    row = cursor.fetchone()
    if row:
        print(f"✅ Found user: ID={row[0]}, Name={row[1]}, Email={row[2]}, Phone={row[3]}")
    else:
        print(f"❌ User NOT FOUND in database.")
        
    print("\n--- ALL USERS ---")
    cursor.execute("SELECT id, name, email FROM users;")
    rows = cursor.fetchall()
    for r in rows:
        print(r)
        
    conn.close()
