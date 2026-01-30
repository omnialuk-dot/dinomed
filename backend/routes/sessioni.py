from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any
from uuid import uuid4
from datetime import datetime

router = APIRouter(prefix="/api/sim", tags=["sim"])

# =========================
# STORE SESSIONI (GLOBAL!)
# =========================
SESSIONS: Dict[str, Dict[str, Any]] = {}   # <- non deve MAI stare dentro una funzione

# =========================
# MODELLI
# =========================
QuestionType = Literal["scelta", "completamento"]

class Section(BaseModel):
    materia: str
    scelta: int = Field(0, ge=0, le=200)
    completamento: int = Field(0, ge=0, le=200)
    tag: List[str] = []
    difficolta: str = "Base"

class StartBody(BaseModel):
    duration_min: int = Field(0, ge=0, le=240)  # 0 => senza timer
    sections: List[Section]
    order: Optional[List[str]] = None

class AnswerIn(BaseModel):
    id: str
    tipo: QuestionType
    answer_index: Optional[int] = None
    answer_text: Optional[str] = None

class SubmitBody(BaseModel):
    answers: List[AnswerIn]

# =========================
# HELPERS
# =========================
def norm(s: Optional[str]) -> str:
    return (s or "").strip().lower()

def pick_questions_from_bank(sections: List[Section]) -> List[Dict[str, Any]]:
    """
    QUI devi usare la tua banca domande reale.
    Io metto una versione "placeholder": deve essere collegata al tuo routes/domande.py o al tuo JSON.
    
    ⚠️ IMPORTANTISSIMO:
    Ogni domanda deve avere:
      - id
      - materia
      - tipo ("scelta" | "completamento")
      - testo
      - opzioni (solo per scelta)
      - correct_answer (index per scelta, stringa per completamento)
      - spiegazione
      - tag (lista opzionale)
    """
    # --- ESEMPIO MINIMO (sostituisci con la tua fonte reale) ---
    # Se hai già domande altrove, importale e filtrale qui.
    out = []
    for sec in sections:
        # finta domanda scelta
        for i in range(sec.scelta):
            qid = f"{sec.materia}-S-{uuid4().hex[:10]}"
            out.append({
                "id": qid,
                "materia": sec.materia,
                "tipo": "scelta",
                "testo": f"[DEMO] Domanda a scelta {i+1} di {sec.materia}",
                "opzioni": ["A", "B", "C", "D", "E"],
                "correct_answer": 0,
                "spiegazione": "Demo: la risposta corretta è A perché è un esempio.",
                "tag": sec.tag or [],
            })

        # finta domanda completamento
        for i in range(sec.completamento):
            qid = f"{sec.materia}-C-{uuid4().hex[:10]}"
            out.append({
                "id": qid,
                "materia": sec.materia,
                "tipo": "completamento",
                "testo": f"[DEMO] Completa con una parola ({sec.materia})",
                "correct_answer": "demo",
                "spiegazione": "Demo: la parola corretta è 'demo' perché è un esempio.",
                "tag": sec.tag or [],
            })
    return out

# =========================
# ROUTES
# =========================
@router.post("/start")
async def start(body: StartBody):
    if not body.sections or len(body.sections) == 0:
        raise HTTPException(status_code=422, detail="sections obbligatorio")

    # ordine: se arriva lo rispettiamo, altrimenti naturale
    order = body.order or [s.materia for s in body.sections]

    # crea domande (collega qui la tua banca domande vera)
    questions = pick_questions_from_bank(body.sections)

    sid = uuid4().hex
    SESSIONS[sid] = {
        "session_id": sid,
        "created_at": datetime.utcnow().isoformat(),
        "duration_min": int(body.duration_min or 0),
        "order": order,
        "questions": questions,  # contiene anche correct_answer+spiegazione (server side)
    }

    # Al frontend NON mandiamo correct_answer/spiegazione (anti-cheat)
    safe_questions = []
    for q in questions:
        safe = {k: v for k, v in q.items() if k not in ("correct_answer", "spiegazione")}
        safe_questions.append(safe)

    return {
        "session_id": sid,
        "duration_min": int(body.duration_min or 0),
        "questions": safe_questions,
        "order": order,
    }

@router.post("/{session_id}/submit")
async def submit(session_id: str, body: SubmitBody):
    sess = SESSIONS.get(session_id)
    if not sess:
        # QUI è esattamente il tuo errore
        raise HTTPException(status_code=404, detail="Sessione non trovata")

    qmap = {q["id"]: q for q in sess["questions"]}

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
            ok = (isinstance(your_answer, int) and your_answer == correct_answer)
            if ok:
                correct += 1

        elif q["tipo"] == "completamento":
            your_answer = a.answer_text or ""
            ok = norm(your_answer) == norm(str(correct_answer))
            if ok:
                correct += 1

        results.append({
            "id": q["id"],
            "materia": q.get("materia", "Altro"),
            "tipo": q["tipo"],
            "testo": q.get("testo", ""),
            "ok": ok,
            "your_answer": your_answer,
            "correct_answer": correct_answer,
            "spiegazione": q.get("spiegazione", ""),
        })

    percent = int(round((correct / total) * 100)) if total else 0

    return {
        "score": {
            "correct": correct,
            "total": total,
            "percent": percent,
        },
        "results": results,
    }