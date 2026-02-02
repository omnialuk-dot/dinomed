# Telegram Simulazioni Bot (starter)

Bot Telegram per simulazioni a quiz (Chimica / Fisica / Biologia) basato sul dataset `data/domande.json`.

## Funzionalità
- `/start` con menu: **Avvia simulazione**, **Chi siamo**, **Contattaci**
- Simulazione con domande a scelta multipla (A–E) e risultati finali
- **🚩 Segnala** su ogni domanda (con nota opzionale)
- Messaggi "Contattaci" inoltrati all'admin (fondatore) configurato in `.env`

## Setup rapido (locale)
1) Crea e configura il bot con **@BotFather**, prendi il token.
2) Copia `.env.example` in `.env` e compila:
   - `BOT_TOKEN`
   - `ADMIN_CHAT_ID` (il tuo chat_id). Per trovarlo: scrivi al bot e guarda i log, oppure usa @userinfobot.
3) Installa dipendenze:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```
4) Avvia:
   ```bash
   python bot.py
   ```

## Deploy (consigliato)
- Render / Railway / Fly.io / VPS: avvia il processo `python bot.py`
- Ricorda di impostare variabili d'ambiente `BOT_TOKEN` e `ADMIN_CHAT_ID`

## Note dataset
`data/domande.json` è una lista di oggetti:
- `id`, `materia`, `tipo`, `testo`, `opzioni`, `corretta_index`, `spiegazione`, `tags`/`tag`
