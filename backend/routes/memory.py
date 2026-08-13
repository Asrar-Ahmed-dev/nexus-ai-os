from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.memory_service import (
    save_memory,
    get_memories,
    delete_memory,
)

router = APIRouter(
    prefix="/memory",
    tags=["Memory"]
)


class MemoryRequest(BaseModel):
    content: str


@router.post("/")
def create_memory(request: MemoryRequest):
    if not request.content.strip():
        raise HTTPException(
            status_code=400,
            detail="Memory cannot be empty"
        )

    memory = save_memory(request.content)

    return {
        "id": memory.id,
        "content": memory.content,
        "message": "Memory saved successfully"
    }


@router.get("/")
def read_memories():
    memories = get_memories()

    return [
        {
            "id": memory.id,
            "content": memory.content,
            "created_at": memory.created_at,
        }
        for memory in memories
    ]


@router.delete("/{memory_id}")
def remove_memory(memory_id: int):
    memory = delete_memory(memory_id)

    if not memory:
        raise HTTPException(
            status_code=404,
            detail="Memory not found"
        )

    return {
        "message": "Memory deleted successfully"
    }