from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from services.memory_service import (
    save_memory,
    get_memories,
    delete_memory,
)

from services.jwt_service import get_current_user


router = APIRouter(
    prefix="/memory",
    tags=["Memory"]
)


class MemoryRequest(BaseModel):
    content: str


@router.post("/")
def create_memory(
    request: MemoryRequest,
    current_user=Depends(get_current_user),
):
    if not request.content.strip():
        raise HTTPException(
            status_code=400,
            detail="Memory cannot be empty"
        )

    memory = save_memory(
        content=request.content,
        user_id=current_user.id,
    )

    return {
        "id": memory.id,
        "content": memory.content,
        "message": "Memory saved successfully"
    }


@router.get("/")
def read_memories(
    current_user=Depends(get_current_user),
):
    memories = get_memories(
        user_id=current_user.id
    )

    return [
        {
            "id": memory.id,
            "content": memory.content,
            "created_at": memory.created_at,
        }
        for memory in memories
    ]


@router.delete("/{memory_id}")
def remove_memory(
    memory_id: int,
    current_user=Depends(get_current_user),
):
    memory = delete_memory(
        memory_id=memory_id,
        user_id=current_user.id,
    )

    if not memory:
        raise HTTPException(
            status_code=404,
            detail="Memory not found"
        )

    return {
        "message": "Memory deleted successfully"
    }