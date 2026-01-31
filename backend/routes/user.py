from fastapi import APIRouter, Depends, HTTPException
from typing import Any, Dict, List
from pathlib import Path
from datetime import datetime
import json

from auth import user_required

router = APIRouter(prefix="/api/user", tags=["user"])

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
RUNS_FILE = DATA_DIR / "user_runs.json"

def _ensure():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not RUNS_FILE.exists():
        RUNS_FILE.write_text("[]", encoding="utf-8")

def _read_all() -> List[Dict[str, Any]]:
    _ensure()
    try:
        data = json.loads(RUNS_FILE.read_text(encoding="utf-8") or "[]")
        return data if isinstance(data, list) else []
    except Exception:
        return []

def _write_all(items: List[Dict[str, Any]]):
    _ensure()
    RUNS_FILE.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")

@router.get("/runs")
def list_runs(user=Depends(user_required)):
    email = str(user.get("email") or "")
    items = [x for x in _read_all() if str(x.get("email") or "") == email]
    # ordina dal più recente
    items.sort(key=lambda x: str(x.get("created_at") or ""), reverse=True)
    # non ritornare email dentro ogni riga (non serve al frontend)
    sanitized = []
    for x in items:
        y = dict(x)
        y.pop("email", None)
        sanitized.append(y)
    return {"items": sanitized}

@router.get("/runs/{run_id}")
def get_run(run_id: str, user=Depends(user_required)):
    email = str(user.get("email") or "")
    for x in _read_all():
        if str(x.get("id")) == str(run_id) and str(x.get("email") or "") == email:
            y = dict(x)
            y.pop("email", None)
            return y
    raise HTTPException(status_code=404, detail="Run not found")
