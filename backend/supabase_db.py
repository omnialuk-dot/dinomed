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
        data = getattr(resp, "data", None) or []
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
