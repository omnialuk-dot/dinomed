from __future__ import annotations

import json
import uuid
from datetime import datetime
from pathlib import Path

from supabase_db import fetch_question_by_id
from typing import Any, Dict, List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from auth import admin_required, user_required


router = APIRouter(tags=["reports"])

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
REPORTS_FILE = DATA_DIR / "reports.json"

Status = Literal["open", "in_review", "resolved", "dismissed"]


def _ensure_db():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not REPORTS_FILE.exists():
        REPORTS_FILE.write_text("[]", encoding="utf-8")


def _read_all() -> List[Dict[str, Any]]:
    _ensure_db()
    try:
        data = json.loads(REPORTS_FILE.read_text(encoding="utf-8") or "[]")
        return data if isinstance(data, list) else []
    except Exception:
        return []


def _write_all(items: List[Dict[str, Any]]):
    _ensure_db()
    REPORTS_FILE.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")


def _norm(s: Optional[str]) -> str:
    return (s or "").strip()


def _iso_now() -> str:
    return datetime.utcnow().isoformat()


def _snapshot_from_bank_session(session_id: str, qid: str) -> Optional[Dict[str, Any]]:
    # sessioni.py (banca domande) salva questions_full con soluzioni
    try:
        from routes.sessioni import SESSIONS as BANK_SESSIONS  # type: ignore
    except Exception:
        BANK_SESSIONS = {}

    s = None
    try:
        s = BANK_SESSIONS.get(session_id)
    except Exception:
        s = None
    if not s:
        return None

    for q in (s.get("questions_full") or []):
        if str(q.get("id")) != str(qid):
            continue
        tipo = str(q.get("tipo") or "").strip().lower() or "scelta"
        snap: Dict[str, Any] = {
            "id": str(q.get("id")),
            "materia": q.get("materia"),
            "tipo": tipo,
            "testo": q.get("testo"),
            "tag": q.get("tag") if isinstance(q.get("tag"), list) else (q.get("tags") if isinstance(q.get("tags"), list) else []),
            "spiegazione": q.get("spiegazione"),
        }
        if tipo == "scelta":
            snap["opzioni"] = q.get("opzioni") or []
            # corretta: manteniamo sia lettera che index (se presenti)
            snap["corretta"] = q.get("corretta")
            snap["corretta_index"] = q.get("corretta_index")
        else:
            # completamento: supporta risposte (lista) oppure corretta string
            if isinstance(q.get("risposte"), list) and q.get("risposte"):
                snap["risposte"] = q.get("risposte")
            else:
                snap["corretta"] = q.get("corretta")
        return snap
    return None


def _snapshot_from_mock_session(session_id: str, qid: str) -> Optional[Dict[str, Any]]:
    # simulazioni.py mock: salva questions in sessione con _correct_* e _spiegazione
    try:
        from routes.simulazioni import SESSIONS as MOCK_SESSIONS  # type: ignore
    except Exception:
        MOCK_SESSIONS = {}

    s = None
    try:
        s = MOCK_SESSIONS.get(session_id)
    except Exception:
        s = None
    if not s:
        return None

    for q in (s.get("questions") or []):
        if str(q.get("id")) != str(qid):
            continue
        tipo = str(q.get("tipo") or "").strip().lower() or "scelta"
        snap: Dict[str, Any] = {
            "id": str(q.get("id")),
            "materia": q.get("materia"),
            "tipo": tipo,
            "testo": q.get("testo"),
            "tag": q.get("tag") if isinstance(q.get("tag"), list) else [],
            "spiegazione": q.get("_spiegazione") or q.get("spiegazione"),
        }
        if tipo == "scelta":
            snap["opzioni"] = q.get("opzioni") or []
            ci = q.get("_correct_index")
            snap["corretta_index"] = ci
            try:
                snap["corretta"] = chr(65 + int(ci))
            except Exception:
                snap["corretta"] = None
        else:
            snap["corretta"] = q.get("_correct_text")
        return snap
    return None


