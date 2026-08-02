from sqlalchemy.orm import Session

from database.models import ChatMessage, ChatSession


def save_message(
    db: Session,
    chat_id: int,
    role: str,
    content: str,
):
    message = ChatMessage(
        chat_id=chat_id,
        role=role,
        content=content,
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message

def create_chat(db: Session):

    chat = ChatSession()

    db.add(chat)
    db.commit()
    db.refresh(chat)

    return chat