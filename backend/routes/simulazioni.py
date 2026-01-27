from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/simulazioni", tags=["simulazioni"])

# Models
class Domanda(BaseModel):
    id: str
    testo: str
    tipo: str  # "crocetta" o "completamento"
    opzioni: Optional[List[str]] = None
    rispostaCorretta: str
    risposteAccettate: Optional[List[str]] = None
    spiegazione: str
    materia: str

class DomandaCreate(BaseModel):
    testo: str
    tipo: str
    opzioni: Optional[List[str]] = None
    rispostaCorretta: str
    risposteAccettate: Optional[List[str]] = None
    spiegazione: str
    materia: str

class Simulazione(BaseModel):
    id: str
    titolo: str
    materia: str
    tipo: str
    domande: int
    durata: str
    livello: str
    descrizione: str
    attiva: bool
    created_at: str

class SimulazioneCreate(BaseModel):
    titolo: str
    materia: str
    tipo: str
    domande: int
    durata: str
    livello: str
    descrizione: str

class SimulazioneCompleta(BaseModel):
    simulazione: Simulazione
    domande_list: List[Domanda]

# CRUD Simulazioni
@router.get("/", response_model=List[Simulazione])
async def get_simulazioni(request: Request, attiva: Optional[bool] = None):
    """Recupera tutte le simulazioni"""
    db = request.app.state.db
    query = {}
    if attiva is not None:
        query["attiva"] = attiva
    
    simulazioni = await db.simulazioni.find(query, {"_id": 0}).to_list(1000)
    return simulazioni

@router.get("/attive", response_model=List[Simulazione])
async def get_simulazioni_attive(request: Request):
    """Recupera solo simulazioni attive (per il sito pubblico)"""
    db = request.app.state.db
    simulazioni = await db.simulazioni.find({"attiva": True}, {"_id": 0}).to_list(1000)
    return simulazioni

@router.post("/", response_model=Simulazione)
async def create_simulazione(request: Request, simulazione: SimulazioneCreate):
    """Crea una nuova simulazione"""
    db = request.app.state.db
    
    new_simulazione = {
        "id": str(uuid.uuid4()),
        **simulazione.model_dump(),
        "attiva": False,
        "created_at": datetime.utcnow().isoformat()
    }
    
    await db.simulazioni.insert_one(new_simulazione)
    # Return without _id
    del_result = new_simulazione.pop("_id", None)
    return new_simulazione

@router.get("/{simulazione_id}", response_model=SimulazioneCompleta)
async def get_simulazione_completa(request: Request, simulazione_id: str):
    """Recupera simulazione con tutte le sue domande"""
    db = request.app.state.db
    
    simulazione = await db.simulazioni.find_one({"id": simulazione_id}, {"_id": 0})
    if not simulazione:
        raise HTTPException(status_code=404, detail="Simulazione non trovata")
    
    domande = await db.domande.find({"simulazione_id": simulazione_id}, {"_id": 0}).to_list(1000)
    
    return {
        "simulazione": simulazione,
        "domande_list": domande
    }

@router.patch("/{simulazione_id}/toggle")
async def toggle_simulazione(request: Request, simulazione_id: str):
    """Attiva/disattiva simulazione"""
    db = request.app.state.db
    
    existing = await db.simulazioni.find_one({"id": simulazione_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Simulazione non trovata")
    
    new_status = not existing["attiva"]
    await db.simulazioni.update_one({"id": simulazione_id}, {"$set": {"attiva": new_status}})
    
    return {"success": True, "attiva": new_status}

@router.delete("/{simulazione_id}")
async def delete_simulazione(request: Request, simulazione_id: str):
    """Elimina simulazione e tutte le sue domande"""
    db = request.app.state.db
    
    result = await db.simulazioni.delete_one({"id": simulazione_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Simulazione non trovata")
    
    await db.domande.delete_many({"simulazione_id": simulazione_id})
    
    return {"success": True, "message": "Simulazione e domande eliminate"}

# CRUD Domande
@router.post("/{simulazione_id}/domande", response_model=Domanda)
async def add_domanda(request: Request, simulazione_id: str, domanda: DomandaCreate):
    """Aggiungi una domanda a una simulazione"""
    db = request.app.state.db
    
    simulazione = await db.simulazioni.find_one({"id": simulazione_id}, {"_id": 0})
    if not simulazione:
        raise HTTPException(status_code=404, detail="Simulazione non trovata")
    
    new_domanda = {
        "id": str(uuid.uuid4()),
        "simulazione_id": simulazione_id,
        **domanda.model_dump()
    }
    
    await db.domande.insert_one(new_domanda)
    new_domanda.pop("_id", None)
    return new_domanda

@router.get("/{simulazione_id}/domande", response_model=List[Domanda])
async def get_domande(request: Request, simulazione_id: str):
    """Recupera tutte le domande di una simulazione"""
    db = request.app.state.db
    
    domande = await db.domande.find({"simulazione_id": simulazione_id}, {"_id": 0}).to_list(1000)
    return domande

@router.put("/{simulazione_id}/domande/{domanda_id}", response_model=Domanda)
async def update_domanda(request: Request, simulazione_id: str, domanda_id: str, domanda: DomandaCreate):
    """Aggiorna una domanda"""
    db = request.app.state.db
    
    existing = await db.domande.find_one({"id": domanda_id, "simulazione_id": simulazione_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Domanda non trovata")
    
    updated_domanda = {
        **domanda.model_dump()
    }
    
    await db.domande.update_one({"id": domanda_id}, {"$set": updated_domanda})
    updated_domanda["id"] = domanda_id
    updated_domanda["simulazione_id"] = simulazione_id
    return updated_domanda

@router.delete("/{simulazione_id}/domande/{domanda_id}")
async def delete_domanda(request: Request, simulazione_id: str, domanda_id: str):
    """Elimina una domanda"""
    db = request.app.state.db
    
    result = await db.domande.delete_one({"id": domanda_id, "simulazione_id": simulazione_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Domanda non trovata")
    
    return {"success": True, "message": "Domanda eliminata"}
