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