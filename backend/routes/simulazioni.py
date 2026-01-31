from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime
import uuid
import random
import os
import json
from pathlib import Path

from auth import admin_required

router = APIRouter(prefix="/api/simulazioni", tags=["simulazioni"])

# =========================
# In-memory sessions (DEV)
# =========================
SESSIONS: Dict[str, Dict[str, Any]] = {}


# =========================
# Models
# =========================
class Section(BaseModel):
    materia: str
    scelta: int
    completamento: int
    tag: List[str] = []
    difficolta: str = "Base"


class StartPayload(BaseModel):
    duration_min: int = 0
    sections: List[Section]
    order: List[str]


class AnswerIn(BaseModel):
    id: str
    tipo: Literal["scelta", "completamento"]
    answer_index: Optional[int] = None
    answer_text: Optional[str] = None


class SubmitPayload(BaseModel):
    answers: List[AnswerIn]


# =========================
# CRUD Simulazioni (JSON) — per Dashboard Admin
# =========================
BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
SIM_FILE = DATA_DIR / "simulazioni.json"


def _ensure_db():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not SIM_FILE.exists():
        SIM_FILE.write_text("[]", encoding="utf-8")


def _read_all() -> List[dict]:
    _ensure_db()
    try:
        data = json.loads(SIM_FILE.read_text(encoding="utf-8") or "[]")
        return data if isinstance(data, list) else []
    except Exception:
        return []


def _write_all(items: List[dict]):
    _ensure_db()
    SIM_FILE.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")


class SimDomanda(BaseModel):
    qid: str
    tipo: Literal["scelta", "completamento"]
    testo: str = Field(..., min_length=1)
    opzioni: Optional[List[str]] = None
    corretta: Optional[int] = None  # index per scelta
    risposte: Optional[List[str]] = None  # per completamento
    spiegazione: Optional[str] = None


class SimulazioneIn(BaseModel):
    titolo: str = Field(..., min_length=1)
    materia: str = Field(..., min_length=1)
    descrizione: str = Field(..., min_length=1)
    durata_min: int = Field(0, ge=0, le=240)
    difficolta: str = "Base"
    tag: List[str] = Field(default_factory=list)
    pubblicata: bool = True
    domande: List[SimDomanda] = Field(default_factory=list)


@router.get("")
@router.get("/")
async def list_simulazioni(request: Request, include_unpublished: bool = False):
    items = _read_all()
    if include_unpublished:
        admin_required(request)
        return items
    return [x for x in items if x.get("pubblicata") is True]


@router.post("")
@router.post("/")
async def create_simulazione(payload: SimulazioneIn, _=Depends(admin_required)):
    items = _read_all()
    new_item = payload.model_dump()
    new_item["id"] = uuid.uuid4().hex
    new_item["created_at"] = datetime.utcnow().isoformat()
    items.insert(0, new_item)
    _write_all(items)
    return new_item


