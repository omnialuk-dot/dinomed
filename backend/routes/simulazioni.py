from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime
import uuid
import random

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