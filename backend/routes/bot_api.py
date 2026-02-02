
from fastapi import APIRouter, HTTPException, Request, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any
from pathlib import Path
import json
import random

from auth import bot_required

# Reuse bank+picker from sessioni.py (source of truth for questions)
from routes import sessioni as sim_sessions

router = APIRouter(prefix="/api/bot", tags=["bot"], dependencies=[Depends(bot_required)])


# -------------------------
# Materials (dispense)
# -------------------------
DATA_DIR = Path(__file__).resolve().parents[1] / "data"
DISPENSE_FILE = DATA_DIR / "dispense.json"

def _read_dispense() -> List[dict]:
    try:
        raw = DISPENSE_FILE.read_text(encoding="utf-8")
        data = json.loads(raw or "[]")
        return data if isinstance(data, list) else []
    except FileNotFoundError:
        return []
    except Exception:
        return []

def _normalize_dispensa(x: dict) -> dict:
    # compat: file_url -> link
    if not x.get("link") and x.get("file_url"):
        x["link"] = x.get("file_url")
    # normalize uploads relative path
    link = x.get("link")
    if isinstance(link, str) and link.strip():
        s = link.strip()
        i = s.find("/uploads/")
        if i >= 0:
            x["link"] = s[i:]
    return x

class MaterialsResponse(BaseModel):
    items: List[dict]
    page: int
    limit: int
    has_next: bool

@router.get("/materials", response_model=MaterialsResponse)
def bot_list_materials(
    request: Request,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=20),
):
    """
    Ritorna dispense pubblicate in formato "bot-friendly" con link assoluto.
    """
    base = str(request.base_url).rstrip("/")
    all_items = [_normalize_dispensa(x) for x in _read_dispense()]
    pub = [x for x in all_items if x.get("pubblicata") is True]

    # sort: newest first if possible
    def k(x):
        return str(x.get("created_at") or x.get("data") or "")
    pub.sort(key=k, reverse=True)

    start = (page - 1) * limit
    end = start + limit
    items = pub[start:end]
    has_next = end < len(pub)

    out = []
    for x in items:
        link = x.get("link")
        pdf_url = None
        if isinstance(link, str) and link.strip():
            if link.startswith("http://") or link.startswith("https://"):
                pdf_url = link
            elif link.startswith("/"):
                pdf_url = base + link
            else:
                pdf_url = base + "/" + link
        out.append({
            "id": x.get("id") or x.get("_id") or "",
            "title": x.get("titolo") or x.get("title") or "Dispensa",
            "description": x.get("descrizione") or x.get("description") or "",
            "materia": x.get("materia") or "",
            "pdf_url": pdf_url,
            "created_at": x.get("created_at") or x.get("data") or "",
        })

    return {"items": out, "page": page, "limit": limit, "has_next": has_next}


@router.get("/materials/{material_id}")
def bot_get_material(material_id: str, request: Request):
    base = str(request.base_url).rstrip("/")
    all_items = [_normalize_dispensa(x) for x in _read_dispense()]
    pub = [x for x in all_items if x.get("pubblicata") is True]
    for x in pub:
        xid = str(x.get("id") or x.get("_id") or "")
        if xid == str(material_id):
            link = x.get("link")
            pdf_url = None
            if isinstance(link, str) and link.strip():
                if link.startswith("http://") or link.startswith("https://"):
                    pdf_url = link
                elif link.startswith("/"):
                    pdf_url = base + link
                else:
                    pdf_url = base + "/" + link
            return {
                "id": xid,
                "title": x.get("titolo") or x.get("title") or "Dispensa",
                "description": x.get("descrizione") or x.get("description") or "",
                "materia": x.get("materia") or "",
                "pdf_url": pdf_url,
                "created_at": x.get("created_at") or x.get("data") or "",
            }
    raise HTTPException(status_code=404, detail="Material not found")


# -------------------------
# Questions picker (full solutions) - single source of truth
# -------------------------
Materia = Literal["Chimica", "Fisica", "Biologia"]
TipoQ = Literal["scelta", "completamento"]

class Section(BaseModel):
    materia: Materia
    scelta: int = Field(0, ge=0, le=200)
    completamento: int = Field(0, ge=0, le=200)
    tag: List[str] = []
    difficolta: str = "Base"

class PickRequest(BaseModel):
    sections: List[Section]
    order: Optional[List[Materia]] = None
    seed: Optional[int] = None  # for reproducibility (optional)

