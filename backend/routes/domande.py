from __future__ import annotations

import json
import uuid
from pathlib import Path
from typing import List, Optional, Literal, Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from auth import admin_required

router = APIRouter(prefix="/api/admin/domande", tags=["admin-domande"])

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
DB_PATH = DATA_DIR / "domande.json"


# ----------------- utils -----------------
def _ensure_db():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not DB_PATH.exists():
        DB_PATH.write_text("[]", encoding="utf-8")


def _read_all() -> list[dict]:
    _ensure_db()
    try:
        return json.loads(DB_PATH.read_text(encoding="utf-8"))
    except Exception:
        return []


def _write_all(items: list[dict]):
    _ensure_db()
    DB_PATH.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")


def _norm_text(s: str) -> str:
    return (s or "").strip()


def _coerce_risposte(payload: dict) -> list[str]:
    """Accetta sia 'risposta' (string) sia 'risposte' (lista). Restituisce lista pulita."""
    if isinstance(payload.get("risposte"), list):
        out = [str(x).strip() for x in payload["risposte"] if str(x).strip()]
        return out
    r = payload.get("risposta")
    if isinstance(r, str) and r.strip():
        return [r.strip()]
    return []


def validate_question(q: dict):
    # campi base
    if not _norm_text(q.get("testo", "")):
        raise HTTPException(status_code=400, detail="testo mancante")

    tipo = q.get("tipo")
    if tipo not in ("scelta", "completamento"):
        raise HTTPException(status_code=400, detail="tipo non valido")

    if _norm_text(q.get("materia", "")) not in ("Chimica", "Fisica", "Biologia"):
        raise HTTPException(status_code=400, detail="materia non valida")

    # tags opzionali
    if "tag" in q and q["tag"] is not None:
        if not isinstance(q["tag"], list):
            raise HTTPException(status_code=400, detail="tag deve essere lista")
        q["tag"] = [str(x).strip() for x in q["tag"] if str(x).strip()]

    # validazione specifica tipo
    if tipo == "scelta":
        opts = q.get("opzioni")
        if not isinstance(opts, list) or len(opts) != 5:
            raise HTTPException(status_code=400, detail="opzioni deve essere una lista di 5 elementi")
        opts = [str(x).strip() for x in opts]
        if any(not x for x in opts):
            raise HTTPException(status_code=400, detail="opzioni non valide")
        q["opzioni"] = opts

        # corretta: accetta sia lettera (A-E) sia index (0-4) come corretta_index
        corretta_index = q.get("corretta_index")
        corretta = q.get("corretta")

        if corretta_index is None and corretta is None:
            raise HTTPException(status_code=400, detail="corretta mancante")

        if corretta_index is not None:
            try:
                idx = int(corretta_index)
            except Exception:
                raise HTTPException(status_code=400, detail="corretta_index non valido")
            if idx < 0 or idx > 4:
                raise HTTPException(status_code=400, detail="corretta_index deve essere tra 0 e 4")
            q["corretta_index"] = idx
            q["corretta"] = chr(65 + idx)
        else:
            lett = str(corretta).strip().upper()
            if lett not in ("A", "B", "C", "D", "E"):
                raise HTTPException(status_code=400, detail="corretta deve essere A/B/C/D/E")
            q["corretta"] = lett
            q["corretta_index"] = ord(lett) - 65

        # cleanup
        q.pop("risposta", None)
        q.pop("risposte", None)

    else:
        risposte = _coerce_risposte(q)
        if len(risposte) == 0:
            raise HTTPException(status_code=400, detail="risposta mancante")
        q["risposte"] = risposte

        # cleanup
        q.pop("opzioni", None)
        q.pop("corretta", None)
        q.pop("corretta_index", None)
        q.pop("risposta", None)

    # normalizza testo/descrizione/spiegazione
    for k in ("testo", "spiegazione"):
        if k in q and q[k] is not None:
            q[k] = str(q[k]).strip()


# ----------------- schemas -----------------
class QuestionIn(BaseModel):
    materia: Literal["Chimica", "Fisica", "Biologia"]
    tipo: Literal["scelta", "completamento"]
    testo: str = Field(..., min_length=1)
    tag: Optional[List[str]] = None

    # scelta multipla
    opzioni: Optional[List[str]] = None
    corretta: Optional[str] = None
    corretta_index: Optional[int] = None

    # completamento
    # supportiamo sia risposta (legacy) che risposte (nuovo)
    risposta: Optional[str] = None
    risposte: Optional[List[str]] = None

    spiegazione: Optional[str] = None


class QuestionOut(BaseModel):
    id: str
    materia: str
    tipo: str
    testo: str
    tag: List[str] = []
    opzioni: Optional[List[str]] = None
    corretta: Optional[str] = None
    corretta_index: Optional[int] = None
    risposte: Optional[List[str]] = None
    spiegazione: Optional[str] = None


# ----------------- endpoints -----------------
@router.get("", dependencies=[admin_required])
def list_questions() -> list[dict]:
    return _read_all()


@router.post("", dependencies=[admin_required])
def create_question(payload: QuestionIn):
    items = _read_all()
    q = payload.model_dump()
    q["id"] = uuid.uuid4().hex

    # normalizza compatibilità (risposta -> risposte)
    q["risposte"] = _coerce_risposte(q)

    validate_question(q)
    items.append(q)
    _write_all(items)
    return q


@router.put("/{qid}", dependencies=[admin_required])
def update_question(qid: str, payload: QuestionIn):
    items = _read_all()
    idx = next((i for i, x in enumerate(items) if x.get("id") == qid), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="domanda non trovata")

    q = payload.model_dump()
    q["id"] = qid
    q["risposte"] = _coerce_risposte(q)

    validate_question(q)
    items[idx] = q
    _write_all(items)
    return q


@router.delete("/{qid}", dependencies=[admin_required])
def delete_question(qid: str):
    items = _read_all()
    before = len(items)
    items = [x for x in items if x.get("id") != qid]
    if len(items) == before:
        raise HTTPException(status_code=404, detail="domanda non trovata")
    _write_all(items)
    return {"ok": True}
