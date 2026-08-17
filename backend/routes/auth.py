from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from passlib.context import CryptContext
from fastapi import Depends

from services.auth_service import (
    get_user_by_email,
    get_user_by_username,
    create_user,
    authenticate_user,
)

from services.jwt_service import (create_access_token, get_current_user,)


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


class LoginRequest(BaseModel):
    email: str
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


@router.post("/login")
def login(request: LoginRequest):

    user = authenticate_user(
        email=request.email,
        password=request.password,
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "sub": str(user.id)
        }
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
        }
    }
@router.get("/me")
def get_me(
    current_user = Depends(get_current_user)
):
    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "username": current_user.username,
        }
    }