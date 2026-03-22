from app import app
from database.db import db
from database.models import Doctor

def add_new_doctor():
    with app.app_context():
        # Extracted from screenshot
        name = "Prachi Jain"
        email = "psychologistprachijain@gmail.com"
        phone = "+919643984406"
        address = "SK 29 Sector 112 Noida 201306"
        specialization = "Psychologist"
        clinic_name = "SK 29"
        
        # Approximate coordinates for Noida Sector 112
        latitude = 28.5359
        longitude = 77.4125
        
        # Check if doctor already exists
        existing = Doctor.query.filter_by(email=email).first()
        if existing:
            print(f"Doctor with email {email} already exists.")
            return

        new_doctor = Doctor(
            name=name,
            email=email,
            phone=phone,
            address=address,
            specialization=specialization,
            clinic_name=clinic_name,
            latitude=latitude,
            longitude=longitude
        )
        
        try:
            db.session.add(new_doctor)
            db.session.commit()
            print(f"Successfully added Doctor {name} to the database.")
        except Exception as e:
            db.session.rollback()
            print(f"Error adding doctor: {e}")

if __name__ == "__main__":
    add_new_doctor()
