from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from database.database import SessionLocal
from database.models import Note

from services.jwt_service import get_current_user


router = APIRouter(
    prefix="/notes",
    tags=["Notes"]
)


# ==========================
# Request Models
# ==========================

class NoteCreate(BaseModel):
    title: str
    content: str = ""


class NoteUpdate(BaseModel):
    title: str
    content: str


# ==========================
# Create Note
# ==========================

@router.post("/")
def create_note(
    request: NoteCreate,
    current_user=Depends(get_current_user)
):

    db = SessionLocal()

    note = Note(
        user_id=current_user.id,
        title=request.title,
        content=request.content
    )

    db.add(note)
    db.commit()
    db.refresh(note)

    db.close()

    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "is_pinned": bool(note.is_pinned),
        "created_at": note.created_at,
        "updated_at": note.updated_at
    }


# ==========================
# Get All Notes
# ==========================

@router.get("/")
def get_notes(
    current_user=Depends(get_current_user)
):

    db = SessionLocal()

    notes = (
        db.query(Note)
        .filter(
            Note.user_id == current_user.id
        )
        .order_by(
            Note.is_pinned.desc(),
            Note.updated_at.desc()
        )
        .all()
    )

    db.close()

    return [
        {
            "id": note.id,
            "title": note.title,
            "content": note.content,
            "is_pinned": bool(note.is_pinned),
            "created_at": note.created_at,
            "updated_at": note.updated_at
        }
        for note in notes
    ]


# ==========================
# Get Single Note
# ==========================

@router.get("/{note_id}")
def get_note(
    note_id: int,
    current_user=Depends(get_current_user)
):

    db = SessionLocal()

    note = (
        db.query(Note)
        .filter(
            Note.id == note_id,
            Note.user_id == current_user.id
        )
        .first()
    )

    db.close()

    if note is None:
        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "is_pinned": bool(note.is_pinned),
        "created_at": note.created_at,
        "updated_at": note.updated_at
    }


# ==========================
# Update Note
# ==========================

@router.put("/{note_id}")
def update_note(
    note_id: int,
    request: NoteUpdate,
    current_user=Depends(get_current_user)
):

    db = SessionLocal()

    note = (
        db.query(Note)
        .filter(
            Note.id == note_id,
            Note.user_id == current_user.id
        )
        .first()
    )

    if note is None:
        db.close()

        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    note.title = request.title
    note.content = request.content

    db.commit()
    db.refresh(note)

    db.close()

    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "is_pinned": bool(note.is_pinned),
        "created_at": note.created_at,
        "updated_at": note.updated_at
    }


# ==========================
# Delete Note
# ==========================

@router.delete("/{note_id}")
def delete_note(
    note_id: int,
    current_user=Depends(get_current_user)
):

    db = SessionLocal()

    note = (
        db.query(Note)
        .filter(
            Note.id == note_id,
            Note.user_id == current_user.id
        )
        .first()
    )

    if note is None:
        db.close()

        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    db.delete(note)
    db.commit()

    db.close()

    return {
        "message": "Note deleted successfully"
    }


# ==========================
# Pin / Unpin Note
# ==========================

@router.put("/{note_id}/pin")
def toggle_pin(
    note_id: int,
    current_user=Depends(get_current_user)
):

    db = SessionLocal()

    note = (
        db.query(Note)
        .filter(
            Note.id == note_id,
            Note.user_id == current_user.id
        )
        .first()
    )

    if note is None:
        db.close()

        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    note.is_pinned = 0 if note.is_pinned else 1

    db.commit()
    db.refresh(note)

    db.close()

    return {
        "id": note.id,
        "is_pinned": bool(note.is_pinned)
    }