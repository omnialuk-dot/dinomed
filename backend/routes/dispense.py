from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid
import os
import json

router = APIRouter(prefix="/api/dispense", tags=["dispense"])

# =========================
# JSON fallback storage
# =========================
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # backend/
DATA_DIR = os.path.join(BASE_DIR, "data")
DATA_FILE = os.path.join(DATA_DIR, "dispense.json")


def _ensure_data_file():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            f.write("[]")


def _write_all(items):
    _ensure_data_file()
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)


def _read_all():
    """
    Legge il JSON in modo robusto:
    - se è vuoto -> []
    - se è corrotto -> reset a []
    """
    _ensure_data_file()
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            content = f.read().strip()
            if not content:
                return []
            return json.loads(content)
    except Exception:
        _write_all([])
        return []


# =========================
# Models
# =========================
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
    file_url: Optional[str] = None
    created_at: str


class DispensaCreate(BaseModel):
    titolo: str = Field(..., min_length=1)
    materia: str = Field(..., min_length=1)
    descrizione: str = Field(..., min_length=1)
    aChiServe: str = Field(..., min_length=1)
    pagine: int = Field(..., ge=1)
    tag: List[str] = Field(..., min_length=1)
    filename: Optional[str] = None
    pubblicata: Optional[bool] = True


def _make_file_url(request: Request, filename: Optional[str]) -> Optional[str]:
    if not filename:
        return None
    base = str(request.base_url).rstrip("/")
    return f"{base}/uploads/pdf/{filename}"


# =========================
# Routes
# =========================

# LIST (admin: può includere anche non pubblicate)
@router.get("", response_model=List[DispensaOut])
async def list_dispense(
    request: Request,
    include_unpublished: bool = False,
):
    db = getattr(request.app.state, "db", None)

    # Mongo mode
    if db is not None:
        query = {} if include_unpublished else {"pubblicata": True}
        return await db.dispense.find(query, {"_id": 0}).to_list(2000)

    # JSON fallback
    items = _read_all()
    if include_unpublished:
        return items
    return [x for x in items if x.get("pubblicata") is True]


# CREATE
@router.post("", response_model=DispensaOut)
async def create_dispensa(request: Request, payload: DispensaCreate):
    db = getattr(request.app.state, "db", None)

    new_item = {
        "id": str(uuid.uuid4()),
        "titolo": payload.titolo.strip(),
        "materia": payload.materia.strip(),
        "descrizione": payload.descrizione.strip(),
        "aChiServe": payload.aChiServe.strip(),
        "pagine": int(payload.pagine),
        "tag": [t.strip() for t in payload.tag if t.strip()],
        "filename": payload.filename.strip() if payload.filename else None,
        "file_url": _make_file_url(request, payload.filename.strip() if payload.filename else None),
        "pubblicata": bool(payload.pubblicata),
        "created_at": datetime.utcnow().isoformat(),
    }

    if len(new_item["tag"]) == 0:
        raise HTTPException(status_code=422, detail="Inserisci almeno 1 tag valido.")

    # Mongo mode
    if db is not None:
        await db.dispense.insert_one(new_item)
        return new_item

    # JSON fallback
    items = _read_all()
    items.append(new_item)
    _write_all(items)
    return new_item


# UPDATE
@router.put("/{dispensa_id}", response_model=DispensaOut)
async def update_dispensa(request: Request, dispensa_id: str, payload: DispensaCreate):
    db = getattr(request.app.state, "db", None)

    updated_fields = {
        "titolo": payload.titolo.strip(),
        "materia": payload.materia.strip(),
        "descrizione": payload.descrizione.strip(),
        "aChiServe": payload.aChiServe.strip(),
        "pagine": int(payload.pagine),
        "tag": [t.strip() for t in payload.tag if t.strip()],
        "filename": payload.filename.strip() if payload.filename else None,
        "file_url": _make_file_url(request, payload.filename.strip() if payload.filename else None),
        "pubblicata": bool(payload.pubblicata),
    }

    if len(updated_fields["tag"]) == 0:
        raise HTTPException(status_code=422, detail="Inserisci almeno 1 tag valido.")

    # Mongo mode
    if db is not None:
        existing = await db.dispense.find_one({"id": dispensa_id}, {"_id": 0})
        if not existing:
            raise HTTPException(status_code=404, detail="Dispensa non trovata")

        await db.dispense.update_one({"id": dispensa_id}, {"$set": updated_fields})
        return {**existing, **updated_fields, "id": dispensa_id}

    # JSON fallback
    items = _read_all()
    for i, x in enumerate(items):
        if x.get("id") == dispensa_id:
            items[i] = {**x, **updated_fields}
            _write_all(items)
            return items[i]

    raise HTTPException(status_code=404, detail="Dispensa non trovata")


# TOGGLE pubblicata
@router.patch("/{dispensa_id}/toggle")
async def toggle_dispensa(request: Request, dispensa_id: str):
    db = getattr(request.app.state, "db", None)

    if db is not None:
        existing = await db.dispense.find_one({"id": dispensa_id}, {"_id": 0})
        if not existing:
            raise HTTPException(status_code=404, detail="Dispensa non trovata")
        new_status = not bool(existing.get("pubblicata", True))
        await db.dispense.update_one({"id": dispensa_id}, {"$set": {"pubblicata": new_status}})
        return {"success": True, "pubblicata": new_status}

    items = _read_all()
    for x in items:
        if x.get("id") == dispensa_id:
            x["pubblicata"] = not bool(x.get("pubblicata", True))
            _write_all(items)
            return {"success": True, "pubblicata": x["pubblicata"]}

    raise HTTPException(status_code=404, detail="Dispensa non trovata")


# DELETE
@router.delete("/{dispensa_id}")
async def delete_dispensa(request: Request, dispensa_id: str):
    db = getattr(request.app.state, "db", None)

    if db is not None:
        result = await db.dispense.delete_one({"id": dispensa_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Dispensa non trovata")
        return {"success": True}

    items = _read_all()
    new_items = [x for x in items if x.get("id") != dispensa_id]
    if len(new_items) == len(items):
        raise HTTPException(status_code=404, detail="Dispensa non trovata")
    _write_all(new_items)
    return {"success": True}