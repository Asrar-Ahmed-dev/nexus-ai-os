import os

from database.database import SessionLocal
from database.models import ChatMessage, ChatSession

from fastapi import APIRouter, Depends, HTTPException
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

from services.jwt_service import get_current_user

from routes.files import extract_text


router = APIRouter()


class ChatRequest(BaseModel):
    chat_id: int
    message: str
    filename: str | None = None


def verify_chat_ownership(
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

    if chat is None:
        raise HTTPException(
            status_code=404,
            detail="Chat not found",
        )

    return chat


@router.post("/")
async def chat(
    request: ChatRequest,
    current_user=Depends(get_current_user),
):

    # Verify that this chat belongs to the logged-in user
    verify_chat_ownership(
        request.chat_id,
        current_user.id,
    )

    # Save user's message
    saved = save_message(
        request.chat_id,
        "user",
        request.message,
        current_user.id,
    )

    if not saved:
        raise HTTPException(
            status_code=404,
            detail="Chat not found",
        )

    # Get previous conversation
    history = get_recent_messages(
        request.chat_id,
        current_user.id,
    )

    conversation = ""

    if history:
        for msg in history:
            conversation += (
                f"{msg.role}: {msg.content}\n"
            )

    # Get long-term memories
    memories = get_memories(
        user_id=current_user.id
    )

    memory_context = ""

    for memory in memories:
        memory_context += (
            f"- {memory.content}\n"
        )

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
        current_user.id,
    )

    return {
        "reply": reply
    }


@router.get("/{chat_id}/messages")
def get_messages(
    chat_id: int,
    current_user=Depends(get_current_user),
):

    # Verify ownership
    verify_chat_ownership(
        chat_id,
        current_user.id,
    )

    db = SessionLocal()

    messages = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.chat_id == chat_id
        )
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
async def stream_chat(
    request: ChatRequest,
    current_user=Depends(get_current_user),
):

    # Verify that this chat belongs to the logged-in user
    verify_chat_ownership(
        request.chat_id,
        current_user.id,
    )

    # Save user's message
    saved = save_message(
        request.chat_id,
        "user",
        request.message,
        current_user.id,
    )

    if not saved:
        raise HTTPException(
            status_code=404,
            detail="Chat not found",
        )

    # Get previous conversation
    history = get_recent_messages(
        request.chat_id,
        current_user.id,
    )

    conversation = ""

    if history:
        for msg in history:
            conversation += (
                f"{msg.role}: {msg.content}\n"
            )

    # Get long-term memories
    memories = get_memories(
        user_id=current_user.id
    )

    memory_context = ""

    for memory in memories:
        memory_context += (
            f"- {memory.content}\n"
        )

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
            current_user.id,
        )

    return StreamingResponse(
        generate(),
        media_type="text/plain",
    )