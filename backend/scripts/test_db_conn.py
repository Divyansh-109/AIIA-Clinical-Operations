import sys
import os

# Add parent directory to path so app modules are resolved
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import engine
from sqlalchemy import text

def test_connection():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();")).fetchone()
            print("SUCCESS: Connected to PostgreSQL!")
            print(f"Database version: {result[0]}")
            return True
    except Exception as e:
        print(f"FAILED: Could not connect to PostgreSQL: {e}")
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
