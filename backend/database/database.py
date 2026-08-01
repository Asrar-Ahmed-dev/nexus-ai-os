from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite database file
DATABASE_URL = "sqlite:///./nexus.db"

# Create database engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Create session
SessionLocal = sessionmaker(
    autoflush=False,
    autocommit=False,
    bind=engine
)

# Base class for all database models
Base = declarative_base()