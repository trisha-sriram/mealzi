"""
Database initialization script for CustomRecipeManager
This script creates all necessary database tables and initializes the database
"""

import os
from py4web import DAL
from . import settings
from .models import db

def init_db():
    """Initialize the database and create all tables"""
    print("Initializing database...")
    
    # Ensure the database folder exists
    os.makedirs(settings.DB_FOLDER, exist_ok=True)
    
    # Create all tables
    db.commit()
    
    print("Database initialization complete!")

if __name__ == "__main__":
    init_db() 