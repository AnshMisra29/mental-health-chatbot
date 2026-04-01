import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()  # Reads values from .env file automatically


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "change-me-in-production")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "sqlite:///mental_health.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "super-secret-jwt-key")
    # Token lives 2 hours; frontend inactivity timer handles the 15-min logout
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=2)
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

    # Flask-Mail configuration
    MAIL_SERVER = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    _mail_port = os.environ.get("MAIL_PORT")
    MAIL_PORT = int(_mail_port) if _mail_port and _mail_port.isdigit() else 587
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "True").lower() == "true"
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_DEFAULT_SENDER")

