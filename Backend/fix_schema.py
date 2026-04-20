"""
Migration script to add missing election_id column to votes table
"""
from sqlalchemy import text
from app.database import engine

def add_election_id_column():
    """Add election_id column to votes table if it doesn't exist"""
    with engine.connect() as connection:
        try:
            # Check if column already exists
            result = connection.execute(text("""
                SELECT EXISTS(
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='votes' AND column_name='election_id'
                )
            """))
            
            column_exists = result.scalar()
            
            if column_exists:
                print("✓ election_id column already exists in votes table")
                return True
            
            # Add the column with foreign key constraint
            connection.execute(text("""
                ALTER TABLE votes 
                ADD COLUMN election_id INTEGER 
                REFERENCES elections(id) ON DELETE SET NULL
            """))
            
            connection.commit()
            print("✓ Successfully added election_id column to votes table")
            return True
            
        except Exception as e:
            print(f"✗ Error: {e}")
            connection.rollback()
            return False

if __name__ == "__main__":
    success = add_election_id_column()
    exit(0 if success else 1)
