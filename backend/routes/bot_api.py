from __future__ import annotations

import os
import json
import random
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, Field


router = APIRouter(prefix="/api/bot", tags=["bot-api"])

BASE_DIR = Path(__file__).resolve().parents[1]  # backend/
DATA_DIR = BASE_DIR / "data"
DISPENSE_FILE = DATA_DIR / "dispense.json"
DOMANDE_FILE = DATA_DIR / "domande.json"
RUNS_FILE = DATA_DIR / "user_runs.json"
INVITES_FILE = DATA_DIR / "bot_invites.json"  # {token: {email, expires_at, used, used_by}}
LINKS_FILE = DATA_DIR / "bot_links.json"      # {telegram_id: {email, linked_at}}



# -----------------------------
# Auth (shared key between bot and backend)
# -----------------------------
def _get_expected_key() -> str:
    # Support both names to avoid misconfig in deploy dashboards
    return str(os.getenv("BOT_API_KEY") or os.getenv("NOMAD_API_KEY") or "").strip()

def bot_key_required(request: Request):
    expected = _get_expected_key()
    if not expected:
        raise HTTPException(status_code=500, detail="BOT_API_KEY not configured on server")
    auth = request.headers.get("authorization") or request.headers.get("Authorization") or ""
    key = ""
    if auth.lower().startswith("bearer "):
        key = auth.split(" ", 1)[1].strip()
    if not key:
        key = request.headers.get("x-api-key") or request.headers.get("X-API-Key") or ""
        key = str(key).strip()
    if key != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True


def _read_json_list(path: Path) -> List[Dict[str, Any]]:
    try:
        if not path.exists():
            return []
        data = json.loads(path.read_text(encoding="utf-8") or "[]")
        return data if isinstance(data, list) else []
    except Exception:
        return []


def _abs_url(request: Request, maybe_path: Optional[str]) -> Optional[str]:
    if not maybe_path:
        return None
    s = str(maybe_path).strip()
    if not s:
        return None
    # If the stored link is a full URL (maybe from old localhost), try to
    # normalize it to the current domain using only the /uploads/ path.
    if s.startswith("http://") or s.startswith("https://"):
        i = s.find("/uploads/")
        if i >= 0:
            s = s[i:]  # keep relative /uploads/... and rebuild below
        else:
            return s
    # ensure leading slash
    if not s.startswith("/"):
        s = "/" + s
    base = str(request.base_url).rstrip("/")
    return base + s


# -----------------------------
# Dispense (aka Materials)
# -----------------------------
@router.get("/materials")
def bot_list_materials(
    request: Request,
    page: int = 1,
    limit: int = 10,
    _=Depends(bot_key_required),
):
    items = _read_json_list(DISPENSE_FILE)
    # only published
    published = [x for x in items if x.get("pubblicata") is True]
    # newest first if created_at exists
    published.sort(key=lambda x: str(x.get("created_at") or ""), reverse=True)

    page = max(1, int(page or 1))
    limit = max(1, min(50, int(limit or 10)))
    start = (page - 1) * limit
    end = start + limit
    slice_ = published[start:end]
    out = []
    for x in slice_:
        out.append({
            "id": x.get("id"),
            "title": x.get("titolo") or x.get("title") or "Dispensa",
            "description": x.get("descrizione") or "",
            "pdf_url": _abs_url(request, x.get("link") or x.get("file_url") or x.get("pdf_url")),
        })
    return {
        "page": page,
        "limit": limit,
        "has_next": end < len(published),
        "items": out,
    }


@router.get("/materials/{material_id}")
def bot_get_material(
    request: Request,
    material_id: str,
    _=Depends(bot_key_required),
):
    items = _read_json_list(DISPENSE_FILE)
    for x in items:
        if str(x.get("id")) == str(material_id) and x.get("pubblicata") is True:
            return {
                "id": x.get("id"),
                "title": x.get("titolo") or x.get("title") or "Dispensa",
                "description": x.get("descrizione") or "",
                "pdf_url": _abs_url(request, x.get("link") or x.get("file_url") or x.get("pdf_url")),
                "meta": {
                    "materia": x.get("materia") or "",
                    "pagine": x.get("pagine"),
                    "tag": x.get("tag") or [],
                }
            }
    raise HTTPException(status_code=404, detail="Material not found")


