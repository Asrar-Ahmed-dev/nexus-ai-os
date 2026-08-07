from database.database import SessionLocal
from database.models import ChatMessage
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from services.ai_service import (
    ask_gemini,
    ask_gemini_stream,
)
from services.memory import save_message, get_recent_messages

router = APIRouter()


class ChatRequest(BaseModel):
    chat_id: int
    message: str


@router.post("/")
async def chat(request: ChatRequest):

    # Save user's message
    save_message(
        request.chat_id,
        "user",
        request.message,
    )

    # Get previous conversation
    history = get_recent_messages(request.chat_id)

    conversation = ""

    for msg in history:
        conversation += f"{msg.role}: {msg.content}\n"

    prompt = f"""
You are Nexus AI.

This is the previous conversation:

{conversation}

Now answer the user's latest message naturally.

User:
{request.message}
"""

    # Ask Gemini
    reply = ask_gemini(prompt)

    # Save AI reply
    save_message(
        request.chat_id,
        "assistant",
        reply,
    )

    return {
        "reply": reply
    }
@router.get("/{chat_id}/messages")
def get_messages(chat_id: int):

    db = SessionLocal()

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.chat_id == chat_id)
        .order_by(ChatMessage.id.asc())
        .all()
    )

    db.close()

    return [
        {
            "role": msg.role,
            "content": msg.content,
        }
        for msg in messages
    ]
@router.post("/stream")
async def stream_chat(request: ChatRequest):

    history = get_recent_messages(request.chat_id)

    conversation = ""

    for msg in history:
        conversation += f"{msg.role}: {msg.content}\n"

    prompt = f"""
You are Nexus AI.

This is the previous conversation:

{conversation}

Now answer the user's latest message naturally.

User:
{request.message}
"""

    return StreamingResponse(
        ask_gemini_stream(prompt),
        media_type="text/plain",
    )