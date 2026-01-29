from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
import os
import jwt
from datetime import datetime, timedelta
import bcrypt

router = APIRouter(prefix="/api/admin", tags=["admin"])

JWT_SECRET = os.getenv("JWT_SECRET", "CHANGE_ME_SUPER_SECRET")
JWT_EXPIRE_MIN = int(os.getenv("JWT_EXPIRE_MIN", "10080"))  # 7 giorni default

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@dinomed.local")
ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH", "")

class LoginBody(BaseModel):
    email: str
    password: str

def create_token(email: str) -> str:
    payload = {
        "sub": email,
        "role": "admin",
        "exp": datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MIN),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def verify_password(password: str, password_hash: str) -> bool:
    if not password_hash:
        return False
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except Exception:
        return False

def admin_required(request: Request):
    auth = request.headers.get("authorization", "")
    if not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = auth.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Not admin")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/login")
async def login(body: LoginBody):
    if body.email != ADMIN_EMAIL or not verify_password(body.password, ADMIN_PASSWORD_HASH):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"token": create_token(body.email)}

@router.get("/me")
async def me(payload=Depends(admin_required)):
    return {"ok": True, "email": payload.get("sub"), "role": payload.get("role")}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="DinoMed API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://dinomed.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routes import files, dispense, simulazioni, admin

app.include_router(files.router)
app.include_router(dispense.router)
app.include_router(simulazioni.router)
app.include_router(admin.router)

@app.get("/health")
def health():
    return {"ok": True, "mongo": False, "env": os.getenv("ENV", "local")}