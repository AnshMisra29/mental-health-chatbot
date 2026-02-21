import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "your-default-secret-key")
    SQLALCHEMY_DATABASE_URI = "sqlite:///mental_health.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
