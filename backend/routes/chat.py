import os

from database.database import SessionLocal
from database.models import ChatMessage

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from services.ai_service import (
    ask_gemini,
    ask_gemini_stream,
)

from services.memory import (
    save_message,
    get_recent_messages,
)
from services.memory_service import get_memories

from routes.files import extract_text


router = APIRouter()


class ChatRequest(BaseModel):
    chat_id: int
    message: str
    filename: str | None = None


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

        # Get long-term memories
        memories = get_memories(user_id=1)
        memory_context = ""
        for memory in memories:
            memory_context += f"- {memory.content}\n"

    # Read attached file if provided
    file_context = ""

    if request.filename:
        file_path = os.path.join(
            "uploads",
            request.filename,
        )

        if os.path.exists(file_path):
            file_context = extract_text(
                file_path,
                request.filename,
            )

    prompt = f"""
You are Nexus AI.

These are things you remember about the user:

{memory_context}

This is the previous conversation:

{conversation}

"""

    if file_context:
        prompt += f"""
The user has attached the following file:

Filename: {request.filename}

File contents:
{file_context}

Use the file contents when answering the user's question.
"""

    prompt += f"""
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
        # Get long-term memories
        memories = get_memories(user_id=1)
        memory_context = ""

        for memory in memories:      
            memory_context += f"- {memory.content}\n"

    # Read attached file if provided
    file_context = ""

    if request.filename:
        file_path = os.path.join(
            "uploads",
            request.filename,
        )

        if os.path.exists(file_path):
            file_context = extract_text(
                file_path,
                request.filename,
            )

    prompt = f"""
You are Nexus AI
These are things you remember about the user:
{memory_context}
This is the previous conversation:
{conversation}
"""
    if file_context:
        prompt += f"""
The user has attached a file.
Filename:
{request.filename}
File contents:
{file_context}
Use the file contents when answering the user's question.
If the question is about the file, base your answer on its contents.
"""
        prompt += f"""
Now answer the user's latest message naturally.
User:
{request.message}
"""
    def generate():

        full_reply = ""

        for chunk in ask_gemini_stream(prompt):
            full_reply += chunk
            yield chunk

        # Save complete AI response
        save_message(
            request.chat_id,
            "assistant",
            full_reply,
        )

    return StreamingResponse(
        generate(),
        media_type="text/plain",
    )