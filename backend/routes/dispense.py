from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

from auth import admin_required
from supabase_db import list_dispense, create_dispensa, update_dispensa, delete_dispensa

router = APIRouter(prefix="/api/dispense", tags=["dispense"])

class DispensaIn(BaseModel):
    titolo: str = Field(..., min_length=1)
    materia: str = Field(..., min_length=1)
    descrizione: str = ""
    link: Optional[str] = None
    pubblicata: bool = False  # il frontend la usa come "enabled/pubblica"

@router.get("")
@router.get("/")
async def list_all(request: Request):
    try:
        return list_dispense()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Impossibile caricare le dispense, riprova tra poco. ({e})")

@router.post("", dependencies=[Depends(admin_required)])
@router.post("/", dependencies=[Depends(admin_required)])
async def create(payload: DispensaIn):
    item = {
        "id": str(uuid.uuid4()),
        "titolo": payload.titolo,
        "materia": payload.materia,
        "descrizione": payload.descrizione,
        "link": payload.link,
        "pubblicata": bool(payload.pubblicata),
        "created_at": datetime.utcnow().isoformat() + "Z",
    }
    try:
        return create_dispensa(item)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Impossibile salvare la dispensa. ({e})")

@router.put("/{dispensa_id}", dependencies=[Depends(admin_required)])
async def put_update(dispensa_id: str, payload: DispensaIn):
    upd = {
        "titolo": payload.titolo,
        "materia": payload.materia,
        "descrizione": payload.descrizione,
        "link": payload.link,
        "pubblicata": bool(payload.pubblicata),
    }
    try:
        return update_dispensa(dispensa_id, upd)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Impossibile aggiornare la dispensa. ({e})")

@router.patch("/{dispensa_id}", dependencies=[Depends(admin_required)])
async def patch_toggle(dispensa_id: str, request: Request):
    # frontend manda {enabled: true/false}
    body = await request.json()
    enabled = body.get("enabled")
    if enabled is None:
        raise HTTPException(status_code=400, detail="Campo 'enabled' mancante")
    try:
        return update_dispensa(dispensa_id, {"pubblicata": bool(enabled)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Impossibile pubblicare/nascondere. ({e})")

@router.delete("/{dispensa_id}", dependencies=[Depends(admin_required)])
async def delete(dispensa_id: str):
    try:
        delete_dispensa(dispensa_id)
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Impossibile eliminare la dispensa. ({e})")
