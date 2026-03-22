import sqlite3
import os

db_path = "instance/mental_health.db"
doctor_info = {
    "name": "Dr. Sunil Mittal",
    "email": "sunil.mittal@cosmosinstitute.com",
    "phone": "+91-11-40523000",
    "specialization": "Senior Psychiatrist",
    "clinic_name": "Cosmos Institute of Mental Health (CIMBS)",
    "address": "Delhi Eye Centre, 26, Ring Road, Lajpat Nagar, New Delhi",
    "latitude": 28.5684,
    "longitude": 77.2435
}

if not os.path.exists(db_path):
    print(f"ERROR: DB file not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
        INSERT INTO doctors (name, email, phone, specialization, clinic_name, address, latitude, longitude)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            doctor_info["name"],
            doctor_info["email"],
            doctor_info["phone"],
            doctor_info["specialization"],
            doctor_info["clinic_name"],
            doctor_info["address"],
            doctor_info["latitude"],
            doctor_info["longitude"]
        ))
        conn.commit()
        print(f"✅ Successfully added {doctor_info['name']} to the database.")
    except sqlite3.IntegrityError:
        print(f"ℹ️ {doctor_info['name']} already exists in the database.")
    except Exception as e:
        print(f"❌ Error adding doctor: {e}")
    
    conn.close()
