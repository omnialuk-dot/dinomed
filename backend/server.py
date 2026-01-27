from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path

# Import routes (per ora SOLO files, così Render parte anche senza Mongo)
from routes import files

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB DISATTIVATO (per far partire Render senza DB)
client = None
db = None

# Create the main app
app = FastAPI()

# Health check (per test veloce)
@app.get("/api/health")
async def health():
    return {"ok": True}

# Create uploads directory (DENTRO backend/, non /app)
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
(UPLOAD_DIR / "pdf").mkdir(parents=True, exist_ok=True)
(UPLOAD_DIR / "images").mkdir(parents=True, exist_ok=True)

# Serve static files
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

@api_router.get("/")
async def root():
    return {"message": "DinoMed API", "status": "operational"}

# Include routers
app.include_router(files.router)
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Make db available globally (None per ora)
app.state.db = db

@app.on_event("shutdown")
async def shutdown_db_client():
    # se in futuro riattivi Mongo, qui chiudi la connessione
    if client:
        client.close()