def _snapshot_from_domande_db(qid: str) -> Optional[Dict[str, Any]]:
    try:
        q = fetch_question_by_id(str(qid))
        if not q:
            return None
            tipo = str(q.get("tipo") or "").strip().lower() or "scelta"
            snap: Dict[str, Any] = {
                "id": str(q.get("id")),
                "materia": q.get("materia"),
                "tipo": tipo,
                "testo": q.get("testo"),
                "tag": q.get("tag") if isinstance(q.get("tag"), list) else [],
                "spiegazione": q.get("spiegazione"),
            }
            if tipo == "scelta":
                snap["opzioni"] = q.get("opzioni") or []
                snap["corretta"] = q.get("corretta")
                snap["corretta_index"] = q.get("corretta_index")
            else:
                if isinstance(q.get("risposte"), list) and q.get("risposte"):
                    snap["risposte"] = q.get("risposte")
                else:
                    snap["corretta"] = q.get("corretta")
            return snap
    except FileNotFoundError:
        return None
    except Exception:
        return None
    return None


def _build_question_snapshot(session_id: Optional[str], qid: str) -> Dict[str, Any]:
    if session_id:
        snap = _snapshot_from_bank_session(session_id, qid)
        if snap:
            return snap
        snap = _snapshot_from_mock_session(session_id, qid)
        if snap:
            return snap
    snap = _snapshot_from_domande_db(qid)
    if snap:
        return snap
    raise HTTPException(status_code=404, detail="Domanda non trovata per segnalazione")


class ReportIn(BaseModel):
    session_id: Optional[str] = None
    run_id: Optional[str] = None
    question_id: str = Field(..., min_length=1)
    note: Optional[str] = None


@router.post("/api/report")
def create_report(payload: ReportIn, user=Depends(user_required)):
    email = str(user.get("email") or "").strip()
    if not email:
        raise HTTPException(status_code=401, detail="Missing user")

    qid = _norm(payload.question_id)
    if not qid:
        raise HTTPException(status_code=422, detail="question_id mancante")

    session_id = _norm(payload.session_id) or None
    run_id = _norm(payload.run_id) or None

    snap = _build_question_snapshot(session_id, qid)

    rec = {
        "id": uuid.uuid4().hex,
        "created_at": _iso_now(),
        "email": email,
        "session_id": session_id,
        "run_id": run_id,
        "status": "open",
        "user_note": (_norm(payload.note) or None),
        "admin_note": None,
        "question": snap,
    }

    items = _read_all()
    items.insert(0, rec)
    _write_all(items)

    return {"ok": True, "id": rec["id"]}


@router.get("/api/user/reports")
def list_user_reports(user=Depends(user_required)):
    email = str(user.get("email") or "").strip()
    items = [x for x in _read_all() if str(x.get("email") or "").strip() == email]
    items.sort(key=lambda x: str(x.get("created_at") or ""), reverse=True)
    # non serve rimandare email al client
    out = []
    for x in items:
        y = dict(x)
        y.pop("email", None)
        out.append(y)
    return {"items": out}


@router.get("/api/admin/reports")
def admin_list_reports(
    status: Optional[Status] = None,
    materia: Optional[str] = None,
    date_from: Optional[str] = Query(default=None, description="ISO date/time inclusive"),
    date_to: Optional[str] = Query(default=None, description="ISO date/time inclusive"),
    _=Depends(admin_required),
):
    items = _read_all()

    if status:
        items = [x for x in items if str(x.get("status") or "") == str(status)]
    if materia:
        m = materia.strip().lower()
        items = [x for x in items if str((x.get("question") or {}).get("materia") or "").strip().lower() == m]

    # filtri data (lex compare ISO ok)
    if date_from:
        df = date_from.strip()
        items = [x for x in items if str(x.get("created_at") or "") >= df]
    if date_to:
        dt = date_to.strip()
        items = [x for x in items if str(x.get("created_at") or "") <= dt]

    items.sort(key=lambda x: str(x.get("created_at") or ""), reverse=True)
    return {"items": items}


class ReportUpdate(BaseModel):
    status: Optional[Status] = None
    admin_note: Optional[str] = None


@router.patch("/api/admin/reports/{report_id}")
def admin_update_report(report_id: str, payload: ReportUpdate, _=Depends(admin_required)):
    rid = _norm(report_id)
    if not rid:
        raise HTTPException(status_code=422, detail="id mancante")

    items = _read_all()
    found = None
    for i, x in enumerate(items):
        if str(x.get("id")) != rid:
            continue
        if payload.status:
            x["status"] = payload.status
        if payload.admin_note is not None:
            x["admin_note"] = _norm(payload.admin_note) or None
        x["updated_at"] = _iso_now()
        items[i] = x
        found = x
        break

    if not found:
        raise HTTPException(status_code=404, detail="Segnalazione non trovata")

    _write_all(items)
    return {"ok": True, "item": found}
