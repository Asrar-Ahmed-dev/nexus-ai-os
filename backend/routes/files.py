from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import shutil

from pypdf import PdfReader
from docx import Document


router = APIRouter(prefix="/files", tags=["Files"])

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


def extract_text(file_path: str, filename: str) -> str:
    extension = os.path.splitext(filename)[1].lower()

    # PDF
    if extension == ".pdf":
        reader = PdfReader(file_path)

        text = ""

        for page in reader.pages:
            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

        return text

    # TXT
    elif extension == ".txt":
        with open(file_path, "r", encoding="utf-8") as file:
            return file.read()

    # DOCX
    elif extension == ".docx":
        document = Document(file_path)

        text = ""

        for paragraph in document.paragraphs:
            text += paragraph.text + "\n"

        return text

    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Use PDF, TXT, or DOCX."
        )


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "filename": file.filename,
        "message": "File uploaded successfully"
    }


@router.get("/read/{filename}")
async def read_file(filename: str):

    file_path = os.path.join(UPLOAD_DIR, filename)

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    text = extract_text(file_path, filename)

    return {
        "filename": filename,
        "text": text
    }