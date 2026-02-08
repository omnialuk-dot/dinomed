from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from pathlib import Path
import uuid
import os

from supabase_db import get_supabase_client

router = APIRouter(prefix="/api/files", tags=["files"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf"}

def is_admin(request: Request) -> bool:
    auth = request.headers.get("authorization", "")
    if not auth.lower().startswith("bearer "):
        return False

    token = auth.split(" ", 1)[1].strip()

    admin_token = os.getenv("ADMIN_TOKEN", "")
    if admin_token and token == admin_token:
        return True

    try:
        import jwt
        payload = jwt.decode(token, os.getenv("JWT_SECRET", ""), algorithms=["HS256"])
        return payload.get("role") == "admin"
    except Exception:
        return False

@router.get("/ping")
async def ping():
    return {"ok": True, "msg": "files route alive"}

@router.post("/upload")
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    file_type: str = "pdf",
):
    if not is_admin(request):
        raise HTTPException(status_code=401, detail="Not authorized")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Formato non supportato")

    safe_name = f"{uuid.uuid4().hex}{ext}"
    content = await file.read()

    # Supabase Storage
    try:
        sb = get_supabase_client()
        bucket = os.getenv("DISPENSE_BUCKET", "dispense")
        storage_path = safe_name
        sb.storage.from_(bucket).upload(
            storage_path,
            content,
            {"content-type": "application/pdf", "upsert": "true"},
        )
        public_url = sb.storage.from_(bucket).get_public_url(storage_path)
        return {"ok": True, "stored_as": safe_name, "file_path": public_url, "storage": "supabase"}
    except Exception as e:
        # Fallback local
        try:
            dest = UPLOAD_DIR / safe_name
            dest.write_bytes(content)
            return {"ok": True, "stored_as": safe_name, "file_path": f"/uploads/{safe_name}", "storage": "local", "warning": str(e)}
        except Exception as e2:
            raise HTTPException(status_code=500, detail=f"Upload fallito: {e2}")
