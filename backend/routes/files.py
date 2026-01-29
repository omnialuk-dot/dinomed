from fastapi import APIRouter

router = APIRouter(prefix="/api/files", tags=["files"])

@router.get("/ping")
async def ping():
    return {"ok": True, "msg": "files route alive"}