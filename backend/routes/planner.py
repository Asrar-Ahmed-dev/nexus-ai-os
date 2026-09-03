from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from database.database import SessionLocal
from database.models import Task
from services.jwt_service import get_current_user


router = APIRouter(
    prefix="/planner",
    tags=["Planner"]
)


# ==========================
# Request Models
# ==========================

class TaskCreate(BaseModel):
    title: str
    description: str = ""
    due_date: datetime


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    due_date: datetime | None = None
    completed: bool | None = None


# ==========================
# Get Tasks
# ==========================

@router.get("/tasks")
def get_tasks(
    current_user=Depends(get_current_user)
):
    db = SessionLocal()

    try:
        tasks = (
            db.query(Task)
            .filter(Task.user_id == current_user.id)
            .order_by(Task.due_date.asc())
            .all()
        )

        return tasks

    finally:
        db.close()


# ==========================
# Create Task
# ==========================

@router.post("/tasks")
def create_task(
    request: TaskCreate,
    current_user=Depends(get_current_user)
):
    db = SessionLocal()

    try:
        task = Task(
            user_id=current_user.id,
            title=request.title,
            description=request.description,
            due_date=request.due_date,
            completed=0,
        )

        db.add(task)
        db.commit()
        db.refresh(task)

        return task

    finally:
        db.close()


# ==========================
# Update Task
# ==========================

@router.put("/tasks/{task_id}")
def update_task(
    task_id: int,
    request: TaskUpdate,
    current_user=Depends(get_current_user)
):
    db = SessionLocal()

    try:
        task = (
            db.query(Task)
            .filter(
                Task.id == task_id,
                Task.user_id == current_user.id,
            )
            .first()
        )

        if task is None:
            raise HTTPException(
                status_code=404,
                detail="Task not found"
            )

        if request.title is not None:
            task.title = request.title

        if request.description is not None:
            task.description = request.description

        if request.due_date is not None:
            task.due_date = request.due_date

        if request.completed is not None:
            task.completed = 1 if request.completed else 0

        db.commit()
        db.refresh(task)

        return task

    finally:
        db.close()


# ==========================
# Delete Task
# ==========================

@router.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    current_user=Depends(get_current_user)
):
    db = SessionLocal()

    try:
        task = (
            db.query(Task)
            .filter(
                Task.id == task_id,
                Task.user_id == current_user.id,
            )
            .first()
        )

        if task is None:
            raise HTTPException(
                status_code=404,
                detail="Task not found"
            )

        db.delete(task)
        db.commit()

        return {
            "message": "Task deleted successfully"
        }

    finally:
        db.close()