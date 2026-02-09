from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any, Union
from datetime import datetime
import uuid
import random
import os
import json
from pathlib import Path

from auth import admin_required, try_get_user
from supabase_db import fetch_all_questions, insert_session

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
    order: Optional[Union[str, List[str]]] = None


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
            # salva sessione su Supabase (se user_id disponibile)
    try:
        uid = sess.get('user_id')
        if uid:
            # materia: se multi-sezione mettiamo 'Misto'
            materia = sess.get('materia') or ('Misto' if len(set([q.get('materia') for q in questions])) > 1 else (questions[0].get('materia') if questions else ''))
            insert_session(uid, materia or 'Misto', correct, len(questions))
    except Exception as e:
        print('Session save error:', e)

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

def _norm_tipo(tipo: Optional[str]) -> str:
    """Normalizza il tipo domanda.
    Valori canonici: 'scelta' | 'completamento'. Ritorna '' se non riconosciuto.
    """
    t = _norm(tipo)
    if not t:
        return ""
    # alias comuni
    if t in {"scelta", "multiple", "multipla", "scelta multipla", "mcq", "quiz"}:
        return "scelta"
    if t in {"completamento", "aperta", "open", "testo", "risposta", "libera"}:
        return "completamento"
    return t if t in {"scelta", "completamento"} else ""

def _clean_tags(tags) -> List[str]:
    """Accetta lista o stringa (anche separata da virgole) e restituisce lista pulita."""
    if not tags:
        return []
    if isinstance(tags, str):
        parts = [p.strip() for p in tags.split(",")]
        return [p for p in parts if p]
    if isinstance(tags, list):
        out = []
        for x in tags:
            if x is None:
                continue
            s = str(x).strip()
            if s:
                out.append(s)
        return out
    # fallback: prova a convertirlo a stringa
    s = str(tags).strip()
    return [s] if s else []

def _materia_match(q_materia: str, materia: str) -> bool:
    m = _norm(materia)
    if not m:
        return True
    qm = _norm(q_materia)
    return qm == m

def _infer_tipo(q: Dict[str, Any]) -> str:
    """Inferisce il tipo se il campo 'tipo' è mancante."""
    try:
        opzioni = q.get("opzioni")
        if isinstance(opzioni, list) and len(opzioni) > 0:
            return "scelta"
    except Exception:
        pass
    # completamento se ha risposte
    if q.get("risposte") or q.get("risposta"):
        return "completamento"
    return ""

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
DOMANDE_FILE = DATA_DIR / "domande.json"

SESSIONS_FILE = DATA_DIR / "sim_sessions.json"  # persisted sessions (JSON)

def _ensure_files():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not DOMANDE_FILE.exists():
        DOMANDE_FILE.write_text("[]", encoding="utf-8")
    if not SESSIONS_FILE.exists():
        SESSIONS_FILE.write_text("{}", encoding="utf-8")

def _load_domande() -> List[Dict[str, Any]]:
    """Carica la banca domande da Supabase (fonte unica)."""
    try:
        return fetch_all_questions()
    except Exception:
        return []

def _load_sessions() -> Dict[str, Any]:
    _ensure_files()
    try:
        data = json.loads(SESSIONS_FILE.read_text(encoding="utf-8") or "{}")
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}

def _save_sessions(db: Dict[str, Any]) -> None:
    _ensure_files()
    SESSIONS_FILE.write_text(json.dumps(db, ensure_ascii=False, indent=2), encoding="utf-8")

def _public_question(q: Dict[str, Any]) -> Dict[str, Any]:
    # public payload (no solutions)
    out = dict(q)
    out.pop("corretta", None)
    out.pop("corretta_index", None)
    out.pop("risposte", None)
    return out

def _match_tags(q: Dict[str, Any], tags: List[str]) -> bool:
    if not tags:
        return True
    qtags = q.get("tag") or []
    if not isinstance(qtags, list):
        return False
    qtags_norm = {_norm(x) for x in qtags}
    return any(_norm(t) in qtags_norm for t in tags)

def _pick_questions(bank, materia: str, tipo: str, tags, difficolta, n: int):
    req_tipo = _norm_tipo(tipo)
    tags_norm = _clean_tags(tags)
    dif_norm = _norm(difficolta) if difficolta else ""

    filtered = []
    for q in bank:
        if not _materia_match(q.get("materia", ""), materia):
            continue

        qtipo = _norm_tipo(q.get("tipo")) or _infer_tipo(q)
        if req_tipo and qtipo != req_tipo:
            continue

        if tags_norm and not _match_tags(q, tags_norm):
            continue

        if dif_norm:
            qdif = _norm(q.get("difficolta"))
            if qdif and qdif != dif_norm:
                continue

        filtered.append(q)

    if n <= 0:
        return []
    random.shuffle(filtered)
    return filtered[:n]
    if len(filtered) <= n:
        # not enough: return all we have (shuffle)
        random.shuffle(filtered)
        return filtered
    return random.sample(filtered, n)

def _session_store_put(session_id: str, payload: Dict[str, Any]) -> None:
    db = _load_sessions()
    db[session_id] = payload
    # keep DB bounded (optional): drop very old sessions
    # Here: keep max 500 sessions
    if len(db) > 500:
        # remove oldest by started_at timestamp if present
        items = list(db.items())
        items.sort(key=lambda kv: kv[1].get("started_at", ""))
        db = dict(items[-500:])
    _save_sessions(db)

def _session_store_get(session_id: str) -> Optional[Dict[str, Any]]:
    db = _load_sessions()
    v = db.get(session_id)
    return v if isinstance(v, dict) else None
