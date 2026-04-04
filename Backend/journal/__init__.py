from flask import Blueprint

journal_bp = Blueprint("journal", __name__)

from . import routes