@router.post("/questions/pick")
def bot_pick_questions(body: PickRequest):
    if not body.sections:
        raise HTTPException(status_code=400, detail="sections vuoto")

    rng = random.Random(body.seed) if body.seed is not None else random

    order = body.order or [s.materia for s in body.sections]
    picked_full: List[Dict[str, Any]] = []

    # We reuse the picker but we shuffle deterministically if seed provided
    for materia in order:
        sec = next((s for s in body.sections if s.materia == materia), None)
        if not sec:
            continue

        if sec.scelta > 0:
            pool = sim_sessions.pick_questions_from_bank(materia, "scelta", 10_000, sec.tag or [])
            if len(pool) < sec.scelta:
                raise HTTPException(status_code=400, detail=f"Domande insufficienti: {materia} scelta")
            rng.shuffle(pool)
            picked_full.extend(pool[:sec.scelta])

        if sec.completamento > 0:
            pool = sim_sessions.pick_questions_from_bank(materia, "completamento", 10_000, sec.tag or [])
            if len(pool) < sec.completamento:
                raise HTTPException(status_code=400, detail=f"Domande insufficienti: {materia} completamento")
            rng.shuffle(pool)
            picked_full.extend(pool[:sec.completamento])

    if not picked_full:
        raise HTTPException(status_code=404, detail="Nessuna domanda trovata")

    # Normalize output fields for bot
    out = []
    for q in picked_full:
        qid = str(q.get("id") or "")
        tipo = q.get("tipo")
        item = {
            "id": qid,
            "materia": q.get("materia"),
            "tipo": tipo,
            "tag": q.get("tag") or q.get("tags") or [],
            "testo": q.get("testo") or "",
            "spiegazione": q.get("spiegazione") or "",
        }
        if tipo == "scelta":
            item["opzioni"] = q.get("opzioni") or []
            # support old field names
            item["correct_answer"] = q.get("correct_answer")
            if item["correct_answer"] is None:
                item["correct_answer"] = q.get("corretta_index")
            if item["correct_answer"] is None:
                item["correct_answer"] = q.get("answer_index")
        else:
            item["correct_answer"] = q.get("correct_answer")
        out.append(item)

    return {"items": out}


# -------------------------
# User profile (by email) for bot
# -------------------------
RUNS_FILE = DATA_DIR / "user_runs.json"

def _read_runs() -> List[Dict[str, Any]]:
    try:
        raw = RUNS_FILE.read_text(encoding="utf-8")
        data = json.loads(raw or "[]")
        return data if isinstance(data, list) else []
    except FileNotFoundError:
        return []
    except Exception:
        return []

def _role_for(n: int) -> Dict[str, Any]:
    roles = [
        {"min": 0, "key": "tirocinante", "name": "Tirocinante", "desc": "Primi passi: costruisci il metodo."},
        {"min": 10, "key": "studente_clinico", "name": "Studente Clinico", "desc": "Costanza vera: stai entrando nel ritmo giusto."},
        {"min": 50, "key": "specializzando", "name": "Specializzando", "desc": "Ottimo livello: velocità e controllo iniziano a vedersi."},
        {"min": 100, "key": "medico_in_corsia", "name": "Medico in corsia", "desc": "Base solida: ora conta la precisione."},
        {"min": 200, "key": "medico_esperto", "name": "Medico Esperto", "desc": "Premium: lucidità, costanza e scelte intelligenti."},
        {"min": 500, "key": "primario", "name": "Primario", "desc": "Livello elite: disciplina e visione completa."},
    ]
    out = roles[0]
    for r in roles:
        if n >= r["min"]:
            out = r
    # next milestone
    next_min = None
    for r in roles:
        if r["min"] > out["min"]:
            next_min = r["min"]
            break
    out2 = dict(out)
    out2["next_min"] = next_min
    out2["to_next"] = (next_min - n) if next_min is not None else 0
    return out2

@router.get("/user/profile")
def bot_user_profile(email: str = Query(..., min_length=3)):
    email = str(email).strip().lower()
    runs = [r for r in _read_runs() if str(r.get("email") or "").strip().lower() == email]
    runs.sort(key=lambda x: str(x.get("created_at") or ""), reverse=True)

    total_runs = len(runs)
    total_correct = 0
    total_q = 0
    best_score = None

    for r in runs:
        c = int(r.get("correct") or 0)
        w = int(r.get("wrong") or 0)
        b = int(r.get("blank") or 0)
        total_correct += c
        total_q += (c + w + b)
        st = r.get("score_total")
        try:
            st = float(st)
        except Exception:
            st = None
        if st is not None:
            best_score = st if best_score is None else max(best_score, st)

    accuracy = round((total_correct / total_q) * 100, 1) if total_q > 0 else 0.0
    role = _role_for(total_runs)

    return {
        "email": email,
        "total_runs": total_runs,
        "accuracy_pct": accuracy,
        "best_score_total": best_score,
        "last_run": runs[0] if runs else None,
        "role": role,
    }
