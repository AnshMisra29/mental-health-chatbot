import sqlite3
import os

db_path = "instance/mental_health.db"
latest_version = "b30b62c6883e"

if not os.path.exists(db_path):
    print(f"ERROR: DB file not found at {db_path}")
else:
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("--- MANUAL RECOVERY ---")
        
        # 1. Add phone column to users
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN phone VARCHAR(20);")
            print("✅ Added 'phone' column to 'users'")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("⚠ 'phone' column already exists")
            else:
                print(f"❌ Error adding 'phone': {e}")

        # 2. Create doctors table
        try:
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS doctors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(120) NOT NULL UNIQUE,
                phone VARCHAR(20),
                specialization VARCHAR(100),
                clinic_name VARCHAR(150),
                address VARCHAR(255),
                latitude FLOAT,
                longitude FLOAT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            """)
            print("✅ 'doctors' table ensured")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_doctors_email ON doctors (email);")
        except Exception as e:
            print(f"❌ Error creating 'doctors': {e}")

        # 3. Force alembic version
        try:
            cursor.execute("DELETE FROM alembic_version;")
            cursor.execute("INSERT INTO alembic_version (version_num) VALUES (?);", (latest_version,))
            print(f"✅ Forced alembic_version to {latest_version}")
        except Exception as e:
            print(f"❌ Error updating alembic_version: {e}")

        conn.commit()
        conn.close()
        print("--- DONE ---")
        
    except Exception as e:
        print(f"GLOBAL ERROR: {e}")
