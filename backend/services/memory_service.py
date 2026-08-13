from database.database import SessionLocal
from database.models import Memory


def save_memory(content: str, user_id: int = 1):
    db = SessionLocal()

    memory = Memory(
        user_id=user_id,
        content=content,
    )

    db.add(memory)
    db.commit()
    db.refresh(memory)

    db.close()

    return memory


def get_memories(user_id: int = 1):
    db = SessionLocal()

    memories = (
        db.query(Memory)
        .filter(Memory.user_id == user_id)
        .order_by(Memory.created_at.desc())
        .all()
    )

    db.close()

    return memories


def delete_memory(memory_id: int, user_id: int = 1):
    db = SessionLocal()

    memory = (
        db.query(Memory)
        .filter(
            Memory.id == memory_id,
            Memory.user_id == user_id,
        )
        .first()
    )

    if memory:
        db.delete(memory)
        db.commit()

    db.close()

    return memory