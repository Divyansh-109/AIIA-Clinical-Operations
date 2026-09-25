import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import engine, Base
import app.models  # ensure all models imported
from sqlalchemy import text

def run_migration():
    print("Creating all missing tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created.")

    # Check and add columns if they don't exist
    with engine.connect() as conn:
        # Check serious_adverse_events
        sae_columns = [
            ("awareness_date", "TIMESTAMP WITH TIME ZONE"),
            ("causality_assessment", "VARCHAR(100) DEFAULT 'UNCLASSIFIED'"),
            ("expectedness", "VARCHAR(50) DEFAULT 'UNEXPECTED'"),
            ("pv_reviewer_id", "UUID REFERENCES users(id)"),
            ("pv_review_completed_at", "TIMESTAMP WITH TIME ZONE"),
            ("follow_up_notes", "TEXT")
        ]
        for col, col_type in sae_columns:
            try:
                conn.execute(text(f"ALTER TABLE serious_adverse_events ADD COLUMN IF NOT EXISTS {col} {col_type};"))
                conn.commit()
            except Exception as e:
                print(f"Col {col} check: {e}")

        # Check documents
        doc_columns = [
            ("status", "VARCHAR(50) DEFAULT 'APPROVED'"),
            ("approved_by", "UUID REFERENCES users(id)"),
            ("approval_date", "DATE")
        ]
        for col, col_type in doc_columns:
            try:
                conn.execute(text(f"ALTER TABLE documents ADD COLUMN IF NOT EXISTS {col} {col_type};"))
                conn.commit()
            except Exception as e:
                print(f"Col {col} check: {e}")

    print("Migration complete!")

if __name__ == "__main__":
    run_migration()
