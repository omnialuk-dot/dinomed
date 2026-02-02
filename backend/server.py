from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
import sys
import importlib

# =========================
# Setup base
# =========================
ROOT_DIR = Path(__file__).parent
# -------------------------------------------------
# Import robustness (Render / uvicorn can start from
# project root or from backend/). We force both the
# backend folder and the project root into PYTHONPATH
# so that imports like `routes.*` and `auth` work in
# every deployment configuration.
# -------------------------------------------------
try:
    sys.path.insert(0, str(ROOT_DIR))
    sys.path.insert(0, str(ROOT_DIR.parent))
except Exception:
    pass
load_dotenv(ROOT_DIR / ".env")

ENV = os.getenv("ENV", "local")
LOG_LEVEL = logging.DEBUG if ENV == "local" else logging.INFO
logging.basicConfig(level=LOG_LEVEL, format="%(levelname)s:%(name)s:%(message)s")
logger = logging.getLogger("dinomed")

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
# =========================

def _import_router(mod_name: str):
    """Importa un router dalla cartella routes/.

    In alcuni deploy (Render) il processo parte dal root del repo e i moduli
    vengono risolti diversamente: per evitare 404 silenziosi, importiamo in modo
    esplicito e logghiamo SEMPRE gli errori.
    """
    try:
        return importlib.import_module(f"routes.{mod_name}")
    except Exception as e:
        logger.error("Impossibile importare routes/%s.py: %s", mod_name, e)
        return None


files = _import_router("files")
dispense = _import_router("dispense")
admin = _import_router("admin")
simulazioni = _import_router("simulazioni")
domande = _import_router("domande")
sessioni = _import_router("sessioni")
auth_google = _import_router("auth_google")
user = _import_router("user")
reports = _import_router("reports")

# =========================
# Register routers
# =========================
if files is not None:
    app.include_router(files.router)
if dispense is not None:
    app.include_router(dispense.router)
if admin is not None:
    app.include_router(admin.router)

if simulazioni is not None:
    app.include_router(simulazioni.router)

if domande is not None:
    app.include_router(domande.router)

if sessioni is not None:
    app.include_router(sessioni.router)

if auth_google is not None:
    app.include_router(auth_google.router)
if user is not None:
    app.include_router(user.router)
if reports is not None:
    app.include_router(reports.router)

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