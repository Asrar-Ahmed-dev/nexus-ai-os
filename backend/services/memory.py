from database.database import SessionLocal
from database.models import ChatMessage


def save_message(chat_id: int, role: str, content: str):
    db = SessionLocal()

    message = ChatMessage(
        chat_id=chat_id,
        role=role,
        content=content,
    )

    db.add(message)
    db.commit()
    db.close()


def get_recent_messages(chat_id: int, limit: int = 10):
    db = SessionLocal()

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.chat_id == chat_id)
        .order_by(ChatMessage.id.desc())
        .limit(limit)
        .all()
    )

    db.close()

    return list(reversed(messages))