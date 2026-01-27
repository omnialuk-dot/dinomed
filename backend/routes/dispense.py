from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/dispense", tags=["dispense"])

class Dispensa(BaseModel):
    id: str
    titolo: str
    materia: str
    descrizione: str
    aChiServe: str
    pagine: int
    tag: List[str]
    pubblicata: bool
    filename: Optional[str] = None
    file_url: Optional[str] = None
    created_at: str

class DispensaCreate(BaseModel):
    titolo: str
    materia: str
    descrizione: str
    aChiServe: str
    pagine: int
    tag: List[str]
    filename: Optional[str] = None

@router.get("/", response_model=List[Dispensa])
async def get_dispense(request: Request, pubblicata: Optional[bool] = None):
    """Recupera tutte le dispense"""
    db = request.app.state.db
    query = {}
    if pubblicata is not None:
        query["pubblicata"] = pubblicata
    
    dispense = await db.dispense.find(query, {"_id": 0}).to_list(1000)
    return dispense

@router.get("/pubbliche", response_model=List[Dispensa])
async def get_dispense_pubbliche(request: Request):
    """Recupera solo dispense pubblicate (per il sito pubblico)"""
    db = request.app.state.db
    dispense = await db.dispense.find({"pubblicata": True}, {"_id": 0}).to_list(1000)
    return dispense

@router.post("/", response_model=Dispensa)
async def create_dispensa(request: Request, dispensa: DispensaCreate):
    """Crea una nuova dispensa"""
    db = request.app.state.db
    
    # Genera URL file se presente
    file_url = None
    if dispensa.filename:
        backend_url = request.headers.get("origin", "http://localhost:8001")
        file_url = f"{backend_url}/uploads/pdf/{dispensa.filename}"
    
    new_dispensa = {
        "id": str(uuid.uuid4()),
        **dispensa.model_dump(),
        "file_url": file_url,
        "pubblicata": True,
        "created_at": datetime.utcnow().isoformat()
    }
    
    await db.dispense.insert_one(new_dispensa)
    return new_dispensa

@router.put("/{dispensa_id}", response_model=Dispensa)
async def update_dispensa(request: Request, dispensa_id: str, dispensa: DispensaCreate):
    """Aggiorna una dispensa"""
    db = request.app.state.db
    
    existing = await db.dispense.find_one({"id": dispensa_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Dispensa non trovata")
    
    # Genera URL file se presente
    file_url = None
    if dispensa.filename:
        backend_url = request.headers.get("origin", "http://localhost:8001")
        file_url = f"{backend_url}/uploads/pdf/{dispensa.filename}"
    
    updated_dispensa = {
        **dispensa.model_dump(),
        "file_url": file_url,
        "pubblicata": existing["pubblicata"],
        "created_at": existing["created_at"]
    }
    
    await db.dispense.update_one({"id": dispensa_id}, {"$set": updated_dispensa})
    updated_dispensa["id"] = dispensa_id
    return updated_dispensa

@router.patch("/{dispensa_id}/toggle")
async def toggle_dispensa(request: Request, dispensa_id: str):
    """Cambia stato pubblicazione dispensa"""
    db = request.app.state.db
    
    existing = await db.dispense.find_one({"id": dispensa_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Dispensa non trovata")
    
    new_status = not existing["pubblicata"]
    await db.dispense.update_one({"id": dispensa_id}, {"$set": {"pubblicata": new_status}})
    
    return {"success": True, "pubblicata": new_status}

@router.delete("/{dispensa_id}")
async def delete_dispensa(request: Request, dispensa_id: str):
    """Elimina una dispensa"""
    db = request.app.state.db
    
    result = await db.dispense.delete_one({"id": dispensa_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Dispensa non trovata")
    
    return {"success": True, "message": "Dispensa eliminata"}
