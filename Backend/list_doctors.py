from app import app
from database.db import db
from database.models import Doctor

with app.app_context():
    doctors = Doctor.query.all()
    for d in doctors:
        print(f"{d.name}: {d.latitude}, {d.longitude}")
