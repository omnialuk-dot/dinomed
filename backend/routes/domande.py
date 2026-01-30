from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime
import uuid
import os
import json

from routes.admin import admin_required  # il tuo JWT guard

router = APIRouter(tags=["domande"])

# =========================
# JSON storage
# =========================
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # backend/
DATA_DIR = os.path.join(BASE_DIR, "data")
DATA_FILE = os.path.join(DATA_DIR, "domande.json")


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
    _ensure_data_file()
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            txt = f.read().strip()
            if not txt:
                return []
            return json.loads(txt)
    except Exception:
        _write_all([])
        return []


TipoDomanda = Literal["scelta", "completamento"]
Materia = Literal["Chimica", "Fisica", "Biologia"]


class DomandaBase(BaseModel):
    materia: Materia
    tipo: TipoDomanda
    testo: str = Field(..., min_length=1)
    tag: List[str] = Field(default_factory=list)
    difficolta: str = Field("Base", min_length=1)
    spiegazione: str = Field(..., min_length=1)  # ✅ fondamentale


class DomandaSceltaCreate(DomandaBase):
    tipo: Literal["scelta"]
    opzioni: List[str] = Field(..., min_length=2)
    corretta_index: int = Field(..., ge=0)


class DomandaCompletamentoCreate(DomandaBase):
    tipo: Literal["completamento"]
    risposte: List[str] = Field(..., min_length=1)


DomandaCreate = DomandaSceltaCreate | DomandaCompletamentoCreate


class DomandaOut(BaseModel):
    id: str
    materia: Materia
    tipo: TipoDomanda
    testo: str
    tag: List[str]
    difficolta: str
    spiegazione: str
    opzioni: Optional[List[str]] = None
    corretta_index: Optional[int] = None
    risposte: Optional[List[str]] = None
    created_at: str


def _normalize_tags(tags: List[str]) -> List[str]:
    out = []
    for t in tags or []:
        s = str(t).strip()
        if s:
            out.append(s)
    # unique per lowercase
    seen = set()
    uniq = []
    for t in out:
        k = t.lower()
        if k in seen:
            continue
        seen.add(k)
        uniq.append(t)
    return uniq


def _validate(d: Dict[str, Any]):
    if d["tipo"] == "scelta":
        if not d.get("opzioni") or len(d["opzioni"]) < 2:
            raise HTTPException(status_code=422, detail="Scelta: servono almeno 2 opzioni")
        ci = d.get("corretta_index")
        if ci is None:
            raise HTTPException(status_code=422, detail="Scelta: corretta_index obbligatorio")
        if ci < 0 or ci >= len(d["opzioni"]):
            raise HTTPException(status_code=422, detail="Scelta: corretta_index fuori range")
    else:
        if not d.get("risposte") or len(d["risposte"]) < 1:
            raise HTTPException(status_code=422, detail="Completamento: inserisci almeno 1 risposta")


# =========================
# ADMIN CRUD
# =========================

@router.get("/api/admin/domande", response_model=List[DomandaOut], dependencies=[Depends(admin_required)])
async def admin_list_domande(
    materia: Optional[str] = None,
    tipo: Optional[str] = None,
    tag: Optional[str] = None,
    q: Optional[str] = None,
):
    items = _read_all()

    def ok(x):
        if materia and x.get("materia") != materia:
            return False
        if tipo and x.get("tipo") != tipo:
            return False
        if tag:
            tags = x.get("tag") or []
            if not any(str(t).strip() == tag for t in tags):
                return False
        if q:
            s = q.lower().strip()
            blob = " ".join([
                str(x.get("testo", "")),
                str(x.get("materia", "")),
                str(x.get("tipo", "")),
                " ".join(x.get("tag") or []),
                str(x.get("difficolta", "")),
            ]).lower()
            if s not in blob:
                return False
        return True

    return [x for x in items if ok(x)]


@router.post("/api/admin/domande", response_model=DomandaOut, dependencies=[Depends(admin_required)])
async def admin_create_domanda(payload: DomandaCreate):
    d = payload.model_dump()

    d["id"] = str(uuid.uuid4())
    d["created_at"] = datetime.utcnow().isoformat()
    d["tag"] = _normalize_tags(d.get("tag") or [])

    d["testo"] = d["testo"].strip()
    d["spiegazione"] = d["spiegazione"].strip()
    d["difficolta"] = (d.get("difficolta") or "Base").strip()

    if d["tipo"] == "scelta":
        d["opzioni"] = [str(x).strip() for x in d.get("opzioni") or []]
    else:
        d["risposte"] = [str(x).strip() for x in d.get("risposte") or [] if str(x).strip()]

    _validate(d)

    items = _read_all()
    items.append(d)
    _write_all(items)
    return d


@router.put("/api/admin/domande/{domanda_id}", response_model=DomandaOut, dependencies=[Depends(admin_required)])
async def admin_update_domanda(domanda_id: str, payload: DomandaCreate):
    items = _read_all()
    idx = next((i for i, x in enumerate(items) if x.get("id") == domanda_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="Domanda non trovata")

    d = payload.model_dump()
    d["id"] = domanda_id
    d["created_at"] = items[idx].get("created_at") or datetime.utcnow().isoformat()
    d["tag"] = _normalize_tags(d.get("tag") or [])

    d["testo"] = d["testo"].strip()
    d["spiegazione"] = d["spiegazione"].strip()
    d["difficolta"] = (d.get("difficolta") or "Base").strip()

    if d["tipo"] == "scelta":
        d["opzioni"] = [str(x).strip() for x in d.get("opzioni") or []]
    else:
        d["risposte"] = [str(x).strip() for x in d.get("risposte") or [] if str(x).strip()]

    _validate(d)

    items[idx] = d
    _write_all(items)
    return d


@router.delete("/api/admin/domande/{domanda_id}", dependencies=[Depends(admin_required)])
async def admin_delete_domanda(domanda_id: str):
    items = _read_all()
    new_items = [x for x in items if x.get("id") != domanda_id]
    if len(new_items) == len(items):
        raise HTTPException(status_code=404, detail="Domanda non trovata")
    _write_all(new_items)
    return {"success": True}


# =========================
# PUBLIC HELPERS (filtri)
# =========================

@router.get("/api/domande/tags")
async def public_tags():
    items = _read_all()
    tags = []
    for x in items:
        tags.extend(x.get("tag") or [])
    uniq = sorted(set([str(t).strip() for t in tags if str(t).strip()]), key=lambda s: s.lower())
    return {"tags": uniq}


@router.get("/api/domande/counts")
async def public_counts():
    items = _read_all()
    out = {}
    for x in items:
        key = f"{x.get('materia')}::{x.get('tipo')}"
        out[key] = out.get(key, 0) + 1
    return {"counts": out}