# -----------------------------
# Questions picker for bot simulations
# -----------------------------
class Section(BaseModel):
    materia: str = Field(..., min_length=1)
    scelta: int = Field(0, ge=0, le=200)
    completamento: int = Field(0, ge=0, le=200)
    tag: List[str] = Field(default_factory=list)

class PickBody(BaseModel):
    sections: List[Section] = Field(default_factory=list)
    order: Optional[List[str]] = None
    seed: Optional[int] = None

def _norm_subject(s: str) -> str:
    s = (s or "").strip()
    if not s:
        return s
    # normalize common
    cap = s[0].upper() + s[1:].lower()
    # keep known subjects capitalization
    for ok in ("Chimica", "Fisica", "Biologia"):
        if cap.lower() == ok.lower():
            return ok
    return cap

def _norm_type(q: dict) -> str:
    t = q.get("tipo") or q.get("type") or q.get("question_type") or ""
    t = str(t).lower().strip()
    if "comp" in t or "fill" in t:
        return "completamento"
    return "scelta"

def _matches_tags(q: dict, tags: List[str]) -> bool:
    if not tags:
        return True
    qt = [str(x).strip().lower() for x in (q.get("tag") or []) if str(x).strip()]
    want = set([str(x).strip().lower() for x in tags if str(x).strip()])
    return any(t in want for t in qt)

@router.post("/questions/pick")
def bot_pick_questions(body: PickBody, _=Depends(bot_key_required)):
    if body.seed is not None:
        random.seed(int(body.seed))

    bank = _read_json_list(DOMANDE_FILE)

    # organize by subject and type
    out: List[Dict[str, Any]] = []

    order = body.order or [sec.materia for sec in body.sections]
    order = [_norm_subject(x) for x in order if str(x).strip()]
    if not order:
        order = ["Chimica", "Fisica", "Biologia"]

    for subj in order:
        for sec in body.sections:
            if _norm_subject(sec.materia) != subj:
                continue

            # pick scelta
            if sec.scelta:
                pool = [q for q in bank if _norm_subject(q.get("materia") or "") == subj and _norm_type(q) == "scelta" and _matches_tags(q, sec.tag)]
                random.shuffle(pool)
                out.extend(pool[: int(sec.scelta)])

            # pick completamento
            if sec.completamento:
                pool = [q for q in bank if _norm_subject(q.get("materia") or "") == subj and _norm_type(q) == "completamento" and _matches_tags(q, sec.tag)]
                random.shuffle(pool)
                out.extend(pool[: int(sec.completamento)])

    # sanitize for bot: ensure fields exist
    normalized: List[Dict[str, Any]] = []
    for q in out:
        qid = q.get("id")
        materia = _norm_subject(q.get("materia") or "")
        tipo = _norm_type(q)
        testo = q.get("testo") or q.get("text") or ""
        spiegazione = q.get("spiegazione") or q.get("explanation") or ""
        if tipo == "scelta":
            opzioni = q.get("opzioni") or q.get("options") or []
            # ensure list of 5
            if isinstance(opzioni, dict):
                # dict A-E
                keys = sorted(opzioni.keys())
                opzioni = [opzioni[k] for k in keys]
            if not isinstance(opzioni, list):
                opzioni = []
            opzioni = [str(x) for x in opzioni][:5]
            while len(opzioni) < 5:
                opzioni.append("")
            corretta_index = q.get("corretta_index")
            if corretta_index is None:
                corr = q.get("corretta")
                if isinstance(corr, str) and corr.strip().upper() in ["A","B","C","D","E"]:
                    corretta_index = ["A","B","C","D","E"].index(corr.strip().upper())
            try:
                corretta_index = int(corretta_index)
            except Exception:
                corretta_index = -1
            normalized.append({
                "id": qid,
                "materia": materia,
                "tipo": "scelta",
                "testo": testo,
                "opzioni": opzioni,
                "corretta_index": corretta_index,
                "spiegazione": spiegazione,
            })
        else:
            risposte = q.get("risposte") or q.get("risposta") or []
            if isinstance(risposte, str):
                risposte = [risposte]
            if not isinstance(risposte, list):
                risposte = []
            normalized.append({
                "id": qid,
                "materia": materia,
                "tipo": "completamento",
                "testo": testo,
                "risposte": [str(x) for x in risposte if str(x).strip()],
                "spiegazione": spiegazione,
            })

    # shuffle final for mix, but keep order already by subject sections. Bot can shuffle itself if needed.
    return {"items": normalized, "count": len(normalized)}



