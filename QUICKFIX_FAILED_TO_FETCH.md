# DinoMed – Fix "Failed to fetch" (Vercel + Onrender)

Se cliccando **Avvia una simulazione** vedi "Failed to fetch", quasi sempre è:
- backend Onrender **giù/in sleep** (prima richiesta lenta), oppure
- **CORS** (il browser blocca le chiamate cross-origin), oppure
- `VITE_API_BASE` non è stata applicata (manca **Redeploy**).

## Verifica backend (subito)
Apri nel browser:
- https://dinomed-api.onrender.com/docs
- https://dinomed-api.onrender.com/health

Se non si aprono → problema backend/deploy su Onrender.

## Fix consigliato (zero CORS): Vercel rewrites
Questo progetto include `vercel.json` che fa da proxy:
- `/api/*` → `https://dinomed-api.onrender.com/api/*`

Così il frontend può chiamare `/api/...` in same-origin e il CORS non serve.

### Cosa fare
1) Pusha questa repo su GitHub
2) Su Vercel fai **Redeploy**
3) (Opzionale) Puoi anche rimuovere `VITE_API_BASE` da Vercel: con i rewrites funzionerà lo stesso.

## Se vuoi tenere `VITE_API_BASE`
Assicurati che sia impostata su Vercel **e** che tu abbia fatto **Redeploy** dopo averla aggiunta/modificata.
