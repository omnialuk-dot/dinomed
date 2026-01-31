from __future__ import annotations

import json
import random
import time
import unicodedata
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/sim", tags=["simulazioni"])


# ----------------- storage (file) -----------------
DATA_DIR = Path(__file__).resolve().parents[1] / "data"
SESSIONS_PATH = DATA_DIR / "sessions.json"
DOMANDE_PATH = DATA_DIR / "domande.json"


def _ensure_files():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not SESSIONS_PATH.exists():
        SESSIONS_PATH.write_text("{}", encoding="utf-8")
    if not DOMANDE_PATH.exists():
        DOMANDE_PATH.write_text("[]", encoding="utf-8")


def _read_sessions() -> dict:
    _ensure_files()
    try:
        return json.loads(SESSIONS_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {}


def _write_sessions(obj: dict):
    _ensure_files()
    SESSIONS_PATH.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")


def _load_domande() -> list[dict]:
    _ensure_files()
    try:
        data = json.loads(DOMANDE_PATH.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except Exception:
        return []


# ----------------- helpers -----------------
def _norm_tag(s: str) -> str:
    """Normalizza tag/argomenti per matching robusto (spazi, accenti, punteggiatura)."""
    if not s:
        return ""
    s = unicodedata.normalize("NFKD", s)
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def _norm_answer(s: str) -> str:
    s = (s or "").strip().lower()
    s = unicodedata.normalize("NFKD", s)
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    s = re.sub(r"\s+", " ", s).strip()
    return s


def _choice_letter(val: Any) -> str:
    if val is None:
        return ""
    v = str(val).strip().upper()
    if len(v) == 1 and v in "ABCDE":
        return v
    # accetta anche 0-4
    if v.isdigit():
        i = int(v)
        if 0 <= i <= 4:
            return "ABCDE"[i]
    return v


def _sample(pool: list[dict], n: int) -> list[dict]:
    if n <= 0:
        return []
    if len(pool) < n:
        raise HTTPException(status_code=400, detail=f"Domande insufficienti: richieste {n}, disponibili {len(pool)}")
    return random.sample(pool, n)


def _filter_pool(bank: list[dict], materia: str, tipo: str, tags: list[str]) -> list[dict]:
    pool = [q for q in bank if q.get("materia") == materia and q.get("tipo") == tipo]
    if tags:
        wanted = {_norm_tag(t) for t in tags if _norm_tag(t)}
        if wanted:
            out = []
            for q in pool:
                qtags = q.get("tag") or []
                qset = {_norm_tag(t) for t in qtags if _norm_tag(t)}
                if qset & wanted:
                    out.append(q)
            pool = out
    return pool


def _public_question(q: dict) -> dict:
    """Rimuove soluzioni prima di inviare al client."""
    out = {
        "id": q.get("id"),
        "materia": q.get("materia"),
        "tipo": q.get("tipo"),
        "testo": q.get("testo"),
        "tag": q.get("tag") or [],
        "spiegazione": q.get("spiegazione"),  # opzionale: puoi anche toglierla se non vuoi spoiler
    }
    if q.get("tipo") == "scelta":
        out["opzioni"] = q.get("opzioni") or []
    return out


# ----------------- schemas -----------------
class SectionCfg(BaseModel):
    materia: str
    scelta: int = 15
    completamento: int = 16
    tag: List[str] = []
    difficolta: Optional[str] = None


class StartCfg(BaseModel):
    duration_min: int = 45  # 0 = no timer
    sections: List[SectionCfg]
    order: List[str] = []


class SubmitBody(BaseModel):
    session_id: str
    answers: Dict[str, Any]  # qid -> answer


# ----------------- core -----------------
def pick_questions_from_bank(sections: list[SectionCfg], order: list[str]) -> list[dict]:
    bank = _load_domande()

    # indicizza per id per evitare duplicati tra sezioni
    used_ids = set()
    picked: list[dict] = []

    # usa order se fornito, altrimenti nell'ordine delle sections
    ordered_sections = sections
    if order:
        by_m = {s.materia: s for s in sections}
        ordered_sections = [by_m[m] for m in order if m in by_m]

    for sec in ordered_sections:
        materia = sec.materia
        tags = sec.tag or []

        # scelta multipla
        if sec.scelta and sec.scelta > 0:
            pool = _filter_pool(bank, materia, "scelta", tags)
            pool = [q for q in pool if q.get("id") not in used_ids]
            chosen = _sample(pool, sec.scelta)
            for q in chosen:
                used_ids.add(q.get("id"))
            picked.extend(chosen)

        # completamento
        if sec.completamento and sec.completamento > 0:
            pool = _filter_pool(bank, materia, "completamento", tags)
            pool = [q for q in pool if q.get("id") not in used_ids]
            chosen = _sample(pool, sec.completamento)
            for q in chosen:
                used_ids.add(q.get("id"))
            picked.extend(chosen)

        # se modalità "scelgo io" (tags non vuoti) ma non hai abbastanza domande, l'errore arriva da _sample

    return picked


# ----------------- routes -----------------
@router.post("/start")
def start(cfg: StartCfg):
    if not cfg.sections:
        raise HTTPException(status_code=400, detail="sections mancanti")

    # crea domande
    qs = pick_questions_from_bank(cfg.sections, cfg.order)

    # session id
    sid = f"s_{int(time.time()*1000)}_{random.randint(1000,9999)}"
    sess = _read_sessions()
    sess[sid] = {
        "created_at": int(time.time()),
        "duration_min": int(cfg.duration_min or 0),
        "sections": [s.model_dump() for s in cfg.sections],
        "order": cfg.order,
        "questions": qs,  # include soluzioni (server-side)
        "submitted": False,
    }
    _write_sessions(sess)

    # ritorna al client senza soluzioni
    public_qs = [_public_question(q) for q in qs]
    return {"session_id": sid, "questions": public_qs}



class SubmitLite(BaseModel):
    answers: Dict[str, Any]


@router.post("/{session_id}/submit")
def submit_path(session_id: str, body: SubmitLite):
    return _submit_internal(session_id, body.answers)


@router.post("/submit")
def submit(body: SubmitBody):
    # compat: accetta anche session_id nel body
    return _submit_internal(body.session_id, body.answers)


def _submit_internal(session_id: str, answers: Dict[str, Any]):
    sess = _read_sessions()
    s = sess.get(session_id)
    if not s:
        raise HTTPException(status_code=404, detail="sessione non trovata")

    if s.get("submitted"):
        return s.get("result") or {"ok": True}

    questions: list[dict] = s.get("questions") or []
    ans = answers or {}

    correct = 0
    wrong = 0
    omitted = 0

    details = []

    for q in questions:
        qid = q.get("id")
        tipo = q.get("tipo")
        user_ans = ans.get(qid, None)

        if user_ans is None or str(user_ans).strip() == "":
            omitted += 1
            ok = None
        else:
            if tipo == "scelta":
                u = _choice_letter(user_ans)
                c = _choice_letter(q.get("corretta"))
                ok = (u == c)
            else:
                acceptable = q.get("risposte") or []
                acceptable_norm = {_norm_answer(x) for x in acceptable if _norm_answer(x)}
                ok = _norm_answer(str(user_ans)) in acceptable_norm if acceptable_norm else False

            if ok:
                correct += 1
            else:
                wrong += 1

        details.append({"id": qid, "materia": q.get("materia"), "tipo": tipo, "ok": ok})

    score = correct * 1.0 + wrong * (-0.1) + omitted * 0.0
    result = {"correct": correct, "wrong": wrong, "omitted": omitted, "score": round(score, 2), "details": details}

    s["submitted"] = True
    s["result"] = result
    sess[session_id] = s
    _write_sessions(sess)

    return result
