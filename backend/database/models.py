from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from database.database import Base


# ==========================
# Chat Sessions
# ==========================

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, default="New Chat")

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    messages = relationship(
        "ChatMessage",
        back_populates="session",
        cascade="all, delete"
    )


# ==========================
# Chat Messages
# ==========================

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)

    chat_id = Column(
        Integer,
        ForeignKey("chat_sessions.id")
    )

    role = Column(String)

    content = Column(String)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    session = relationship(
        "ChatSession",
        back_populates="messages"
    )