# =========================
# Routes
# =========================

@router.get("/session/{session_id}")
def get_session(session_id: str):
    """Return a previously created simulation session (public view).

    The frontend may refresh the page after /start and needs to re-fetch the session.
    """
    sess = _session_store_get(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Sessione non trovata.")
    questions = sess.get("questions") or []
    if not isinstance(questions, list):
        questions = []
    return {
        "session_id": session_id,
        "started_at": sess.get("started_at"),
        "duration_min": int(sess.get("duration_min") or 0),
        "order": sess.get("order") or [],
        "questions": [_public_question(q) for q in questions],
    }


@router.get("/{sim_or_session_id}")
def get_simulazione_or_session(sim_or_session_id: str, request: Request):
    """Compatibility endpoint.

    - If the id matches an active/persisted session, return the session.
    - Otherwise, return the simulazione definition by id (public if published, admin if not).
    """
    sess = _session_store_get(sim_or_session_id)
    if sess:
        questions = sess.get("questions") or []
        if not isinstance(questions, list):
            questions = []
        return {
            "session_id": sim_or_session_id,
            "started_at": sess.get("started_at"),
            "duration_min": int(sess.get("duration_min") or 0),
            "order": sess.get("order") or [],
            "questions": [_public_question(q) for q in questions],
        }

    items = _read_all()
    item = next((x for x in items if x.get("id") == sim_or_session_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Simulazione non trovata")

    if item.get("pubblicata") is True:
        return item

    admin_required(request)
    return item


@router.post("/start")
def start(payload: StartPayload, request: Request):
    if not payload.sections:
        raise HTTPException(status_code=422, detail="Nessuna sezione selezionata.")

    order = payload.order
    if isinstance(order, str):
        order = [order]

    bank = fetch_all_questions()
    if not bank:
        raise HTTPException(status_code=500, detail="Supabase ha restituito 0 domande. Controlla RLS/policies o SUPABASE_KEY su Render.")
    if not bank:
        raise HTTPException(status_code=500, detail="Nessuna domanda trovata su Supabase (tabella questions vuota o env mancanti).")

    session_id = str(uuid.uuid4())
    started_at = datetime.utcnow().isoformat()

    # Build questions from the real bank
    picked: List[Dict[str, Any]] = []
    for sec in payload.sections:
        picked += _pick_questions(bank, sec.materia, "scelta", sec.tag, sec.difficolta, int(sec.scelta or 0))
        picked += _pick_questions(bank, sec.materia, "completamento", sec.tag, sec.difficolta, int(sec.completamento or 0))

    # shuffle within selected set
    random.shuffle(picked)

    # Store full questions (with solutions) in persisted sessions, but return public version
    _session_store_put(session_id, {
        "session_id": session_id,
        "started_at": started_at,
        "duration_min": int(payload.duration_min or 0),
        "order": payload.order or [],
        "questions": picked,
    })

    return {
        "session_id": session_id,
        "duration_min": int(payload.duration_min or 0),
        "order": payload.order or [],
        "questions": [_public_question(q) for q in picked],
        "created_at": started_at,
    }


@router.post("/{session_id}/submit")
def submit(session_id: str, payload: SubmitPayload):
    sess = _session_store_get(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Sessione non trovata (server riavviato o sessione scaduta).")

    questions = sess.get("questions") or []
    if not isinstance(questions, list):
        questions = []

    qmap = {q.get("id"): q for q in questions if isinstance(q, dict) and q.get("id")}
    correct = 0
    results = []

    for a in payload.answers:
        q = qmap.get(a.id)
        if not q:
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

        tipo = q.get("tipo")
        materia = q.get("materia") or "—"
        testo = q.get("testo") or ""

        if tipo == "scelta":
            your_idx = a.answer_index
            corr_idx = q.get("corretta_index")
            if corr_idx is None and q.get("corretta") is not None:
                try:
                    corr_idx = ord(str(q.get("corretta")).strip().upper()) - 65
                except Exception:
                    corr_idx = None
            ok = (your_idx is not None and corr_idx is not None and int(your_idx) == int(corr_idx))
            if ok:
                correct += 1
            opts = q.get("opzioni") or []
            corr_letter = chr(65 + int(corr_idx)) if corr_idx is not None and 0 <= int(corr_idx) <= 4 else None
            results.append({
                "id": q.get("id"),
                "ok": ok,
                "materia": materia,
                "tipo": "scelta",
                "testo": testo,
                "your_answer": (chr(65 + int(your_idx)) if your_idx is not None else None),
                "correct_answer": corr_letter,
                "spiegazione": q.get("spiegazione") or "",
            })

        else:
            your_text = (a.answer_text or "").strip()
            corr_list = q.get("risposte") or []
            if not isinstance(corr_list, list):
                corr_list = []
            corr_norm = { _norm(str(x)) for x in corr_list if str(x).strip() }
            ok = _norm(your_text) in corr_norm if your_text else False
            if ok:
                correct += 1
            results.append({
                "id": q.get("id"),
                "ok": ok,
                "materia": materia,
                "tipo": "completamento",
                "testo": testo,
                "your_answer": your_text or None,
                "correct_answer": (corr_list[0] if corr_list else None),
                "spiegazione": q.get("spiegazione") or "",
            })

    return {
        "session_id": session_id,
        "total": len(payload.answers),
        "correct": correct,
        "score": round((correct / max(1, len(payload.answers))) * 100, 1),
        "results": results,
    }