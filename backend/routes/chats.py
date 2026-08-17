from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import SessionLocal
from services.database_service import (
    create_chat,
    update_chat_title,
    get_all_chats,
    delete_chat,
)

from services.jwt_service import get_current_user


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


# ==========================
# Create New Chat
# ==========================

@router.post("/")
def new_chat(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    chat = create_chat(
        db,
        current_user.id,
    )

    return {
        "id": chat.id,
        "title": chat.title,
    }


# ==========================
# Rename Chat
# ==========================

@router.put("/{chat_id}/title")
def rename_chat(
    chat_id: int,
    request: UpdateTitleRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    chat = update_chat_title(
        db,
        chat_id,
        request.title,
        current_user.id,
    )

    if chat is None:
        raise HTTPException(
            status_code=404,
            detail="Chat not found",
        )

    return {
        "id": chat.id,
        "title": chat.title,
    }


# ==========================
# Get User's Chats
# ==========================

@router.get("/")
def get_chats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    chats = get_all_chats(
        db,
        current_user.id,
    )

    return [
        {
            "id": chat.id,
            "title": chat.title,
        }
        for chat in chats
    ]


# ==========================
# Delete Chat
# ==========================

@router.delete("/{chat_id}")
def remove_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    deleted = delete_chat(
        db,
        chat_id,
        current_user.id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Chat not found",
        )

    return {
        "success": True
    }