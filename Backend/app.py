from flask import Flask
from flask_migrate import Migrate

from config import Config
from database.db import db

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
migrate = Migrate(app, db)

# Import models so Flask-Migrate can detect tables
from database import models

if __name__ == "__main__":
    app.run(debug=True)