@router.put("/{sim_id}")
async def update_simulazione(sim_id: str, payload: SimulazioneIn, _=Depends(admin_required)):
    items = _read_all()
    idx = next((i for i, x in enumerate(items) if x.get("id") == sim_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="Simulazione non trovata")
    cur = items[idx]
    upd = payload.model_dump()
    upd["id"] = sim_id
    upd["created_at"] = cur.get("created_at") or datetime.utcnow().isoformat()
    items[idx] = upd
    _write_all(items)
    return upd


@router.patch("/{sim_id}/toggle")
async def toggle_simulazione(sim_id: str, _=Depends(admin_required)):
    items = _read_all()
    for x in items:
        if x.get("id") == sim_id:
            x["pubblicata"] = not bool(x.get("pubblicata", True))
            _write_all(items)
            return {"success": True, "pubblicata": x["pubblicata"]}
    raise HTTPException(status_code=404, detail="Simulazione non trovata")


@router.delete("/{sim_id}")
async def delete_simulazione(sim_id: str, _=Depends(admin_required)):
    items = _read_all()
    new_items = [x for x in items if x.get("id") != sim_id]
    if len(new_items) == len(items):
        raise HTTPException(status_code=404, detail="Simulazione non trovata")
    _write_all(new_items)
    return {"success": True}


# =========================
# Helpers
# =========================
def _norm(s: Optional[str]) -> str:
    return (s or "").strip().lower()


def _make_mock_question(materia: str, tipo: str, tag: List[str]) -> Dict[str, Any]:
    qid = str(uuid.uuid4())
    if tipo == "scelta":
        opzioni = ["A", "B", "C", "D", "E"]
        correct = random.randint(0, len(opzioni) - 1)
        return {
            "id": qid,
            "materia": materia,
            "tipo": "scelta",
            "tag": tag,
            "testo": f"[{materia}] Domanda a crocette (mock) #{qid[:4]}",
            "opzioni": opzioni,
            # soluzione salvata solo in sessione, non la mandiamo al client
            "_correct_index": correct,
            "_spiegazione": f"Spiegazione (mock): la risposta corretta è {opzioni[correct]} perché è un test di prova.",
        }

    # completamento
    correct_word = random.choice(["equilibrio", "energia", "osmosi", "tampone", "mole"])
    return {
        "id": qid,
        "materia": materia,
        "tipo": "completamento",
        "tag": tag,
        "testo": f"[{materia}] Completa con UNA parola (mock) #{qid[:4]}",
        "_correct_text": correct_word,
        "_spiegazione": f"Spiegazione (mock): la parola corretta è '{correct_word}' perché così è impostata la domanda di test.",
    }


def _public_question(q: Dict[str, Any]) -> Dict[str, Any]:
    # ritorna al client senza campi privati (soluzioni)
    out = dict(q)
    out.pop("_correct_index", None)
    out.pop("_correct_text", None)
    out.pop("_spiegazione", None)
    return out


# =========================
# Routes
# =========================
@router.post("/start")
def start(payload: StartPayload):
    if not payload.sections:
        raise HTTPException(status_code=422, detail="Nessuna sezione selezionata.")

    session_id = str(uuid.uuid4())
    started_at = datetime.utcnow().isoformat()

    # genera domande mock (poi le sostituiremo con banca domande vera)
    questions: List[Dict[str, Any]] = []
    for sec in payload.sections:
        for _ in range(max(0, int(sec.scelta))):
            questions.append(_make_mock_question(sec.materia, "scelta", sec.tag))
        for _ in range(max(0, int(sec.completamento))):
            questions.append(_make_mock_question(sec.materia, "completamento", sec.tag))

    # salva sessione
    SESSIONS[session_id] = {
        "session_id": session_id,
        "started_at": started_at,
        "duration_min": int(payload.duration_min or 0),
        "order": payload.order or [],
        "questions": questions,
    }

    # ritorno pubblico
    return {
        "session_id": session_id,
        "duration_min": int(payload.duration_min or 0),
        "order": payload.order or [],
        "questions": [_public_question(q) for q in questions],
        "created_at": started_at,
    }


@router.post("/{session_id}/submit")
def submit(session_id: str, payload: SubmitPayload):
    sess = SESSIONS.get(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Sessione non trovata (riavvio server?).")

    questions = sess["questions"]
    qmap = {q["id"]: q for q in questions}

    correct = 0
    results = []

    for a in payload.answers:
        q = qmap.get(a.id)
        if not q:
            # domanda non trovata: la segniamo come errata
            results.append({
                "id": a.id,
                "ok": False,
                "materia": "—",
                "tipo": a.tipo,
                "testo": "Domanda non trovata",
                "your_answer": None,
                "correct_answer": None,
                "spiegazione": "La domanda non esiste in questa sessione.",
            })
            continue

        if q["tipo"] == "scelta":
            your = a.answer_index
            corr = q.get("_correct_index")
            ok = (your is not None) and (int(your) == int(corr))
            if ok:
                correct += 1
            results.append({
                "id": q["id"],
                "ok": ok,
                "materia": q["materia"],
                "tipo": q["tipo"],
                "testo": q["testo"],
                "your_answer": None if your is None else str(int(your)),
                "correct_answer": str(int(corr)),
                "spiegazione": q.get("_spiegazione", "—"),
            })

        else:
            your_txt = _norm(a.answer_text)
            corr_txt = _norm(q.get("_correct_text"))
            ok = (your_txt != "") and (your_txt == corr_txt)
            if ok:
                correct += 1
            results.append({
                "id": q["id"],
                "ok": ok,
                "materia": q["materia"],
                "tipo": q["tipo"],
                "testo": q["testo"],
                "your_answer": your_txt if your_txt else "—",
                "correct_answer": corr_txt if corr_txt else "—",
                "spiegazione": q.get("_spiegazione", "—"),
            })

    total = len(questions)
    percent = round((correct / total) * 100, 1) if total else 0.0

    # tempo impiegato
    started_at = datetime.fromisoformat(sess["started_at"])
    spent_sec = int((datetime.utcnow() - started_at).total_seconds())

    return {
        "score": {"correct": correct, "total": total, "percent": percent},
        "time_spent_sec": spent_sec,
        "results": results,
    }


@router.get("/ping")
def ping():
    return {"ok": True, "msg": "simulazioni alive"}