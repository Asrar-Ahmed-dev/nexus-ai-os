from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from passlib.context import CryptContext

from services.auth_service import (
    get_user_by_email,
    get_user_by_username,
    create_user,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str


@router.post("/register")
def register(request: RegisterRequest):

    if get_user_by_email(request.email):
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    if get_user_by_username(request.username):
        raise HTTPException(
            status_code=400,
            detail="Username already taken"
        )

    password_hash = pwd_context.hash(
        request.password
    )

    user = create_user(
        email=request.email,
        username=request.username,
        password_hash=password_hash,
    )

    return {
        "message": "Account created successfully",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
        }
    }