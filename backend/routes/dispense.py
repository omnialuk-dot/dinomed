from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid
import os
import json

router = APIRouter(prefix="/api/dispense", tags=["dispense"])

# =========================
# JSON storage
# =========================
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # backend/
DATA_DIR = os.path.join(BASE_DIR, "data")
DATA_FILE = os.path.join(DATA_DIR, "dispense.json")


def _ensure_data_file():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            f.write("[]")


def _read_all() -> List[dict]:
    _ensure_data_file()
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            content = f.read().strip()
            if not content:
                return []
            data = json.loads(content)
            return data if isinstance(data, list) else []
    except Exception:
        # se è corrotto, reset
        _write_all([])
        return []


def _write_all(items: List[dict]):
    _ensure_data_file()
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)


def _normalize(x: dict) -> dict:
    """
    Compatibilità: se in vecchie versioni c'è file_url ma non link,
    copia file_url in link.
    """
    if not x.get("link") and x.get("file_url"):
        x["link"] = x.get("file_url")
    return x


# =========================
# Models
# =========================
class DispensaCreate(BaseModel):
    titolo: str = Field(..., min_length=1)
    materia: str = Field(..., min_length=1)
    descrizione: str = Field(..., min_length=1)
    aChiServe: str = Field(..., min_length=1)
    pagine: int = Field(..., ge=1)
    tag: List[str] = Field(..., min_length=1)

    filename: Optional[str] = None
    link: Optional[str] = None  # ✅ IMPORTANTISSIMO: salva url pdf
    pubblicata: Optional[bool] = True


class DispensaOut(BaseModel):
    id: str
    titolo: str
    materia: str
    descrizione: str
    aChiServe: str
    pagine: int
    tag: List[str]
    pubblicata: bool
    filename: Optional[str] = None
    link: Optional[str] = None
    created_at: str


# =========================
# Routes
# =========================

@router.get("")
@router.get("/")
async def list_dispense(request: Request, include_unpublished: bool = False):
    """
    Pubblico:
      - include_unpublished=false (default) -> solo pubblicate
    Admin UI:
      - include_unpublished=true -> tutte
    """
    db = getattr(request.app.state, "db", None)

    # Mongo (se esiste)
    if db is not None:
        query = {} if include_unpublished else {"pubblicata": True}
        data = await db.dispense.find(query, {"_id": 0}).to_list(2000)
        return data

    items = [_normalize(x) for x in _read_all()]
    if include_unpublished:
        return items
    return [x for x in items if x.get("pubblicata") is True]


@router.post("")
@router.post("/")
async def create_dispensa(request: Request, payload: DispensaCreate):
    db = getattr(request.app.state, "db", None)

    tags_clean = [t.strip() for t in payload.tag if t and t.strip()]
    if len(tags_clean) == 0:
        raise HTTPException(status_code=422, detail="Inserisci almeno 1 tag valido.")

    new_item = {
        "id": str(uuid.uuid4()),
        "titolo": payload.titolo.strip(),
        "materia": payload.materia.strip(),
        "descrizione": payload.descrizione.strip(),
        "aChiServe": payload.aChiServe.strip(),
        "pagine": int(payload.pagine),
        "tag": tags_clean,
        "filename": payload.filename.strip() if payload.filename else None,
        "link": payload.link.strip() if payload.link else None,   # ✅ SALVATO
        "pubblicata": bool(payload.pubblicata),
        "created_at": datetime.utcnow().isoformat(),
    }

    # Mongo
    if db is not None:
        await db.dispense.insert_one(new_item)
        return new_item

    # JSON
    items = _read_all()
    items.insert(0, new_item)
    _write_all(items)
    return new_item


@router.put("/{dispensa_id}")
async def update_dispensa(request: Request, dispensa_id: str, payload: DispensaCreate):
    db = getattr(request.app.state, "db", None)

    tags_clean = [t.strip() for t in payload.tag if t and t.strip()]
    if len(tags_clean) == 0:
        raise HTTPException(status_code=422, detail="Inserisci almeno 1 tag valido.")

    updated_fields = {
        "titolo": payload.titolo.strip(),
        "materia": payload.materia.strip(),
        "descrizione": payload.descrizione.strip(),
        "aChiServe": payload.aChiServe.strip(),
        "pagine": int(payload.pagine),
        "tag": tags_clean,
        "filename": payload.filename.strip() if payload.filename else None,
        "link": payload.link.strip() if payload.link else None,   # ✅ SALVATO
        "pubblicata": bool(payload.pubblicata),
    }

    # Mongo
    if db is not None:
        existing = await db.dispense.find_one({"id": dispensa_id}, {"_id": 0})
        if not existing:
            raise HTTPException(status_code=404, detail="Dispensa non trovata")
        await db.dispense.update_one({"id": dispensa_id}, {"$set": updated_fields})
        return {**existing, **updated_fields, "id": dispensa_id}

    # JSON
    items = _read_all()
    for i, x in enumerate(items):
        if x.get("id") == dispensa_id:
            items[i] = {**x, **updated_fields}
            _write_all(items)
            return _normalize(items[i])

    raise HTTPException(status_code=404, detail="Dispensa non trovata")


@router.patch("/{dispensa_id}/toggle")
async def toggle_dispensa(request: Request, dispensa_id: str):
    db = getattr(request.app.state, "db", None)

    # Mongo
    if db is not None:
        existing = await db.dispense.find_one({"id": dispensa_id}, {"_id": 0})
        if not existing:
            raise HTTPException(status_code=404, detail="Dispensa non trovata")
        new_status = not bool(existing.get("pubblicata", True))
        await db.dispense.update_one({"id": dispensa_id}, {"$set": {"pubblicata": new_status}})
        return {"success": True, "pubblicata": new_status}

    # JSON
    items = _read_all()
    for x in items:
        if x.get("id") == dispensa_id:
            x["pubblicata"] = not bool(x.get("pubblicata", True))
            _write_all(items)
            return {"success": True, "pubblicata": x["pubblicata"]}

    raise HTTPException(status_code=404, detail="Dispensa non trovata")


@router.delete("/{dispensa_id}")
async def delete_dispensa(request: Request, dispensa_id: str):
    db = getattr(request.app.state, "db", None)

    # Mongo
    if db is not None:
        result = await db.dispense.delete_one({"id": dispensa_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Dispensa non trovata")
        return {"success": True}

    # JSON
    items = _read_all()
    new_items = [x for x in items if x.get("id") != dispensa_id]
    if len(new_items) == len(items):
        raise HTTPException(status_code=404, detail="Dispensa non trovata")
    _write_all(new_items)
    return {"success": True}