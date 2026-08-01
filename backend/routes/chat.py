from fastapi import APIRouter
from pydantic import BaseModel

from services.ai_service import ask_gemini
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