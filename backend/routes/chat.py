import os

from database.database import SessionLocal
from database.models import ( ChatMessage, ChatSession, StoredFile,)
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

def get_user_file(
    filename: str,
    user_id: int,
):
    db = SessionLocal()

    try:
        stored_file = (
            db.query(StoredFile)
            .filter(
                StoredFile.filename == filename,
                StoredFile.user_id == user_id,
            )
            .first()
        )

        if stored_file is None:
            raise HTTPException(
                status_code=404,
                detail="File not found",
            )

        if not os.path.exists(
            stored_file.file_path
        ):
            raise HTTPException(
                status_code=404,
                detail="Physical file not found",
            )

        return stored_file

    finally:
        db.close()


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
        stored_file = get_user_file(
            request.filename,
            current_user.id,
        )

        
        file_context = extract_text(
            stored_file.file_path,
            stored_file.filename,
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
     

       stored_file = get_user_file(
           request.filename,
           current_user.id,
       )

      

       file_context = extract_text(
           stored_file.file_path,
           stored_file.filename,
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
IMPORTANT: The user has attached a file.

Filename:
{request.filename}

The following is the text extracted directly from the attached file:

--- BEGIN FILE CONTENT ---
File contents:
{file_context}
--- END FILE CONTENT ---
FILE ANSWERING RULES:

- The attached file is the primary source for questions about the file.
- Carefully use the actual file content above when answering.
- Do not give a generic answer when the requested information can be found in the file.
- Do not guess or invent information that is not present in the file.
- For names, subjects, marks, grades, SGPA, CGPA, dates, and other specific values, use the exact information found in the file.
- If the requested information cannot be found in the file, clearly say that it is not present in the file.
- If the user asks to list information from the file, extract it from the file rather than generating a typical/example list.
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