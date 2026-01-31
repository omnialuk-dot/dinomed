from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any
from uuid import uuid4
from datetime import datetime
from pathlib import Path
import json
import random

router = APIRouter(prefix="/api/sim", tags=["sim"])

# =========================
# STORE SESSIONI (GLOBAL!)
# =========================
SESSIONS: Dict[str, Dict[str, Any]] = {}

# =========================
# QUESTION BANK (JSON)
# =========================
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
BANK_FILE = DATA_DIR / "domande.json"

def _load_bank() -> List[Dict[str, Any]]:
    try:
        raw = BANK_FILE.read_text(encoding="utf-8")
        data = json.loads(raw)
        if isinstance(data, list):
            return data
        return []
    except FileNotFoundError:
        return []
    except Exception:
        return []

def _norm(s: str) -> str:
    return (s or "").strip().lower()

def _q_tags(q: Dict[str, Any]) -> List[str]:
    # supporta sia "tags" che "tag" (alcuni file vecchi)
    tags = q.get("tags")
    if isinstance(tags, list):
        return [str(x) for x in tags if str(x).strip()]
    tag = q.get("tag")
    if isinstance(tag, list):
        return [str(x) for x in tag if str(x).strip()]
    if isinstance(tag, str) and tag.strip():
        return [tag.strip()]
    return []

def _matches_tags(q: Dict[str, Any], requested: List[str]) -> bool:
    if not requested:
        return True
    qt = {_norm(x) for x in _q_tags(q)}
    rq = {_norm(x) for x in requested if str(x).strip()}
    if not rq:
        return True
    return len(qt.intersection(rq)) > 0

def pick_questions_from_bank(materia: str,
                            tipo: Literal["scelta", "completamento"],
                            n: int,
                            tags: Optional[List[str]] = None) -> List[Dict[str, Any]]:
    bank = _load_bank()
    if not bank:
        return []

    filtered = []
    for q in bank:
        if _norm(q.get("materia")) != _norm(materia):
            continue
        if _norm(q.get("tipo")) != _norm(tipo):
            continue
        if not _matches_tags(q, tags or []):
            continue
        filtered.append(q)

    # non duplicare, ma randomizza
    random.shuffle(filtered)
    return filtered[:max(0, n)]

# =========================
# API MODELS
# =========================
class Section(BaseModel):
    materia: Literal["Chimica", "Fisica", "Biologia"]
    scelta: int = Field(ge=0, le=200, default=15)
    completamento: int = Field(ge=0, le=200, default=16)
    tag: Optional[List[str]] = Field(default_factory=list)  # topics selezionati (se vuoto => tutti)
    difficolta: Optional[str] = "Base"

class StartRequest(BaseModel):
    duration_min: int = Field(ge=0, le=240, default=45)  # 0 => timer off
    sections: List[Section]
    order: Optional[List[Literal["Chimica", "Fisica", "Biologia"]]] = None

def _public_question(q: Dict[str, Any]) -> Dict[str, Any]:
    # tutto ciò che serve al frontend, SENZA soluzioni
    base = {
        "id": q.get("id"),
        "materia": q.get("materia"),
        "tipo": q.get("tipo"),
        "testo": q.get("testo"),
        "tags": _q_tags(q),
    }
    if _norm(q.get("tipo")) == "scelta":
        base["opzioni"] = q.get("opzioni") or []
    return base

