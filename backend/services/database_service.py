from sqlalchemy.orm import Session

from database.models import ChatMessage, ChatSession


# ==========================
# Messages
# ==========================

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


# ==========================
# Create Chat
# ==========================

def create_chat(
    db: Session,
    user_id: int,
):
    chat = ChatSession(
        user_id=user_id
    )

    db.add(chat)
    db.commit()
    db.refresh(chat)

    return chat


# ==========================
# Rename Chat
# ==========================

def update_chat_title(
    db: Session,
    chat_id: int,
    title: str,
    user_id: int,
):
    chat = (
        db.query(ChatSession)
        .filter(
            ChatSession.id == chat_id,
            ChatSession.user_id == user_id,
        )
        .first()
    )

    if chat is None:
        return None

    chat.title = title

    db.commit()
    db.refresh(chat)

    return chat


# ==========================
# Get User's Chats
# ==========================

def get_all_chats(
    db: Session,
    user_id: int,
):
    return (
        db.query(ChatSession)
        .filter(
            ChatSession.user_id == user_id
        )
        .order_by(
            ChatSession.created_at.desc()
        )
        .all()
    )


# ==========================
# Delete Chat
# ==========================

def delete_chat(
    db: Session,
    chat_id: int,
    user_id: int,
):
    chat = (
        db.query(ChatSession)
        .filter(
            ChatSession.id == chat_id,
            ChatSession.user_id == user_id,
        )
        .first()
    )

    if chat is None:
        return False

    db.delete(chat)
    db.commit()

    return True