# -----------------------------
# Premium access: Admin-generated token -> user /access
# -----------------------------
class InviteCreateBody(BaseModel):
    email: str = Field(..., min_length=3)
    ttl_minutes: int = Field(20, ge=1, le=1440)

class InviteRedeemBody(BaseModel):
    token: str = Field(..., min_length=4)
    telegram_id: int = Field(..., ge=1)

def _read_json_obj(path: Path) -> Dict[str, Any]:
    try:
        if not path.exists():
            return {}
        data = json.loads(path.read_text(encoding="utf-8") or "{}")
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}

def _write_json_obj(path: Path, data: Dict[str, Any]) -> None:
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        tmp = path.with_suffix(path.suffix + ".tmp")
        tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        tmp.replace(path)
    except Exception:
        # if write fails, raise to make issue visible
        raise

def _clean_email(s: str) -> str:
    return str(s or "").strip().lower()

def _gen_token() -> str:
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return "DNM-" + "".join(random.choice(alphabet) for _ in range(6))

def _now_ts() -> int:
    return int(time.time())

@router.post("/invite/create")
def bot_invite_create(body: InviteCreateBody, _=Depends(bot_key_required)):
    email = _clean_email(body.email)
    if "@" not in email or "." not in email:
        raise HTTPException(status_code=422, detail="invalid email")
    ttl = int(body.ttl_minutes or 20)
    expires_at = _now_ts() + ttl * 60

    invites = _read_json_obj(INVITES_FILE)
    # generate unique token
    token = _gen_token()
    tries = 0
    while token in invites and tries < 20:
        token = _gen_token()
        tries += 1

    invites[token] = {
        "email": email,
        "expires_at": expires_at,
        "created_at": _now_ts(),
        "used": False,
        "used_by": None,
    }
    _write_json_obj(INVITES_FILE, invites)
    return {"token": token, "expires_at": expires_at, "email": email}

@router.post("/invite/redeem")
def bot_invite_redeem(body: InviteRedeemBody, _=Depends(bot_key_required)):
    token = str(body.token or "").strip()
    telegram_id = int(body.telegram_id)

    invites = _read_json_obj(INVITES_FILE)
    inv = invites.get(token)
    if not inv:
        raise HTTPException(status_code=404, detail="token not found")
    if bool(inv.get("used")):
        raise HTTPException(status_code=409, detail="token already used")
    if int(inv.get("expires_at") or 0) < _now_ts():
        raise HTTPException(status_code=410, detail="token expired")

    email = _clean_email(inv.get("email") or "")
    if not email:
        raise HTTPException(status_code=500, detail="token email missing")

    # mark used
    inv["used"] = True
    inv["used_by"] = telegram_id
    inv["used_at"] = _now_ts()
    invites[token] = inv
    _write_json_obj(INVITES_FILE, invites)

    # link telegram_id -> email
    links = _read_json_obj(LINKS_FILE)
    links[str(telegram_id)] = {"email": email, "linked_at": _now_ts()}
    _write_json_obj(LINKS_FILE, links)

    return {"ok": True, "telegram_id": telegram_id, "email": email}