@router.post("/start")
def start(req: StartRequest):
    if not req.sections:
        raise HTTPException(status_code=400, detail="Seleziona almeno 1 materia.")

    # ordine: se non fornito, usa l'ordine delle sections
    order = req.order or [s.materia for s in req.sections]

    # costruisci pool per sezione
    picked_full: List[Dict[str, Any]] = []
    diagnostics = []

    for materia in order:
        sec = next((s for s in req.sections if s.materia == materia), None)
        if not sec:
            continue

        # scelta multipla
        need_sc = int(sec.scelta or 0)
        if need_sc > 0:
            sc = pick_questions_from_bank(materia, "scelta", need_sc, sec.tag or [])
            if len(sc) < need_sc:
                avail = len(pick_questions_from_bank(materia, "scelta", 10_000, sec.tag or []))
                diagnostics.append(f"{materia} • crocette: richieste {need_sc}, disponibili {avail}")
                raise HTTPException(
                    status_code=400,
                    detail="Domande insufficienti: " + "; ".join(diagnostics) +
                           (f". Tag: {', '.join(sec.tag)}" if sec.tag else "")
                )
            picked_full.extend(sc)

        # completamento
        need_co = int(sec.completamento or 0)
        if need_co > 0:
            co = pick_questions_from_bank(materia, "completamento", need_co, sec.tag or [])
            if len(co) < need_co:
                avail = len(pick_questions_from_bank(materia, "completamento", 10_000, sec.tag or []))
                diagnostics.append(f"{materia} • completamento: richieste {need_co}, disponibili {avail}")
                raise HTTPException(
                    status_code=400,
                    detail="Domande insufficienti: " + "; ".join(diagnostics) +
                           (f". Tag: {', '.join(sec.tag)}" if sec.tag else "")
                )
            picked_full.extend(co)

        if (need_sc + need_co) <= 0:
            raise HTTPException(status_code=400, detail=f"In {materia} metti almeno 1 domanda (crocette o completamento).")

    # shuffle mantenendo comunque un minimo di mix (qui semplice random)
    random.shuffle(picked_full)

    session_id = str(uuid4())
    session = {
        "id": session_id,
        "created_at": datetime.utcnow().isoformat(),
        "duration_min": int(req.duration_min or 0),
        "order": order,
        # salva FULL (con soluzioni) per correzione
        "questions_full": picked_full,
        # pubblico
        "questions": [_public_question(q) for q in picked_full],
        "answers": {},
        "finished": False,
    }
    SESSIONS[session_id] = session

    return {
        "session_id": session_id,
        "duration_min": session["duration_min"],
        "questions": session["questions"],
        "order": order,
    }

@router.get("/{session_id}")
def get_session(session_id: str):
    s = SESSIONS.get(session_id)
    if not s:
        raise HTTPException(status_code=404, detail="Sessione non trovata")
    return {
        "session_id": session_id,
        "duration_min": s.get("duration_min", 0),
        "questions": s.get("questions", []),
        "order": s.get("order", []),
    }

class SubmitRequest(BaseModel):
    answers: Dict[str, Any] = Field(default_factory=dict)  # {questionId: userAnswer}

@router.post("/{session_id}/submit")
def submit(session_id: str, req: SubmitRequest):
    s = SESSIONS.get(session_id)
    if not s:
        raise HTTPException(status_code=404, detail="Sessione non trovata")

    s["answers"] = req.answers or {}
    s["finished"] = True

    questions_full = s.get("questions_full", [])
    total = len(questions_full)
    correct = 0
    wrong = 0
    blank = 0

    details = []

    for q in questions_full:
        qid = str(q.get("id"))
        tipo = _norm(q.get("tipo"))
        user = (req.answers or {}).get(qid, None)

        if user is None or (isinstance(user, str) and user.strip() == ""):
            blank += 1
            details.append({"id": qid, "ok": None})
            continue

        ok = False
        if tipo == "scelta":
            # accetta numero index oppure stringa numerica
            try:
                ui = int(user)
            except Exception:
                ui = None
            ok = ui is not None and ui == int(q.get("corretta_index", -1))
        elif tipo == "completamento":
            ans = str(q.get("corretta") or "").strip().lower()
            ok = str(user).strip().lower() == ans

        if ok:
            correct += 1
            details.append({"id": qid, "ok": True})
        else:
            wrong += 1
            details.append({"id": qid, "ok": False})

    score = correct * 1.0 + wrong * (-0.1) + blank * 0.0
    if total > 0:
        percent = round((correct / total) * 100, 1)
    else:
        percent = 0.0

    return {
        "session_id": session_id,
        "total": total,
        "correct": correct,
        "wrong": wrong,
        "blank": blank,
        "score": round(score, 2),
        "percent": percent,
        "details": details,
    }
