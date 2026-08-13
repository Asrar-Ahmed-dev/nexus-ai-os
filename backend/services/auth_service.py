from database.database import SessionLocal
from database.models import User


def get_user_by_email(email: str):
    db = SessionLocal()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    db.close()

    return user


def get_user_by_username(username: str):
    db = SessionLocal()

    user = (
        db.query(User)
        .filter(User.username == username)
        .first()
    )

    db.close()

    return user


def create_user(
    email: str,
    username: str,
    password_hash: str,
):
    db = SessionLocal()

    user = User(
        email=email,
        username=username,
        password_hash=password_hash,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    db.close()

    return user