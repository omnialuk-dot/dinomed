import json
import os
from supabase import create_client
from pathlib import Path
from dotenv import load_dotenv
load_dotenv()
print("URL:", os.getenv("SUPABASE_URL"))
print("KEY:", os.getenv("SUPABASE_KEY"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

assert SUPABASE_URL and SUPABASE_KEY, "Supabase env mancanti"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

DOMANDE_PATH = Path(__file__).resolve().parents[1] / "data" / "domande.json"

with open(DOMANDE_PATH, "r", encoding="utf-8") as f:
    domande = json.load(f)

print(f"Domande trovate: {len(domande)}")

for d in domande:
    opzioni = [d.get(k) for k in ["A", "B", "C", "D", "E"] if d.get(k)]

    payload = {
        "materia": d.get("materia"),
        "tipo": d.get("tipo"),
        "testo": d.get("domanda") or d.get("testo") or "",
        "opzioni": opzioni,
        "corretta_index": d.get("corretta_index"),
        "risposte": d.get("risposte", []),
        "spiegazione": d.get("spiegazione", ""),
        "tag": d.get("tag", []),
        "difficolta": d.get("difficolta"),
        "created_at": d.get("created_at"),
    }

    supabase.table("questions").insert(payload).execute()

print("✅ Import completato con successo")