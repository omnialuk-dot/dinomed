from __future__ import annotations

import os
from typing import Any, Dict, List, Optional

from supabase import create_client


def _get_env(name: str) -> Optional[str]:
    v = os.getenv(name)
    return v if v and str(v).strip() else None


def get_supabase_client():
    """Create a Supabase client.

    Prefers SUPABASE_SERVICE_KEY if present, otherwise SUPABASE_KEY.
    """
    url = _get_env("SUPABASE_URL")
    key = _get_env("SUPABASE_SERVICE_KEY") or _get_env("SUPABASE_KEY") or _get_env("SUPABASE_ANON_KEY")
    if not url or not key:
        raise RuntimeError("Supabase env mancanti: SUPABASE_URL e SUPABASE_KEY (o SUPABASE_SERVICE_KEY).")
    return create_client(url, key)


def fetch_all_questions() -> List[Dict[str, Any]]:
    """Fetch all questions with pagination (PostgREST default limit can be 1000)."""
    sb = get_supabase_client()
    out: List[Dict[str, Any]] = []
    offset = 0
    page = 1000
    while True:
        resp = sb.table("questions").select("*").range(offset, offset + page - 1).execute()
        err = getattr(resp, "error", None)
        data = getattr(resp, "data", None) or []
        if err and not data:
            raise RuntimeError(f"Supabase error fetching questions: {err}")
        if not data:
            break
        out.extend(data)
        if len(data) < page:
            break
        offset += page
    return out


def fetch_question_by_id(qid: str) -> Optional[Dict[str, Any]]:
    sb = get_supabase_client()
    resp = sb.table("questions").select("*").eq("id", qid).limit(1).execute()
    data = getattr(resp, "data", None) or []
    return data[0] if data else None


def insert_question(payload: Dict[str, Any]) -> Dict[str, Any]:
    sb = get_supabase_client()
    resp = sb.table("questions").insert(payload).execute()
    data = getattr(resp, "data", None) or []
    return data[0] if data else payload


def update_question(qid: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    sb = get_supabase_client()
    resp = sb.table("questions").update(payload).eq("id", qid).execute()
    data = getattr(resp, "data", None) or []
    return data[0] if data else None


def delete_question(qid: str) -> bool:
    sb = get_supabase_client()
    resp = sb.table("questions").delete().eq("id", qid).execute()
    data = getattr(resp, "data", None)
    # If no error raised, consider success
    return True


def upsert_user(email: str, sub: str, name: str = "", picture: str = "") -> Dict[str, Any]:
    sb = get_supabase_client()
    payload = {
        "email": email,
        "google_sub": sub,
        "username": name or email.split("@")[0],
        "picture": picture,
    }
    # prefer upsert on google_sub if column exists; fallback to insert+select
    try:
        resp = sb.table("users").upsert(payload, on_conflict="google_sub").select("*").execute()
        data = getattr(resp, "data", None) or []
        return data[0] if data else payload
    except Exception:
        # fallback: try find existing
        try:
            resp = sb.table("users").select("*").eq("google_sub", sub).limit(1).execute()
            data = getattr(resp, "data", None) or []
            if data:
                return data[0]
        except Exception:
            pass
        resp = sb.table("users").insert(payload).select("*").execute()
        data = getattr(resp, "data", None) or []
        return data[0] if data else payload


def get_user_id_by_sub(sub: str) -> Optional[str]:
    sb = get_supabase_client()
    try:
        resp = sb.table("users").select("id").eq("google_sub", sub).limit(1).execute()
        data = getattr(resp, "data", None) or []
        return data[0].get("id") if data else None
    except Exception:
        return None


def insert_session(user_id: str, materia: str, score: int, totale: int):
    sb = get_supabase_client()
    payload = {"user_id": user_id, "materia": materia, "score": score, "totale": totale}
    sb.table("sessions").insert(payload).execute()


def list_dispense():
    sb = get_supabase_client()
    resp = sb.table("dispense").select("*").order("created_at", desc=True).execute()
    return getattr(resp, "data", None) or []


def get_dispensa(did: str):
    sb = get_supabase_client()
    resp = sb.table("dispense").select("*").eq("id", did).limit(1).execute()
    data = getattr(resp, "data", None) or []
    return data[0] if data else None


def insert_dispensa(payload: Dict[str, Any]):
    sb = get_supabase_client()
    resp = sb.table("dispense").insert(payload).select("*").execute()
    data = getattr(resp, "data", None) or []
    return data[0] if data else payload


def update_dispensa(did: str, payload: Dict[str, Any]):
    sb = get_supabase_client()
    resp = sb.table("dispense").update(payload).eq("id", did).select("*").execute()
    data = getattr(resp, "data", None) or []
    return data[0] if data else None


def delete_dispensa(did: str):
    sb = get_supabase_client()
    sb.table("dispense").delete().eq("id", did).execute()
    return True
