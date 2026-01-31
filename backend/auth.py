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
