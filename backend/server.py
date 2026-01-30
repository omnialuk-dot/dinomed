from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from pathlib import Path
import os

# =========================
# Setup base
# =========================
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

app = FastAPI(
    title="DinoMed API",
    version="1.0.0",
)

# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Local dev
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    # Consenti i deploy Vercel (Preview + Production). Se usi un dominio custom, aggiungilo in allow_origins.
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# Import routers
# ATTENZIONE: i nomi DEVONO combaciare con i file in /routes
# =========================
from routes import files, dispense, admin

# Se esistono questi file, li includiamo (se no li saltiamo senza crash)
try:
    from routes import simulazioni
except Exception as e:
    simulazioni = None
    print("[WARN] routes/simulazioni.py non importabile:", e)

try:
    from routes import domande
except Exception as e:
    domande = None
    print("[WARN] routes/domande.py non importabile:", e)

try:
    from routes import sessioni
except Exception as e:
    sessioni = None
    print("[WARN] routes/sessioni.py non importabile:", e)

# =========================
# Register routers
# =========================
app.include_router(files.router)
app.include_router(dispense.router)
app.include_router(admin.router)

if simulazioni is not None:
    app.include_router(simulazioni.router)

if domande is not None:
    app.include_router(domande.router)

if sessioni is not None:
    app.include_router(sessioni.router)

# =========================
# Static files: uploads
# =========================
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# =========================
# Health check
# =========================
@app.get("/health")
def health():
    return {
        "ok": True,
        "env": os.getenv("ENV", "local"),
        "mongo": False,
    }