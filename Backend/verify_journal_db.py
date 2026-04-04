import os
import sys
# Add parent directory to path if needed
sys.path.append(os.getcwd())

from app import app
from database.db import db
from sqlalchemy import inspect

with app.app_context():
    # Force table creation just in case
    db.create_all()
    
    inspector = inspect(db.engine)
    if 'journal_entries' in inspector.get_table_names():
        print("SUCCESS: journal_entries table exists.")
    else:
        print("FAILURE: journal_entries table NOT found.")
