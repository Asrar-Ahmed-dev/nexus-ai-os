from database.database import SessionLocal
from database.models import ChatMessage, ChatSession


def chat_belongs_to_user(
    chat_id: int,
    user_id: int,
):
    db = SessionLocal()

    chat = (
        db.query(ChatSession)
        .filter(
            ChatSession.id == chat_id,
            ChatSession.user_id == user_id,
        )
        .first()
    )

    db.close()

    return chat is not None


def save_message(
    chat_id: int,
    role: str,
    content: str,
    user_id: int,
):
    db = SessionLocal()

    chat = (
        db.query(ChatSession)
        .filter(
            ChatSession.id == chat_id,
            ChatSession.user_id == user_id,
        )
        .first()
    )

    if chat is None:
        db.close()
        return False

    message = ChatMessage(
        chat_id=chat_id,
        role=role,
        content=content,
    )

    db.add(message)
    db.commit()
    db.close()

    return True


def get_recent_messages(
    chat_id: int,
    user_id: int,
    limit: int = 10,
):
    db = SessionLocal()

    chat = (
        db.query(ChatSession)
        .filter(
            ChatSession.id == chat_id,
            ChatSession.user_id == user_id,
        )
        .first()
    )

    if chat is None:
        db.close()
        return None

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.chat_id == chat_id)
        .order_by(ChatMessage.id.desc())
        .limit(limit)
        .all()
    )

    db.close()

    return list(reversed(messages))