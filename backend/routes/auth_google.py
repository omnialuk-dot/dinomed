from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import json
import urllib.request
import urllib.parse
import jwt
from supabase_db import upsert_user
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/auth", tags=["auth"])

JWT_SECRET = os.getenv("JWT_SECRET", "CHANGE_ME_SUPER_SECRET")
JWT_EXPIRE_MIN = int(os.getenv("JWT_EXPIRE_MIN", "10080"))  # 7 giorni default
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

class GoogleBody(BaseModel):
    id_token: str

def _verify_google_token(id_token: str):
    url = "https://oauth2.googleapis.com/tokeninfo?" + urllib.parse.urlencode({"id_token": id_token})
    try:
        with urllib.request.urlopen(url, timeout=8) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    aud = data.get("aud", "")
    if GOOGLE_CLIENT_ID and aud != GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Bad audience")

    email = data.get("email", "")
    sub = data.get("sub", "")
    if not email or not sub:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    return {
        "email": email,
        "user_id": user_id,
        "sub": sub,
        "name": data.get("name") or data.get("given_name") or "",
        "picture": data.get("picture") or "",
    }

def _create_user_token(email: str, sub: str, user_id: str = "") -> str:
    payload = {
        "sub": sub,
        "email": email,
        "user_id": user_id,
        "role": "user",
        "exp": datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MIN),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

@router.post("/google")
async def google_login(body: GoogleBody):
    user = _verify_google_token(body.id_token)
    db_user = upsert_user(user['email'], user['sub'], user.get('name',''), user.get('picture',''))
    token = _create_user_token(user['email'], user['sub'], user_id=str(db_user.get('id') or ''))
    return {"token": token, "user": user}
