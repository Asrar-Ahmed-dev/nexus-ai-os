from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.database import SessionLocal
from services.database_service import (
    create_chat,
    update_chat_title,
    get_all_chats,
    delete_chat,
)

router = APIRouter()
class UpdateTitleRequest(BaseModel):
    title: str

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
@router.put("/{chat_id}/title")
def rename_chat(
    chat_id: int,
    request: UpdateTitleRequest,
    db: Session = Depends(get_db),
):
    chat = update_chat_title(
        db,
        chat_id,
        request.title,
    )

    if chat is None:
        return {
            "error": "Chat not found"
        }

    return {
        "id": chat.id,
        "title": chat.title,
    }
@router.get("/")
def get_chats(
    db: Session = Depends(get_db),
):
    chats = get_all_chats(db)

    return [
        {
            "id": chat.id,
            "title": chat.title,
        }
        for chat in chats
    ]
@router.delete("/{chat_id}")
def remove_chat(
    chat_id: int,
    db: Session = Depends(get_db),
):
    deleted = delete_chat(db, chat_id)

    if not deleted:
        return {
            "error": "Chat not found"
        }

    return {
        "success": True
    }