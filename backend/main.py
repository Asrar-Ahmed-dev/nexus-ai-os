from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.database import engine
from database.models import Base

from routes.chat import router as chat_router
from routes.chats import router as chats_router
from routes.files import router as files_router

app = FastAPI()
# Create all database tables
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/chat")
app.include_router(chats_router, prefix="/chats")
app.include_router(files_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to Nexus AI OS 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "online"
    }