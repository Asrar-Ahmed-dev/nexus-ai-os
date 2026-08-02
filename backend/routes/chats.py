from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.database import SessionLocal
from services.database_service import create_chat

router = APIRouter()


# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def new_chat(db: Session = Depends(get_db)):
    chat = create_chat(db)

    return {
        "id": chat.id,
        "title": chat.title
    }