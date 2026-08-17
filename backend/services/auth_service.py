from database.database import SessionLocal
from database.models import User
from passlib.context import CryptContext
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def get_user_by_email(email: str):
    db = SessionLocal()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    db.close()

    return user

def get_user_by_id(user_id: int):
    db = SessionLocal()

    user = (
        db.query(User)
        .filter(User.id == user_id)
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
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def authenticate_user(email: str, password: str):
    user = get_user_by_email(email)

    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user