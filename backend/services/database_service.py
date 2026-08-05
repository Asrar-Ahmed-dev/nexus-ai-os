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
def update_chat_title(
    db: Session,
    chat_id: int,
    title: str,
):
    chat = (
        db.query(ChatSession)
        .filter(ChatSession.id == chat_id)
        .first()
    )

    if chat is None:
        return None

    chat.title = title

    db.commit()
    db.refresh(chat)

    return chat
def get_all_chats(db: Session):
    return (
        db.query(ChatSession)
        .order_by(ChatSession.created_at.desc())
        .all()
    )
def delete_chat(
    db: Session,
    chat_id: int,
):
    chat = (
        db.query(ChatSession)
        .filter(ChatSession.id == chat_id)
        .first()
    )

    if chat is None:
        return False

    db.delete(chat)
    db.commit()

    return True