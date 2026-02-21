from flask import Blueprint

alerts_bp = Blueprint("alerts", __name__)

from . import routes  # noqa: E402, F401
