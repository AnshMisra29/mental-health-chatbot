from flask import Blueprint

doctors_bp = Blueprint('doctors', __name__)

from . import routes
