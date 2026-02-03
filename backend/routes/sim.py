from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime
import uuid
import random

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

# ---- banca domande temporanea (poi la colleghi al tuo domande.py) ----
QUESTION_BANK: List[Dict[str, Any]] = [
    {
        "id": "q1",
        "materia": "Chimica",
        "tipo": "scelta",
        "tag": ["Acidi-basi"],
        "testo": "Qual è l’acido più forte tra questi?",
        "opzioni": ["HF", "HCl", "H2O", "NH3", "CH3COOH"],
        "correct_answer": 1,
        "spiegazione": "HCl è un acido forte (dissociazione quasi completa)."
    },
    {
        "id": "q2",
        "materia": "Fisica",
        "tipo": "completamento",
        "tag": ["Dinamica"],
        "testo": "La seconda legge di Newton è F = m · ____",
        "correct_answer": "a",
        "spiegazione": "La forza risultante è massa per accelerazione."
    },
]

SESSIONS: Dict[str, Dict[str, Any]] = {}

def _pick_questions(materia: str, tipo: str, count: int, tags: List[str]) -> List[Dict[str, Any]]:
    pool = [q for q in QUESTION_BANK if q.get("materia") == materia and q.get("tipo") == tipo]
    if tags:
        tags_norm = set([t.strip().lower() for t in tags if t.strip()])
        pool = [
            q for q in pool
            if any(str(t).strip().lower() in tags_norm for t in (q.get("tag") or []))
        ]
    random.shuffle(pool)
    return pool[:count]

@router.post("/start")
async def start(body: StartBody):
    if not body.sections:
        raise HTTPException(status_code=422, detail="sections vuoto")

    default_order = ["Chimica", "Fisica", "Biologia"]
    order = body.order if body.order else default_order

    questions: List[Dict[str, Any]] = []
    for materia in order:
        for sec in body.sections:
            if sec.materia != materia:
                continue
            if sec.scelta > 0:
                questions += _pick_questions(sec.materia, "scelta", sec.scelta, sec.tag)
            if sec.completamento > 0:
                questions += _pick_questions(sec.materia, "completamento", sec.completamento, sec.tag)

    if not questions:
        raise HTTPException(status_code=404, detail="Nessuna domanda trovata con questi filtri")

    session_id = str(uuid.uuid4())
    SESSIONS[session_id] = {
        "created_at": datetime.utcnow().isoformat(),
        "duration_min": body.duration_min,
        "questions": questions,
    }

    # invia al frontend senza soluzioni
    safe_questions = []
    for q in questions:
        safe = {
            "id": q["id"],
            "materia": q["materia"],
            "tipo": q["tipo"],
            "tag": q.get("tag", []),
            "testo": q["testo"],
        }
        if q["tipo"] == "scelta":
            safe["opzioni"] = q.get("opzioni", [])
        safe_questions.append(safe)

    return {"session_id": session_id, "duration_min": body.duration_min, "questions": safe_questions}

@router.post("/{session_id}/submit")
async def submit(session_id: str, body: SubmitBody):
    sess = SESSIONS.get(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Sessione non trovata")

    questions = sess["questions"]
    qmap = {q["id"]: q for q in questions}

    results = []
    correct = 0
    total = 0

    for a in body.answers:
        q = qmap.get(a.id)
        if not q:
            continue
        total += 1

        ok = False
        your_answer = None
        correct_answer = q.get("correct_answer")

        if q["tipo"] == "scelta":
            your_answer = a.answer_index
            ok = (your_answer is not None and your_answer == correct_answer)
        else:
            your_answer = (a.answer_text or "").strip()
            ok = (your_answer.lower() == str(correct_answer).strip().lower())

        if ok:
            correct += 1

        results.append({
            "id": q["id"],
            "materia": q["materia"],
            "tipo": q["tipo"],
            "tag": q.get("tag", []),
            "testo": q["testo"],
            "ok": ok,
            "your_answer": your_answer,
            "correct_answer": correct_answer,
            "spiegazione": q.get("spiegazione", ""),
        })

    percent = round((correct / total) * 100, 1) if total else 0.0
    return {"score": {"correct": correct, "total": total, "percent": percent}, "results": results}