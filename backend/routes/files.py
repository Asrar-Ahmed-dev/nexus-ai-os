from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
import os
import shutil

from pypdf import PdfReader
from docx import Document

from database.database import SessionLocal
from database.models import StoredFile

from services.jwt_service import get_current_user


router = APIRouter(
    prefix="/files",
    tags=["Files"]
)


UPLOAD_DIR = "uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


# ==========================
# Extract Text
# ==========================

def extract_text(
    file_path: str,
    filename: str
) -> str:

    extension = os.path.splitext(
        filename
    )[1].lower()

    # PDF
    if extension == ".pdf":

        reader = PdfReader(
            file_path
        )

        text = ""

        for page in reader.pages:

            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

        return text

    # TXT
    elif extension == ".txt":

        with open(
            file_path,
            "r",
            encoding="utf-8"
        ) as file:

            return file.read()

    # DOCX
    elif extension == ".docx":

        document = Document(
            file_path
        )

        text = ""

        for paragraph in document.paragraphs:

            text += paragraph.text + "\n"

        return text

    else:

        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Use PDF, TXT, or DOCX."
        )


# ==========================
# Upload File
# ==========================

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):

    # Check filename
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is required."
        )

    # Get extension
    extension = os.path.splitext(
        file.filename
    )[1].lower()

    # Allowed file types
    allowed_extensions = {
        ".pdf",
        ".txt",
        ".docx"
    }

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Use PDF, TXT, or DOCX."
        )

    # Prevent path traversal
    filename = os.path.basename(
        file.filename
    )

    user_upload_dir = os.path.join(
        UPLOAD_DIR,
        str(current_user.id)
    )
    os.makedirs(
        user_upload_dir,
        exist_ok=True
    )
    file_path = os.path.join(
        user_upload_dir,
        filename
    )

    # Save physical file
    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    # Save database record
    db = SessionLocal()

    try:

        stored_file = StoredFile(
            user_id=current_user.id,
            filename=filename,
            file_type=extension,
            file_path=file_path
        )

        db.add(
            stored_file
        )

        db.commit()

        db.refresh(
            stored_file
        )

        return {
            "id": stored_file.id,
            "filename": stored_file.filename,
            "file_type": stored_file.file_type,
            "created_at": stored_file.created_at,
            "message": "File uploaded successfully"
        }

    finally:

        db.close()


# ==========================
# Get User Files
# ==========================

@router.get("/")
async def get_files(
    current_user=Depends(get_current_user)
):

    db = SessionLocal()

    try:

        files = (
            db.query(StoredFile)
            .filter(
                StoredFile.user_id == current_user.id
            )
            .order_by(
                StoredFile.id.desc()
            )
            .all()
        )

        return [
            {
                "id": file.id,
                "filename": file.filename,
                "file_type": file.file_type,
                "created_at": file.created_at
            }
            for file in files
        ]

    finally:

        db.close()

# ==========================
# Download File
# ==========================

@router.get("/download/{file_id}")
async def download_file(
    file_id: int,
    current_user=Depends(get_current_user)
):

    db = SessionLocal()

    try:

        stored_file = (
            db.query(StoredFile)
            .filter(
                StoredFile.id == file_id,
                StoredFile.user_id == current_user.id
            )
            .first()
        )

        if not stored_file:
            raise HTTPException(
                status_code=404,
                detail="File not found"
            )

        if not os.path.exists(
            stored_file.file_path
        ):
            raise HTTPException(
                status_code=404,
                detail="Physical file not found"
            )

        return FileResponse(
            path=stored_file.file_path,
            filename=stored_file.filename,
            media_type="application/octet-stream"
        )

    finally:

        db.close()
    
# ==========================
# Read File
# ==========================

@router.get("/read/{filename}")
async def read_file(
    filename: str,
    current_user=Depends(get_current_user)
):

    filename = os.path.basename(
        filename
    )

    db = SessionLocal()

    try:

        stored_file = (
            db.query(StoredFile)
            .filter(
                StoredFile.filename == filename,
                StoredFile.user_id == current_user.id
            )
            .first()
        )

        if not stored_file:
            raise HTTPException(
                status_code=404,
                detail="File not found"
            )

        if not os.path.exists(
            stored_file.file_path
        ):
            raise HTTPException(
                status_code=404,
                detail="Physical file not found"
            )

        text = extract_text(
            stored_file.file_path,
            stored_file.filename
        )

        return {
            "filename": stored_file.filename,
            "text": text
        }

    finally:

        db.close()
# ==========================
# Delete File
# ==========================

@router.delete("/{file_id}")
async def delete_file(
    file_id: int,
    current_user=Depends(get_current_user)
):

    db = SessionLocal()

    try:

        # Find file belonging to current user
        stored_file = (
            db.query(StoredFile)
            .filter(
                StoredFile.id == file_id,
                StoredFile.user_id == current_user.id
            )
            .first()
        )

        if not stored_file:
            raise HTTPException(
                status_code=404,
                detail="File not found"
            )

        # Delete physical file
        if os.path.exists(stored_file.file_path):
            os.remove(stored_file.file_path)

        # Delete database record
        db.delete(stored_file)
        db.commit()

        return {
            "message": "File deleted successfully"
        }

    finally:
        db.close()