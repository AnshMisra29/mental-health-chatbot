from flask import Blueprint

mood_bp = Blueprint("mood", __name__)

from . import routes
