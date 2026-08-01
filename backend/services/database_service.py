from sqlalchemy.orm import Session

from database.models import ChatMessage


def save_message(db: Session, role: str, content: str):
    message = ChatMessage(
        role=role,
        content=content
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message