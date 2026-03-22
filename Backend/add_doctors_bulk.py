from app import app
from database.db import db
from database.models import Doctor

doctors_data = [
    {
        "name": "Dr. Anil Yadav",
        "email": "dranilyadav@clinic.in",
        "phone": "+918375003702",
        "specialization": "Neuropsychiatrist, Depression, Anxiety, OCD",
        "clinic_name": "Dr Anil Yadav Clinic",
        "address": "Safdarjung Development Area, Hauz Khas, New Delhi",
        "latitude": 28.5505366,
        "longitude": 77.2007059,
    },
    {
        "name": "Dr. Manish Sarkar",
        "email": "drmanishsarkar@clinic.in",
        "phone": "+919717755296",
        "specialization": "Psychiatrist (Depression, Anxiety, Bipolar)",
        "clinic_name": "Dr Manish Sarkar Clinic",
        "address": "Chittaranjan Park, New Delhi",
        "latitude": 28.5400542,
        "longitude": 77.246521,
    },
    {
        "name": "Dr. Pankaj Kumar Verma",
        "email": "drpankajverma@clinic.in",
        "phone": "+918595483366",
        "specialization": "Psychiatrist (NIMHANS trained)",
        "clinic_name": "Rejuvenate Mind Clinic",
        "address": "Green Park, New Delhi",
        "latitude": 28.5590423,
        "longitude": 77.2063423,
    },
    {
        "name": "Dr. Dharmendra Singh",
        "email": "drdharmendrasingh@clinic.in",
        "phone": "+918860238475",
        "specialization": "Depression, Neuropsychiatry",
        "clinic_name": "Disha Neuropsychiatry Centre",
        "address": "Chittaranjan Park, New Delhi",
        "latitude": 28.5402156,
        "longitude": 77.2433367,
    },
    {
        "name": "Dr. Gorav Gupta",
        "email": "drgoravgupta@clinic.in",
        "phone": "+918800000255",
        "specialization": "Psychiatrist, Mental Health Disorders",
        "clinic_name": "Tulasi Healthcare / Private Clinic",
        "address": "Sarvapriya Vihar, New Delhi",
        "latitude": 28.5428373,
        "longitude": 77.2037086,
    },
    {
        "name": "Dr. Pratik Kumar",
        "email": "drpratikmkumar@clinic.in",
        "phone": "+919934035397",
        "specialization": "Psychiatrist",
        "clinic_name": "Delhi Mental Health Clinic",
        "address": "Shalimar Bagh, Delhi",
        "latitude": 28.7064509,
        "longitude": 77.162379,
    },
    {
        "name": "Dr. Ankit Daral",
        "email": "drankitdaral@clinic.in",
        "phone": "+919310285558",
        "specialization": "Psychiatrist",
        "clinic_name": "Doctors House Clinic",
        "address": "Punjabi Bagh, Delhi",
        "latitude": 28.6655756,
        "longitude": 77.1282142,
    },
    {
        "name": "Dr. Jitender Jakhar",
        "email": "drjitenderjakhar@clinic.in",
        "phone": "+919953294849",
        "specialization": "Psychiatrist",
        "clinic_name": "Insight Mind Care",
        "address": "Vasant Kunj, New Delhi",
        "latitude": 28.5385582,
        "longitude": 77.1393376,
    },
    {
        "name": "Dr. Sakshi Anand",
        "email": "drsakshianand@clinic.in",
        "phone": "+919306059456",
        "specialization": "Psychiatrist, Relationship Counseling",
        "clinic_name": "Witnessing Happiness Clinic",
        "address": "Rajinder Nagar / Karol Bagh, Delhi",
        "latitude": 28.6440106,
        "longitude": 77.1908745,
    },
    {
        "name": "Anandam Psychiatry Centre",
        "email": "anandampsychiatry@clinic.in",
        "phone": "+919582582707",
        "specialization": "Psychiatry & Mental Health",
        "clinic_name": "Anandam Psychiatry Centre",
        "address": "East Patel Nagar, New Delhi",
        "latitude": 28.644956,
        "longitude": 77.170713,
    },
]

def add_doctors():
    with app.app_context():
        added = 0
        skipped = 0
        for d in doctors_data:
            existing = Doctor.query.filter_by(email=d["email"]).first()
            if existing:
                print(f"SKIP (already exists): {d['name']}")
                skipped += 1
                continue
            doctor = Doctor(**d)
            db.session.add(doctor)
            added += 1
            print(f"Added: {d['name']}")
        
        db.session.commit()
        print(f"\nDone! Added: {added}, Skipped: {skipped}")

if __name__ == "__main__":
    add_doctors()
