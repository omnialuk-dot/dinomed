import json, os, uuid, random
from datetime import datetime

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)
DOMANDE_FILE = os.path.join(DATA_DIR, "domande.json")

MATERIE = ["Chimica", "Fisica", "Biologia"]
TAG_POOL = {
    "Chimica": ["stechiometria", "acidi-basi", "equilibri", "redox", "gas", "soluzioni"],
    "Fisica": ["cinematica", "dinamica", "energia", "elettrostatica", "onde", "termodinamica"],
    "Biologia": ["cellula", "genetica", "enzimi", "metabolismo", "tessuti", "evoluzione"],
}

def mk_id():
    return str(uuid.uuid4())

def now():
    return datetime.utcnow().isoformat()

def make_mcq(i, materia):
    # Domande “placeholder” ma strutturate bene: 5 opzioni, 1 corretta
    tags = random.sample(TAG_POOL[materia], k=2)
    correct = random.randint(0, 4)
    opzioni = [f"Opzione {k+1}" for k in range(5)]
    return {
        "id": mk_id(),
        "materia": materia,
        "tipo": "scelta",
        "testo": f"[TEST] ({materia}) Domanda a crocette #{i}: sostituiscimi con una domanda vera.",
        "tag": tags,
        "difficolta": "Base",
        "spiegazione": (
            "Spiegazione (da completare): perché l'opzione corretta è quella scelta. "
            "Suggerimento: scrivi 2-4 righe chiare e pratiche."
        ),
        "opzioni": opzioni,
        "corretta_index": correct,
        "created_at": now(),
    }

def make_fill(i, materia):
    tags = random.sample(TAG_POOL[materia], k=2)
    answer = "RISPOSTA"
    return {
        "id": mk_id(),
        "materia": materia,
        "tipo": "completamento",
        "testo": f"[TEST] ({materia}) Completamento #{i}: sostituiscimi con una domanda vera. Risposta 1 parola.",
        "tag": tags,
        "difficolta": "Base",
        "spiegazione": (
            "Spiegazione (da completare): definisci il concetto e spiega perché la risposta è corretta."
        ),
        "risposte": [answer],
        "created_at": now(),
    }

def main():
    items = []

    # 100 crocette, distribuite tra le 3 materie
    for i in range(1, 101):
        materia = MATERIE[(i - 1) % 3]
        items.append(make_mcq(i, materia))

    # 100 completamenti, distribuiti tra le 3 materie
    for i in range(1, 101):
        materia = MATERIE[(i - 1) % 3]
        items.append(make_fill(i, materia))

    # salva
    with open(DOMANDE_FILE, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

    print(f"OK: salvate {len(items)} domande in {DOMANDE_FILE}")

if __name__ == "__main__":
    main()