@router.get("/access/check")
def bot_access_check(telegram_id: int, _=Depends(bot_key_required)):
    links = _read_json_obj(LINKS_FILE)
    info = links.get(str(int(telegram_id))) or {}
    email = _clean_email(info.get("email") or "")
    return {"allowed": bool(email), "email": email or None}

@router.post("/access/revoke")
def bot_access_revoke(telegram_id: int, _=Depends(bot_key_required)):
    links = _read_json_obj(LINKS_FILE)
    tid = str(int(telegram_id))
    existed = tid in links
    if existed:
        links.pop(tid, None)
        _write_json_obj(LINKS_FILE, links)
    return {"ok": True, "revoked": existed}

@router.get("/user/profile_by_tg")
def bot_user_profile_by_tg(telegram_id: int, _=Depends(bot_key_required)):
    links = _read_json_obj(LINKS_FILE)
    info = links.get(str(int(telegram_id))) or {}
    email = _clean_email(info.get("email") or "")
    if not email:
        raise HTTPException(status_code=404, detail="not linked")
    return bot_user_profile(email=email, _=True)


# -----------------------------
# Profile by email (stats + role)
# -----------------------------
_ROLES = [
    {"min": 0, "key": "tirocinante", "name": "Tirocinante", "desc": "Primi passi: fai la prima simulazione e inizia a costruire metodo."},
    {"min": 10, "key": "studente_clinico", "name": "Studente Clinico", "desc": "Costanza vera: stai entrando nel ritmo giusto."},
    {"min": 50, "key": "specializzando", "name": "Specializzando", "desc": "Ottimo livello: velocità e controllo iniziano a vedersi."},
    {"min": 100, "key": "medico_in_corsia", "name": "Medico in corsia", "desc": "Base solida: ora conta la precisione nei dettagli."},
    {"min": 200, "key": "medico_esperto", "name": "Medico Esperto", "desc": "Qui si gioca premium: lucidità, costanza e scelte intelligenti."},
    {"min": 500, "key": "primario", "name": "Primario", "desc": "Livello elite: disciplina e visione completa. Rispetto."},
]

def _role_for(total_runs: int) -> Dict[str, Any]:
    total_runs = int(total_runs or 0)
    cur = _ROLES[0]
    nxt = None
    for r in _ROLES:
        if total_runs >= r["min"]:
            cur = r
        elif nxt is None:
            nxt = r
    # find next after current
    for r in _ROLES:
        if r["min"] > cur["min"]:
            nxt = r
            break
    to_next = 0
    next_min = None
    if nxt:
        next_min = int(nxt["min"])
        to_next = max(0, next_min - total_runs)
    return {
        "key": cur["key"],
        "name": cur["name"],
        "desc": cur["desc"],
        "to_next": to_next,
        "next_min": next_min,
    }

def _compute_accuracy(runs: List[Dict[str, Any]]) -> float:
    # try to use overallPct if present; else compute from correct/total if present
    vals = []
    for r in runs:
        if r.get("overallPct") is not None:
            try:
                vals.append(float(r["overallPct"]))
            except Exception:
                pass
        elif r.get("accuracy_pct") is not None:
            try:
                vals.append(float(r["accuracy_pct"]))
            except Exception:
                pass
        elif r.get("correct") is not None and r.get("total") is not None:
            try:
                c = float(r["correct"]); t = float(r["total"])
                if t > 0:
                    vals.append((c/t)*100.0)
            except Exception:
                pass
    if not vals:
        return 0.0
    return round(sum(vals)/len(vals), 1)

@router.get("/user/profile")
def bot_user_profile(email: str, _=Depends(bot_key_required)):
    e = (email or "").strip().lower()
    if not e:
        raise HTTPException(status_code=422, detail="email required")
    runs = _read_json_list(RUNS_FILE)
    mine = [x for x in runs if str(x.get("email") or "").strip().lower() == e]
    mine.sort(key=lambda x: str(x.get("created_at") or ""), reverse=True)
    total = len(mine)
    acc = _compute_accuracy(mine)
    role = _role_for(total)
    return {
        "email": e,
        "total_runs": total,
        "accuracy_pct": acc,
        "role": role,
    }