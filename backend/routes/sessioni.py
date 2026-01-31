from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any
from uuid import uuid4
from datetime import datetime
from pathlib import Path
import json
import random

from auth import try_get_user

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

USER_RUNS_FILE = DATA_DIR / "user_runs.json"

def _runs_read():
    try:
        raw = USER_RUNS_FILE.read_text(encoding="utf-8")
        data = json.loads(raw or "[]")
        return data if isinstance(data, list) else []
    except FileNotFoundError:
        return []
    except Exception:
        return []

def _runs_write(items):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    USER_RUNS_FILE.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")

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

    # REQUISITO: ordine per materia fisso (req.order), domande casuali all'interno della materia.
    picked_full: List[Dict[str, Any]] = []
    diagnostics: List[str] = []

    for materia in order:
        sec = next((s for s in req.sections if s.materia == materia), None)
        if not sec:
            continue

        picked_this: List[Dict[str, Any]] = []

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
            picked_this.extend(sc)

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
            picked_this.extend(co)

        if (need_sc + need_co) <= 0:
            raise HTTPException(status_code=400, detail=f"In {materia} metti almeno 1 domanda (crocette o completamento).")

        # shuffle SOLO dentro la materia
        random.shuffle(picked_this)
        picked_full.extend(picked_this)

    session_id = str(uuid4())
    session = {
        "id": session_id,
        "created_at": datetime.utcnow().isoformat(),
        "duration_min": int(req.duration_min or 0),
        "order": order,
        "questions_full": picked_full,  # con soluzioni (per correzione)
        "questions": [_public_question(q) for q in picked_full],  # senza soluzioni
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


# Alias più esplicito (compatibilità frontend)
@router.get("/session/{session_id}")
def get_session_alias(session_id: str):
    return get_session(session_id)

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

# =========================
# Compat finish endpoint (per SimulazioniRun.jsx)
# =========================
class FinishAnswer(BaseModel):
    id: str
    materia: Optional[str] = None
    type: Optional[str] = None
    answer: Any = ""


class FinishRequest(BaseModel):
    session_id: str
    answers: List[FinishAnswer]
    auto_finish: Optional[bool] = False
    # opzionale: limita la correzione solo a un sottoinsieme di domande (es. uscita anticipata tra materie)
    question_ids: Optional[List[str]] = None


def _letter_to_index(v: Any) -> Optional[int]:
    if v is None:
        return None
    if isinstance(v, int):
        return v
    s = str(v).strip()
    if not s:
        return None
    # 'A'..'E'
    if len(s) == 1 and s.upper() in ("A", "B", "C", "D", "E"):
        return ord(s.upper()) - 65
    # numerico
    try:
        return int(s)
    except Exception:
        return None


@router.post("/finish")
@router.post("/finish/")
@router.post("/end")
@router.post("/end/")
def finish(req: FinishRequest, request: Request):
    # accetta sia session_id nel body sia nell'url (frontend invia nel body)
    session_id = req.session_id
    s = SESSIONS.get(session_id)
    if not s:
        raise HTTPException(status_code=404, detail="Sessione non trovata")

    # converte answers array -> dict stabile {qid: answer}
    amap: Dict[str, Any] = {}
    for a in req.answers or []:
        amap[str(a.id)] = a.answer

    # riusa la logica submit ma con parsing più elastico
    s["answers"] = amap
    s["finished"] = True

    questions_full = s.get("questions_full", [])

    # se arrivano question_ids, correggi solo quelle (ordine preservato)
    qid_filter = None
    if req.question_ids:
        qid_filter = {str(x) for x in req.question_ids if str(x).strip()}
    if qid_filter is not None:
        questions_full = [q for q in questions_full if str(q.get("id")) in qid_filter]

    total = len(questions_full)
    correct = 0
    wrong = 0
    blank = 0
    details = []
    per_subject: Dict[str, Dict[str, Any]] = {}

    for q in questions_full:
        qid = str(q.get("id"))
        tipo = _norm(q.get("tipo"))
        materia = str(q.get("materia") or "Materia")
        if materia not in per_subject:
            per_subject[materia] = {"total": 0, "correct": 0, "wrong": 0, "blank": 0}
        per_subject[materia]["total"] += 1
        user = amap.get(qid, None)

        if user is None or (isinstance(user, str) and user.strip() == ""):
            blank += 1
            per_subject[materia]["blank"] += 1
            details.append({
                "id": qid,
                "materia": materia,
                "tipo": tipo,
                "ok": None,
                "your_answer": "",
                "correct": q.get("corretta") if tipo == "completamento" else q.get("corretta_index"),
                "testo": q.get("testo", ""),
                "opzioni": q.get("opzioni", []) if tipo == "scelta" else [],
                "spiegazione": q.get("spiegazione", ""),
            })
            continue

        ok = False
        if tipo == "scelta":
            ui = _letter_to_index(user)
            ok = ui is not None and ui == int(q.get("corretta_index", -1))
        elif tipo == "completamento":
            # accetta 1 o più risposte corrette (risposte)
            corr_list = q.get("risposte") if isinstance(q.get("risposte"), list) else None
            if corr_list:
                corr_set = {_norm(str(x)) for x in corr_list}
                ok = _norm(str(user)) in corr_set
            else:
                ans = _norm(str(q.get("corretta") or ""))
                ok = _norm(str(user)) == ans

        correct_payload = None
        if tipo == "scelta":
            # salva l'indice corretto + anche la lettera per comodità
            ci = q.get("corretta_index")
            try:
                ci_int = int(ci)
            except Exception:
                ci_int = None
            correct_payload = {
                "index": ci_int,
                "letter": (chr(65 + ci_int) if isinstance(ci_int, int) and 0 <= ci_int <= 25 else None),
            }
        else:
            corr_list = q.get("risposte") if isinstance(q.get("risposte"), list) else None
            correct_payload = corr_list if corr_list else (q.get("corretta") or "")

        d = {
            "id": qid,
            "materia": materia,
            "tipo": tipo,
            "ok": bool(ok),
            "your_answer": user,
            "correct": correct_payload,
            "testo": q.get("testo", ""),
            "opzioni": q.get("opzioni", []) if tipo == "scelta" else [],
            "spiegazione": q.get("spiegazione", ""),
            "tag": q.get("tag", []),
        }

        if ok:
            correct += 1
            per_subject[materia]["correct"] += 1
        else:
            wrong += 1
            per_subject[materia]["wrong"] += 1
        details.append(d)

    score = correct * 1.0 + wrong * (-0.1) + blank * 0.0
    percent = round((correct / total) * 100, 1) if total else 0.0

    # calcolo voto per materia in /30 (scala lineare sul numero domande della materia)
    per_subject_out: Dict[str, Any] = {}
    total_vote = 0.0
    max_vote = 0.0
    for mat, st in per_subject.items():
        mat_total = int(st.get("total", 0) or 0)
        mat_correct = int(st.get("correct", 0) or 0)
        mat_wrong = int(st.get("wrong", 0) or 0)
        mat_blank = int(st.get("blank", 0) or 0)
        mat_score = mat_correct * 1.0 + mat_wrong * (-0.1)
        vote30 = round((mat_score * 30.0 / mat_total), 2) if mat_total else 0.0
        per_subject_out[mat] = {
            **st,
            "score": round(mat_score, 3),
            "vote30": vote30,
        }
        total_vote += vote30
        max_vote += 30.0

    return {
        "session_id": session_id,
        "total": total,
        "correct": correct,
        "wrong": wrong,
        "blank": blank,
        "score": round(score, 3),
        "percent": percent,
        "per_subject": per_subject_out,
        "total_vote": round(total_vote, 2),
        "max_vote": round(max_vote, 0),
        "details": details,
        "scoring": {"correct": 1, "wrong": -0.1, "blank": 0},
    }
