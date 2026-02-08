# DinoMed – Fix "Failed to fetch" (Avvia simulazione)

Quando clicchi **Avvia prova** (o **Avvia una simulazione**) e compare **Failed to fetch**, significa che il browser non riesce a raggiungere il backend.

## Checklist (ordine consigliato)

### 1) Variabile ambiente su Vercel (fondamentale)
Imposta su Vercel (Project → Settings → Environment Variables):

- `VITE_API_BASE = https://dinomed-api.onrender.com`

Poi fai **Redeploy** (Vite legge le env in *build-time*).

> Deve essere **senza** `/api` e **senza** slash finale.

### 2) Il backend risponde?
Apri nel browser:

- `https://dinomed-api.onrender.com/health`
- `https://dinomed-api.onrender.com/docs`

Se non si aprono, il backend è giù/non deployato o in sleep (Onrender può metterci un po' a “svegliarsi”).

### 3) HTTPS / mixed-content
Se il frontend è in `https://` e il backend fosse impostato in `http://`, il browser blocca la richiesta.

✅ Usa sempre `https://...`.

### 4) CORS (se /docs funziona ma dal sito no)
Il backend deve permettere richieste dal dominio del frontend.

In questo repo FastAPI ha CORS aperto (`allow_origins=["*"]`), quindi di solito non è questo.

---

## Migliorie già incluse in questa zip
- Guard: se `VITE_API_BASE` manca, la pagina Config mostra un messaggio chiaro.
- Warm-up: ping a `/health` prima della POST (riduce errori quando Onrender è in sleep).
- Timeout + errore leggibile: messaggi più utili rispetto a “Failed to fetch”.
