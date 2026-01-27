import os
import uuid
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import Optional
import shutil

router = APIRouter(prefix="/api/files", tags=["files"])

# Directory per i file caricati (RELATIVA AL BACKEND)
BASE_DIR = Path(__file__).resolve().parent.parent  # backend/
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Sottocartelle
PDF_DIR = UPLOAD_DIR / "pdf"
IMAGES_DIR = UPLOAD_DIR / "images"
PDF_DIR.mkdir(parents=True, exist_ok=True)
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    file_type: str = Form(...)
):
    """Upload di file (PDF o immagini)"""
    try:
        # Genera nome file unico
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"

        # Determina directory di destinazione
        if file_type == "pdf":
            destination = PDF_DIR / unique_filename
        elif file_type == "image":
            destination = IMAGES_DIR / unique_filename
        else:
            raise HTTPException(status_code=400, detail="Tipo file non valido (usa 'pdf' o 'image')")

        # Salva il file
        with destination.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {
            "success": True,
            "filename": unique_filename,
            "original_filename": file.filename,
            "file_path": f"/uploads/{'pdf' if file_type == 'pdf' else 'images'}/{unique_filename}",
            "file_type": file_type,
            "uploaded_at": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante l'upload: {str(e)}")

@router.get("/list")
async def list_files(file_type: Optional[str] = None):
    """Lista tutti i file caricati"""
    try:
        files = []

        # Lista PDF
        if not file_type or file_type == "pdf":
            for file_path in PDF_DIR.iterdir():
                if file_path.is_file():
                    files.append({
                        "filename": file_path.name,
                        "file_type": "pdf",
                        "size": file_path.stat().st_size,
                        "created_at": datetime.fromtimestamp(file_path.stat().st_ctime).isoformat(),
                        "url": f"/uploads/pdf/{file_path.name}",
                    })

        # Lista immagini
        if not file_type or file_type == "image":
            for file_path in IMAGES_DIR.iterdir():
                if file_path.is_file():
                    files.append({
                        "filename": file_path.name,
                        "file_type": "image",
                        "size": file_path.stat().st_size,
                        "created_at": datetime.fromtimestamp(file_path.stat().st_ctime).isoformat(),
                        "url": f"/uploads/images/{file_path.name}",
                    })

        return {"files": files}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore nel recupero dei file: {str(e)}")

@router.delete("/{filename}")
async def delete_file(filename: str, file_type: str):
    """Elimina un file"""
    try:
        if file_type == "pdf":
            file_path = PDF_DIR / filename
        elif file_type == "image":
            file_path = IMAGES_DIR / filename
        else:
            raise HTTPException(status_code=400, detail="Tipo file non valido (usa 'pdf' o 'image')")

        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File non trovato")

        file_path.unlink()
        return {"success": True, "message": "File eliminato con successo"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante l'eliminazione: {str(e)}")


