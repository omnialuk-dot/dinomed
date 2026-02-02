"""DinoMed admin auth utilities.

Centralizziamo qui la verifica JWT per evitare duplicazioni e import rotti.
Usato come dependency in FastAPI: Depends(admin_required).
"""

from __future__ import annotations

import os
from fastapi import HTTPException, Request


def admin_required(request: Request):
    """FastAPI dependency: richiede header Authorization: Bearer <token>.

    Accetta JWT HS256 creato da routes/admin.py (role=admin).
    """

    auth = request.headers.get("authorization", "")
    if not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = auth.split(" ", 1)[1].strip()

    try:
        import jwt

        payload = jwt.decode(token, os.getenv("JWT_SECRET", ""), algorithms=["HS256"])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Not admin")
        return payload
    except Exception as e:
        # gestiamo esplicitamente token scaduto se possibile
        try:
            import jwt  # type: ignore

            if isinstance(e, jwt.ExpiredSignatureError):
                raise HTTPException(status_code=401, detail="Token expired")
        except Exception:
            pass
        raise HTTPException(status_code=401, detail="Invalid token")



def try_get_user(request: Request):
    """Ritorna payload utente se presente e valido, altrimenti None (NON alza)."""
    auth = request.headers.get("authorization", "")
    if not auth.lower().startswith("bearer "):
        return None
    token = auth.split(" ", 1)[1].strip()
    if not token:
        return None
    try:
        import jwt
        payload = jwt.decode(token, os.getenv("JWT_SECRET", ""), algorithms=["HS256"])
        if payload.get("role") != "user":
            return None
        return payload
    except Exception:
        return None


def user_required(request: Request):
    """FastAPI dependency: richiede token utente valido."""
    p = try_get_user(request)
    if not p:
        raise HTTPException(status_code=401, detail="Missing/invalid user token")
    return p


def bot_required(request: Request):
    """FastAPI dependency: richiede header Authorization: Bearer <BOT_API_KEY>.

    Usato dal bot Telegram per leggere dati (dispense, domande, profilo).
    """
    expected = os.getenv("BOT_API_KEY", "").strip()
    if not expected:
        # se non configurato, blocca (evita API aperta per errore)
        raise HTTPException(status_code=500, detail="BOT_API_KEY not configured")

    auth = request.headers.get("authorization", "")
    if not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = auth.split(" ", 1)[1].strip()
    if token != expected:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"role": "bot"}
