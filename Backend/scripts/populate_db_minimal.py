
import sys
import os
from flask import Flask
from datetime import datetime
import random

# Add Backend to path
sys.path.append(os.getcwd())

from database.db import db
from database.models import User, Doctor, ChatHistory, AlertLog, PendingUser

# Minimal app for DB operations
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mental_health.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def populate():
    with app.app_context():
        db.drop_all()
        db.create_all()
        print("Database tables recreated.")

        doctors_data = [
            {
                "name": "Dr Anil Yadav",
                "email": "info@dranilyadav.com",
                "phone": "8375003702",
                "specialization": "Neuropsychiatrist",
                "clinic_name": "Dr Anil Yadav Clinic",
                "address": "Safdarjung Development Area, Hauz Khas, New Delhi",
                "latitude": 28.5492,
                "longitude": 77.2025,
                "place_id": "ChIJxXii03PiDDkRHUqqiBUzPmA",
                "maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJxXii03PiDDkRHUqqiBUzPmA"
            },
            {
                "name": "Dr Manish Sarkar",
                "email": "contact@drmanishsarkar.com",
                "phone": "9717755296",
                "specialization": "Psychiatrist",
                "clinic_name": "Dr Manish Sarkar Clinic",
                "address": "Chittaranjan Park, New Delhi",
                "latitude": 28.5375,
                "longitude": 77.2515,
                "place_id": "ChIJpxDcbiXjDDkRQ5ArHoWsnus",
                "maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJpxDcbiXjDDkRQ5ArHoWsnus"
            },
            {
                "name": "Dr Pankaj Kumar Verma",
                "email": "info@rejuvenatemind.in",
                "phone": "8595483366",
                "specialization": "Psychiatrist",
                "clinic_name": "Rejuvenate Mind Clinic",
                "address": "Green Park Extension, New Delhi",
                "latitude": 28.5583,
                "longitude": 77.2038,
                "place_id": "ChIJDQi05RHjDDkRU5tbsHUf_Hs",
                "maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJDQi05RHjDDkRU5tbsHUf_Hs"
            },
            {
                "name": "Dr Dharmendra Singh",
                "email": "dishamindclinic@gmail.com",
                "phone": "8860238475",
                "specialization": "Neuropsychiatry",
                "clinic_name": "Disha Neuropsychiatry Centre",
                "address": "Chittaranjan Park, New Delhi",
                "latitude": 28.5391,
                "longitude": 77.2520,
                "place_id": "ChIJXaGYlhHjDDkRFJDEbediigs",
                "maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJXaGYlhHjDDkRFJDEbediigs"
            },
            {
                "name": "Dr Gorav Gupta",
                "email": "info@goravgupta.com",
                "phone": "8800000255",
                "specialization": "Psychiatrist",
                "clinic_name": "Tulasi Healthcare",
                "address": "Sarvapriya Vihar, New Delhi",
                "latitude": 28.5434,
                "longitude": 77.2066,
                "place_id": "ChIJVzkI9A_iDDkR16bkbx2n260",
                "maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJVzkI9A_iDDkR16bkbx2n260"
            },
            {
                "name": "Dr Pratik Kumar",
                "email": "contact@delhimentalhealth.com",
                "phone": "9934035397",
                "specialization": "Psychiatrist",
                "clinic_name": "Delhi Mental Health Clinic",
                "address": "Shalimar Bagh, Delhi",
                "latitude": 28.7156,
                "longitude": 77.1592,
                "place_id": "ChIJb-50CVoDDTkRsAPFFBizU8o",
                "maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJb-50CVoDDTkRsAPFFBizU8o"
            },
            {
                "name": "Dr Ankit Daral",
                "email": "info@doctorshouse.in",
                "phone": "9310285558",
                "specialization": "Psychiatrist",
                "clinic_name": "Doctors House",
                "address": "Punjabi Bagh, Delhi",
                "latitude": 28.6672,
                "longitude": 77.1265,
                "place_id": "ChIJQ25W6TwDDTkRRCAcYJp-Wuo",
                "maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJQ25W6TwDDTkRRCAcYJp-Wuo"
            },
            {
                "name": "Dr Jitender Jakhar",
                "email": "insightmindcare@gmail.com",
                "phone": "9953294849",
                "specialization": "Psychiatrist",
                "clinic_name": "Insight Mind Care",
                "address": "Vasant Kunj, New Delhi",
                "latitude": 28.5234,
                "longitude": 77.1523,
                "place_id": "ChIJj908-j8fDTkR2GVycYE9zt8",
                "maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJj908-j8fDTkR2GVycYE9zt8"
            },
            {
                "name": "Dr Sakshi Anand",
                "email": "contact@witnessinghappiness.com",
                "phone": "9306059456",
                "specialization": "Psychiatrist",
                "clinic_name": "Witnessing Happiness Clinic",
                "address": "Rajinder Nagar, New Delhi",
                "latitude": 28.6385,
                "longitude": 77.1906,
                "place_id": "ChIJ1XJBV_QDDTkRO0S8CMbVhL0",
                "maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJ1XJBV_QDDTkRO0S8CMbVhL0"
            },
            {
                "name": "Anandam Psychiatry Centre",
                "email": "anandampsychiatry@gmail.com",
                "phone": "9582582707",
                "specialization": "Psychiatry",
                "clinic_name": "Anandam Psychiatry Centre",
                "address": "East Patel Nagar, New Delhi",
                "latitude": 28.6444,
                "longitude": 77.1687,
                "place_id": "ChIJkwA6OpUCDTkRu2UM-vGr6wY",
                "maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJkwA6OpUCDTkRu2UM-vGr6wY"
            }
        ]

        for doc_data in doctors_data:
            doc = Doctor(**doc_data)
            db.session.add(doc)
            print(f"Added doctor: {doc.name}")

        test_user = User(
            name="Test User",
            email="anshmisra29@gmail.com",
            is_verified=True
        )
        test_user.set_password("password123")
        db.session.add(test_user)
        
        db.session.commit()
        print("Database populated successfully.")

if __name__ == "__main__":
    populate()
