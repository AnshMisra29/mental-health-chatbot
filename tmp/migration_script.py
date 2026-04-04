import sqlite3
import os

db_path = os.path.join("Backend", "instance", "mental_health.db")
if not os.path.exists(db_path):
    # Try alternate path if not in instance/
    db_path = os.path.join("Backend", "mental_health.db")

print(f"Checking database at: {db_path}")

if os.path.exists(db_path):
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if column already exists
        cursor.execute("PRAGMA table_info(chat_history)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if "is_hidden" not in columns:
            print("Adding 'is_hidden' column to chat_history table...")
            cursor.execute("ALTER TABLE chat_history ADD COLUMN is_hidden BOOLEAN DEFAULT 0")
            conn.commit()
            print("Column added successfully.")
        else:
            print("Column 'is_hidden' already exists.")
            
        conn.close()
    except Exception as e:
        print(f"Error updating database: {e}")
else:
    print("Database file not found. SQLAlchemy will create it with the new schema on next restart.")
