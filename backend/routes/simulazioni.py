from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from pathlib import Path
import json
import uuid
import os

router = APIRouter(prefix="/api/simulazioni", tags=["simulazioni"])

DATA_FILE = (Path(__file__).resolve().parent.parent / "data" / "simulazioni.json")


# ---------- helpers (file-based storage) ----------

def _ensure_file():
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not DATA_FILE.exists():
        DATA_FILE.write_text("[]", encoding="utf-8")

def _read_all() -> List[dict]:
    _ensure_file()
    raw = DATA_FILE.read_text(encoding="utf-8").strip()
    if not raw:
        return []
    try:
        data = json.loads(raw)
        return data if isinstance(data, list) else []
    except json.JSONDecodeError:
        # se il file si è corrotto, non crashare il server
        return []

def _write_all(items: List[dict]) -> None:
    _ensure_file()
    DATA_FILE.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")


def _require_admin(req: Request):
    """
    Sicurezza semplice:
    - se in .env metti ADMIN_TOKEN=qualcosa
      allora serve header: Authorization: Bearer <token>
    - se ADMIN_TOKEN non è settato, in locale permette (comodo per dev)
    """
    token = os.getenv("ADMIN_TOKEN", "").strip()
    if not token:
        return
    auth = req.headers.get("authorization", "")
    if auth != f"Bearer {token}":
        raise HTTPException(status_code=401, detail="Not authorized")


# ---------- models ----------

class Simulazione(BaseModel):
    id: str
    titolo: str
    descrizione: str = ""
    materia: str = "Altro"
    livello: str = "Base"
    tag: List[str] = Field(default_factory=list)
    durataMin: Optional[int] = None
    link: Optional[str] = None
    published: bool = False
    created_at: str
    updated_at: str


class SimulazioneCreate(BaseModel):
    titolo: str
    descrizione: str = ""
    materia: str = "Altro"
    livello: str = "Base"
    tag: List[str] = Field(default_factory=list)
    durataMin: Optional[int] = None
    link: Optional[str] = None
    published: bool = False


class SimulazioneUpdate(BaseModel):
    titolo: Optional[str] = None
    descrizione: Optional[str] = None
    materia: Optional[str] = None
    livello: Optional[str] = None
    tag: Optional[List[str]] = None
    durataMin: Optional[int] = None
    link: Optional[str] = None
    published: Optional[bool] = None


# ---------- endpoints ----------

@router.get("", response_model=List[Simulazione])
@router.get("/", response_model=List[Simulazione])
async def list_pubbliche():
    """Lista pubblica: ritorna solo simulazioni pubblicate."""
    items = _read_all()
    return [x for x in items if x.get("published", False) is True]


@router.get("/all", response_model=List[Simulazione])
async def list_all(request: Request):
    """Lista completa (admin)."""
    _require_admin(request)
    return _read_all()


@router.get("/{sim_id}", response_model=Simulazione)
async def get_one(sim_id: str):
    items = _read_all()
    for x in items:
        if x.get("id") == sim_id:
            # se non è pubblicata, la vedrà solo chi usa /all (admin). Qui lasciamo semplice.
            return x
    raise HTTPException(status_code=404, detail="Simulazione non trovata")


@router.post("", response_model=Simulazione)
@router.post("/", response_model=Simulazione)
async def create_one(request: Request, body: SimulazioneCreate):
    _require_admin(request)

    now = datetime.utcnow().isoformat() + "Z"
    new_item = {
        "id": str(uuid.uuid4()),
        **body.model_dump(),
        "created_at": now,
        "updated_at": now,
    }

    items = _read_all()
    items.insert(0, new_item)
    _write_all(items)
    return new_item


@router.put("/{sim_id}", response_model=Simulazione)
async def update_one(request: Request, sim_id: str, body: SimulazioneUpdate):
    _require_admin(request)

    items = _read_all()
    for i, x in enumerate(items):
        if x.get("id") == sim_id:
            patch = {k: v for k, v in body.model_dump().items() if v is not None}
            x.update(patch)
            x["updated_at"] = datetime.utcnow().isoformat() + "Z"
            items[i] = x
            _write_all(items)
            return x
    raise HTTPException(status_code=404, detail="Simulazione non trovata")


@router.delete("/{sim_id}")
async def delete_one(request: Request, sim_id: str):
    _require_admin(request)

    items = _read_all()
    new_items = [x for x in items if x.get("id") != sim_id]
    if len(new_items) == len(items):
        raise HTTPException(status_code=404, detail="Simulazione non trovata")
    _write_all(new_items)
    return {"ok": True}