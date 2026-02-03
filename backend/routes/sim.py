from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime
import uuid
import random
import json
from pathlib import Path

router = APIRouter(prefix="/api/sim", tags=["sim"])

Materia = Literal["Chimica", "Fisica", "Biologia"]
TipoQ = Literal["scelta", "completamento"]

class StartSection(BaseModel):
    materia: Materia
    scelta: int = Field(0, ge=0, le=200)
    completamento: int = Field(0, ge=0, le=200)
    tag: List[str] = []
    difficolta: str = "Base"

class StartBody(BaseModel):
    duration_min: int = Field(0, ge=0, le=240)  # 0 = senza timer
    sections: List[StartSection]
    order: Optional[List[Materia]] = None

class SubmitAnswer(BaseModel):
    id: str
    tipo: TipoQ
    answer_index: Optional[int] = None
    answer_text: Optional[str] = None

class SubmitBody(BaseModel):
    answers: List[SubmitAnswer]

# =========================
# Question bank (shared with Admin Domande)
# =========================
BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
DOMANDE_FILE = DATA_DIR / "domande.json"

SESSIONS: Dict[str, Dict[str, Any]] = {}

def _ensure_domande():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not DOMANDE_FILE.exists():
        DOMANDE_FILE.write_text("[]", encoding="utf-8")

def _read_domande() -> List[Dict[str, Any]]:
    _ensure_domande()
    try:
        data = json.loads(DOMANDE_FILE.read_text(encoding="utf-8") or "[]")
        return data if isinstance(data, list) else []
    except Exception:
        return []

def _norm_subject(x: str) -> str:
    s = (x or "").strip().lower()
    if s.startswith("chim"):
        return "Chimica"
    if s.startswith("fis"):
        return "Fisica"
    if s.startswith("bio"):
        return "Biologia"
    return (x or "").strip() or "Chimica"

def _norm_type(q: Dict[str, Any]) -> str:
    t = (q.get("tipo") or q.get("type") or "").strip().lower()
    return "completamento" if t.startswith("comp") else "scelta"

def _matches_tags(q: Dict[str, Any], tags: List[str]) -> bool:
    if not tags:
        return True
    qt = q.get("tag") or q.get("tags") or []
    if not isinstance(qt, list):
        qt = [qt]
    qt = [str(x).strip().lower() for x in qt if str(x).strip()]
    want = set([str(x).strip().lower() for x in tags if str(x).strip()])
    return any(t in want for t in qt)

def _pick_questions(materia: str, tipo: str, count: int, tags: List[str]) -> List[Dict[str, Any]]:
    bank = _read_domande()
    subj = _norm_subject(materia)
    t = "completamento" if tipo == "completamento" else "scelta"
    pool = [
        q for q in bank
        if _norm_subject(q.get("materia") or "") == subj and _norm_type(q) == t and _matches_tags(q, tags)
    ]
    random.shuffle(pool)
    # return shallow copies normalized for the frontend
    out = []
    for q in pool[:count]:
        qq = dict(q)
        # normalize fields
        qq["materia"] = subj
        qq["tipo"] = t
        if t == "scelta":
            # frontend supports 'corretta' or 'corretta_index'
            if "corretta" not in qq:
                qq["corretta"] = qq.get("corretta_index", qq.get("correct_answer"))
        else:
            if "risposte" not in qq:
                # accept legacy correct_answer string
                ca = qq.get("correct_answer")
                if isinstance(ca, str) and ca.strip():
                    qq["risposte"] = [ca.strip()]
        out.append(qq)
    return out

@router.post("/start")
async def start(body: StartBody):
    if not body.sections:
        raise HTTPException(status_code=400, detail="Sezioni mancanti")

    # order of subjects
    order = body.order or [sec.materia for sec in body.sections]
    order = [_norm_subject(x) for x in order if str(x).strip()]
    if not order:
        order = ["Chimica", "Fisica", "Biologia"]

    questions: List[Dict[str, Any]] = []
    for subj in order:
        for sec in body.sections:
            if _norm_subject(sec.materia) != subj:
                continue
            if sec.scelta:
                questions.extend(_pick_questions(subj, "scelta", int(sec.scelta), sec.tag))
            if sec.completamento:
                questions.extend(_pick_questions(subj, "completamento", int(sec.completamento), sec.tag))

    if not questions:
        raise HTTPException(status_code=404, detail="Nessuna domanda trovata (filtri troppo stretti?)")

    session_id = str(uuid.uuid4())
    SESSIONS[session_id] = {
        "created_at": datetime.utcnow().isoformat(),
        "duration_min": body.duration_min,
        "questions": questions,
    }

    return {"sessionId": session_id, "questions": questions, "duration_min": body.duration_min}

@router.get("/session/{session_id}")
async def get_session(session_id: str):
    s = SESSIONS.get(session_id)
    if not s:
        raise HTTPException(status_code=404, detail="Sessione non trovata")
    return s

@router.post("/{session_id}/submit")
async def submit(session_id: str, payload: SubmitBody):
    s = SESSIONS.get(session_id)
    if not s:
        raise HTTPException(status_code=404, detail="Sessione non trovata")

    questions = s.get("questions") or []
    qmap = {str(q.get("id")): q for q in questions if isinstance(q, dict) and q.get("id")}

    correct = 0
    total = 0
    details = []

    for a in payload.answers:
        q = qmap.get(str(a.id))
        if not q:
            continue
        total += 1
        tipo = _norm_type(q)
        ok = False
        if tipo == "scelta":
            corr = q.get("corretta")
            if corr is None:
                corr = q.get("corretta_index", q.get("correct_answer"))
            try:
                ok = (a.answer_index is not None) and (int(a.answer_index) == int(corr))
            except Exception:
                ok = False
        else:
            risp = q.get("risposte") or q.get("correct_answer")
            if isinstance(risp, list):
                good = set([str(x).strip().lower() for x in risp if str(x).strip()])
                ok = (a.answer_text or "").strip().lower() in good if good else False
            elif isinstance(risp, str):
                ok = (a.answer_text or "").strip().lower() == risp.strip().lower()

        if ok:
            correct += 1
        details.append({"id": a.id, "ok": ok})

    return {"correct": correct, "total": total, "details": details}
