import asyncio
import json
import os
import random
import secrets
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Tuple

from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart, Command
from aiogram.types import (
    Message,
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
)
from dotenv import load_dotenv

import aiohttp
import re


load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
ADMIN_CHAT_ID = os.getenv("ADMIN_CHAT_ID")

if not BOT_TOKEN:
    raise SystemExit("Missing BOT_TOKEN. Create a .env file (see .env.example).")
if not ADMIN_CHAT_ID:
    raise SystemExit("Missing ADMIN_CHAT_ID. Create a .env file (see .env.example).")

ADMIN_CHAT_ID_INT = int(ADMIN_CHAT_ID)

NOMAD_API_BASE = os.getenv("NOMAD_API_BASE", "").rstrip("/")
NOMAD_API_KEY = os.getenv("NOMAD_API_KEY", "")

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DOMANDE_PATH = os.path.join(DATA_DIR, "domande.json")
REPORTS_PATH = os.path.join(DATA_DIR, "reports.json")
USERS_PATH = os.path.join(DATA_DIR, "users.json")

ALL_SUBJECTS = ["Chimica", "Fisica", "Biologia"]

# -----------------------------
# Access token gate (admin generates, users redeem)
# -----------------------------
TOKEN_TTL_MINUTES = 20
CURRENT_TOKEN: Optional[str] = None
TOKEN_EXPIRES_AT: Optional[datetime] = None


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def token_valid() -> bool:
    return CURRENT_TOKEN is not None and TOKEN_EXPIRES_AT is not None and now_utc() < TOKEN_EXPIRES_AT


def rotate_token() -> str:
    global CURRENT_TOKEN, TOKEN_EXPIRES_AT
    CURRENT_TOKEN = secrets.token_urlsafe(10)
    TOKEN_EXPIRES_AT = now_utc() + timedelta(minutes=TOKEN_TTL_MINUTES)
    return CURRENT_TOKEN


def is_admin(user_id: int) -> bool:
    return user_id == ADMIN_CHAT_ID_INT


# -----------------------------
# Data helpers
# -----------------------------
def load_json(path: str, default):
    try:
        with open(path, "r", encoding="utf-8") as f:
            obj = json.load(f)
        return obj
    except FileNotFoundError:
        return default
    except Exception:
        return default


def save_json(path: str, obj) -> None:
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
    os.replace(tmp, path)


def append_report(entry: dict) -> None:
    arr = load_json(REPORTS_PATH, [])
    if not isinstance(arr, list):
        arr = []
    arr.append(entry)
    save_json(REPORTS_PATH, arr)


def load_users() -> List[dict]:
    arr = load_json(USERS_PATH, [])
    return arr if isinstance(arr, list) else []


def is_authorized(user_id: int) -> bool:
    if is_admin(user_id):
        return True
    users = load_users()
    for u in users:
        if u.get("user_id") == user_id and u.get("authorized") is True:
            return True
    return False


def set_authorized(user, authorized: bool = True) -> None:
    users = load_users()
    found = False
    for i, u in enumerate(users):
        if u.get("user_id") == user.id:
            users[i] = {
                **u,
                "user_id": user.id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "authorized": authorized,
                "authorized_at": now_utc().isoformat() if authorized else u.get("authorized_at"),
                "access_count": int(u.get("access_count") or 0) + (1 if authorized else 0),
                "last_seen": now_utc().isoformat(),
            }
            found = True
            break
    if not found:
        users.append({
            "user_id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "authorized": authorized,
            "authorized_at": now_utc().isoformat() if authorized else None,
            "access_count": 1 if authorized else 0,
            "last_seen": now_utc().isoformat(),
            "sim_completed": 0,
            "sim_correct": 0,
            "sim_total": 0,
        })
    save_json(USERS_PATH, users)


def update_user_stats(user_id: int, add_completed: int, add_correct: int, add_total: int):
    users = load_users()
    for i, u in enumerate(users):
        if u.get("user_id") == user_id:
            users[i] = {
                **u,
                "sim_completed": int(u.get("sim_completed") or 0) + add_completed,
                "sim_correct": int(u.get("sim_correct") or 0) + add_correct,
                "sim_total": int(u.get("sim_total") or 0) + add_total,
                "last_seen": now_utc().isoformat(),
            }
            save_json(USERS_PATH, users)
            return


def load_domande() -> List[dict]:
    """Fallback locale (dev). In produzione preferiamo l'API del sito."""
    try:
        with open(DOMANDE_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except FileNotFoundError:
        return []
    except Exception:
        return []


DOMANDE = load_domande()


# -----------------------------
# Nomad API helpers (materials, questions, profile)
# -----------------------------
def api_enabled() -> bool:
    return bool(NOMAD_API_BASE and NOMAD_API_KEY)

def _api_headers() -> dict:
    return {"Authorization": f"Bearer {NOMAD_API_KEY}"} if NOMAD_API_KEY else {}

async def api_get_json(path: str, params: dict | None = None) -> dict:
    url = f"{NOMAD_API_BASE}{path}"
    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=_api_headers(), params=params, timeout=20) as r:
            r.raise_for_status()
            return await r.json()

async def api_post_json(path: str, payload: dict) -> dict:
    url = f"{NOMAD_API_BASE}{path}"
    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=_api_headers(), json=payload, timeout=25) as r:
            r.raise_for_status()
            return await r.json()


# -----------------------------
# UI helpers (GroupHelp-like)
# -----------------------------
def main_menu_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="🧪 Simulazioni", callback_data="menu:sim"),
                InlineKeyboardButton(text="👤 Profilo", callback_data="menu:profile"),
            ],
            [
                InlineKeyboardButton(text="📚 Materiali", callback_data="menu:materials"),
                InlineKeyboardButton(text="✉️ Messaggio", callback_data="menu:contact"),
            ],
            [
                InlineKeyboardButton(text="ℹ️ Info", callback_data="menu:about"),
                InlineKeyboardButton(text="⚙️ Impostazioni", callback_data="menu:settings"),
            ],
        ]
    )


def home_text(name: str) -> str:
    return (
        "🦖 *DinoMed — Simulazioni & Preparazione*\n\n"
        f"Benvenuto, *{name}* 👋\n"
        "Allena teoria e pratica con simulazioni strutturate e traccia i tuoi progressi.\n\n"
        "📌 *Sezioni principali*\n"
        "• 🧪 *Simulazioni* — crea una prova su misura\n"
        "• 👤 *Profilo* — statistiche, badge, storico\n"
        "• 📚 *Materiali* — dispense e risorse\n"
        "• ✉️ *Messaggio* — scrivi al team\n\n"
        "👇 Scegli cosa vuoi fare:"
    )


def locked_text() -> str:
    return (
        "🔒 *Accesso protetto*\n\n"
        "Per usare DinoMed devi inserire una *chiave di accesso* valida.\n\n"
        "Scrivi:\n"
        "`/access IL_TOKEN`\n\n"
        "Se non hai il token, chiedilo all’admin."
    )


def sim_mode_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="⚡ Preset MUR (31×3)", callback_data="sim:mode:mur")],
            [InlineKeyboardButton(text="🛠️ Personalizzata", callback_data="sim:mode:custom")],
            [InlineKeyboardButton(text="⬅️ Menu", callback_data="menu:home")],
        ]
    )


def subjects_kb(selected: List[str]) -> InlineKeyboardMarkup:
    rows = []
    row = []
    for s in ALL_SUBJECTS:
        on = s in selected
        label = f"✅ {s}" if on else f"⬜️ {s}"
        row.append(InlineKeyboardButton(text=label, callback_data=f"sim:subj:{s}"))
        if len(row) == 2:
            rows.append(row)
            row = []
    if row:
        rows.append(row)
    rows.append([InlineKeyboardButton(text="Avanti ➡️", callback_data="sim:subj_done")])
    rows.append([InlineKeyboardButton(text="⬅️ Indietro", callback_data="sim:mode_back")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def count_kb() -> InlineKeyboardMarkup:
    choices = [10, 15, 20, 31]
    rows = [
        [InlineKeyboardButton(text=str(c), callback_data=f"sim:count:{c}") for c in choices[:2]],
        [InlineKeyboardButton(text=str(c), callback_data=f"sim:count:{c}") for c in choices[2:]],
        [InlineKeyboardButton(text="⬅️ Indietro", callback_data="sim:count_back")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=rows)


def sim_type_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="✅ Solo crocette (A–E)", callback_data="sim:type:mcq")],
            [InlineKeyboardButton(text="🧩 Mix (crocette + completamento)", callback_data="sim:type:mix")],
            [InlineKeyboardButton(text="⬅️ Indietro", callback_data="sim:type_back")],
        ]
    )


def question_kb(question_id: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="⏹ Termina", callback_data="sim:stop"),
                InlineKeyboardButton(text="🏠 Menu", callback_data="menu:home"),
            ],
            [InlineKeyboardButton(text="🚩 Segnala", callback_data=f"rep:{question_id}")],
        ]
    )


def after_sim_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🔁 Nuova simulazione", callback_data="menu:sim")],
            [InlineKeyboardButton(text="🏠 Menu", callback_data="menu:home")],
        ]
    )


@dataclass
class SimState:
    # navigation
    home_message_id: Optional[int] = None

    # flows
    awaiting_contact: bool = False
    awaiting_report_note_for: Optional[str] = None
    awaiting_email: bool = False

    # simulation config
    mode: str = "custom"  # mur|custom
    subjects: List[str] = field(default_factory=lambda: ["Chimica"])
    count_per_subject: int = 15
    sim_type: str = "mcq"  # mcq|mix

    # simulation runtime
    in_sim: bool = False
    questions: List[dict] = field(default_factory=list)
    idx: int = 0
    correct: int = 0
    answers: List[Tuple[str, str, int]] = field(default_factory=list)  # (qid, picked_letter, correct_idx)
    current_qid: Optional[str] = None


STATE: Dict[int, SimState] = {}


def get_state(user_id: int) -> SimState:
    if user_id not in STATE:
        STATE[user_id] = SimState()
    return STATE[user_id]


async def build_questions(subjects: List[str], count_per_subject: int, sim_type: str, seed: Optional[int] = None) -> List[dict]:
    """Ritorna domande (con soluzioni) ordinate per materia; random dentro materia."""
    if api_enabled():
        sections = []
        for s in subjects:
            if sim_type == "mcq":
                sections.append({"materia": s, "scelta": count_per_subject, "completamento": 0, "tag": []})
            else:
                # mix: pool doppio e poi shuffle+slice per mantenere totale
                sections.append({"materia": s, "scelta": count_per_subject, "completamento": count_per_subject, "tag": []})
        data = await api_post_json("/api/bot/questions/pick", {"sections": sections, "order": subjects, "seed": seed})
        items = data.get("items", [])
        if sim_type != "mcq":
            rng = random.Random(seed)
            rng.shuffle(items)
            items = items[: len(subjects) * count_per_subject]
        return items

    # fallback locale
    rng = random.Random(seed)
    out: List[dict] = []
    for s in subjects:
        pool = [q for q in DOMANDE if q.get("materia") == s and q.get("tipo") in (["scelta"] if sim_type == "mcq" else ["scelta", "completamento"])]
        rng.shuffle(pool)
        out.extend(pool[:count_per_subject])
    return out


async def build_mur_questions(sim_type: str, seed: Optional[int] = None) -> List[dict]:
    """Preset: 31 domande totali, pool ampio e poi taglio."""
    subjects = ["Chimica", "Fisica", "Biologia"]
    if api_enabled():
        sections = []
        for s in subjects:
            if sim_type == "mcq":
                sections.append({"materia": s, "scelta": 60, "completamento": 0, "tag": []})
            else:
                sections.append({"materia": s, "scelta": 60, "completamento": 60, "tag": []})
        data = await api_post_json("/api/bot/questions/pick", {"sections": sections, "order": subjects, "seed": seed})
        items = data.get("items", [])
        rng = random.Random(seed)
        rng.shuffle(items)
        return items[:31]

    rng = random.Random(seed)
    out: List[dict] = []
    for s in subjects:
        pool = [q for q in DOMANDE if q.get("materia") == s and q.get("tipo") in (["scelta"] if sim_type == "mcq" else ["scelta", "completamento"])]
        rng.shuffle(pool)
        out.extend(pool[:20])
    rng.shuffle(out)
    return out[:31]


def badge_for(sim_completed: int) -> Tuple[str, str, int]:
    # (emoji, name, next_target)
    if sim_completed >= 100:
        return ("🦖", "Primario Dino", 100)
    if sim_completed >= 50:
        return ("🧠", "Medico in corsia", 100)
    if sim_completed >= 10:
        return ("🧪", "Specializzando", 50)
    return ("🩺", "Intern", 10)


def profile_text(user) -> str:
    users = load_users()
    u = next((x for x in users if x.get("user_id") == user.id), {})
    sim_completed = int(u.get("sim_completed") or 0)
    sim_correct = int(u.get("sim_correct") or 0)
    sim_total = int(u.get("sim_total") or 0)
    acc = (sim_correct / sim_total * 100) if sim_total else 0.0
    emoji, role, next_target = badge_for(sim_completed)
    remaining = max(0, next_target - sim_completed) if sim_completed < next_target else 0

    return (
        f"👤 *Profilo di {user.first_name or 'Utente'}*\n\n"
        "📊 *Progressi*\n"
        f"• Simulazioni completate: *{sim_completed}*\n"
        f"• Accuratezza: *{acc:.1f}%*\n\n"
        "🏅 *Ruolo*\n"
        f"{emoji} *{role}*\n"
        + (f"Prossimo livello: tra *{remaining}* simulazioni\n" if remaining else "Sei al livello massimo attuale ✅\n")
        + "\n👇 Usa i bottoni qui sotto:"
    )


def profile_kb(has_email: bool) -> InlineKeyboardMarkup:
    rows = []
    if has_email:
        rows.append([InlineKeyboardButton(text="🔄 Aggiorna", callback_data="profile:refresh")])
        rows.append([InlineKeyboardButton(text="📧 Cambia email", callback_data="profile:link")])
    else:
        rows.append([InlineKeyboardButton(text="📧 Collega email", callback_data="profile:link")])
    rows.append([InlineKeyboardButton(text="🏠 Menu", callback_data="menu:home")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


async def build_profile_view(user) -> tuple[str, InlineKeyboardMarkup]:
    users = load_users()
    u = next((x for x in users if x.get("user_id") == user.id), {})
    email = (u.get("email") or "").strip()
    name = user.first_name or "Utente"

    # Se c'è email + API configurata, prendiamo i dati dal sito
    if email and api_enabled():
        try:
            prof = await api_get_json("/api/bot/user/profile", params={"email": email})
            total_runs = int(prof.get("total_runs") or 0)
            acc = float(prof.get("accuracy_pct") or 0.0)
            role = prof.get("role") or {}
            role_name = role.get("name") or "—"
            role_desc = role.get("desc") or ""
            to_next = int(role.get("to_next") or 0)
            next_min = role.get("next_min")

            text = (
                f"👤 *Profilo di {name}*\n\n"
                f"📧 Email collegata: `{email}`\n\n"
                "📊 *Progressi (dal sito)*\n"
                f"• Simulazioni completate: *{total_runs}*\n"
                f"• Accuratezza media: *{acc}%*\n\n"
                f"🏷️ *Ruolo:* *{role_name}*\n"
                f"_{role_desc}_\n"
            )
            if next_min is not None and to_next > 0:
                text += f"\n🎯 Prossimo livello tra *{to_next}* simulazioni."
            return text, profile_kb(True)
        except Exception:
            # fallback locale se API non raggiungibile
            pass

    # fallback locale (stats base)
    sim_completed = int(u.get("sim_completed") or 0)
    sim_correct = int(u.get("sim_correct") or 0)
    sim_total = int(u.get("sim_total") or 0)
    acc = (sim_correct / sim_total * 100) if sim_total else 0.0
    emoji, role, next_target = badge_for(sim_completed)
    remaining = max(0, next_target - sim_completed) if sim_completed < next_target else 0

    extra = f"\n📧 Email collegata: `{email}`" if email else "\n📧 Email non collegata."
    text = (
        f"👤 *Profilo di {name}*\n"
        f"{extra}\n\n"
        "📊 *Progressi (bot)*\n"
        f"• Simulazioni completate: *{sim_completed}*\n"
        f"• Accuratezza: *{acc:.1f}%*\n\n"
        f"{emoji} *Ruolo:* *{role}*\n"
    )
    if remaining > 0:
        text += f"🎯 Prossimo livello tra *{remaining}* simulazioni."
    return text, profile_kb(bool(email))


def materials_list_kb(items: List[dict], page: int, has_next: bool) -> InlineKeyboardMarkup:
    rows = []
    for it in items:
        title = (it.get("title") or "Dispensa").strip()
        # Telegram callback data max 64 bytes: keep id short
        mid = str(it.get("id") or "")[:40]
        rows.append([InlineKeyboardButton(text=f"📄 {title}", callback_data=f"mat:open:{mid}")])

    nav = []
    if page > 1:
        nav.append(InlineKeyboardButton(text="⬅️ Indietro", callback_data=f"mat:page:{page-1}"))
    if has_next:
        nav.append(InlineKeyboardButton(text="➡️ Avanti", callback_data=f"mat:page:{page+1}"))
    if nav:
        rows.append(nav)
    rows.append([InlineKeyboardButton(text="🏠 Menu", callback_data="menu:home")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def materials_intro_text() -> str:
    return "📚 *Materiali*\nSeleziona una dispensa per aprire il download."
def materials_text() -> str:
    return (
        "📚 *Materiali*\n\n"
        "Qui troverai dispense e risorse utili.\n"
        "Per ora questa sezione è in allestimento.\n\n"
        "Se vuoi caricare materiali, contatta il team dalla sezione ✉️ *Messaggio*."
    )


def simple_back_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="⬅️ Menu", callback_data="menu:home")]])


def settings_text() -> str:
    return (
        "⚙️ *Impostazioni*\n\n"
        "Questa sezione servirà per:\n"
        "• preferenze simulazioni\n"
        "• notifiche\n"
        "• lingua\n\n"
        "In arrivo a breve."
    )


def about_text() -> str:
    return (
        "ℹ️ *Info*\n\n"
        "*DinoMed* è un bot per allenarti con simulazioni strutturate e monitorare i progressi.\n"
        "Obiettivo: rendere la preparazione più semplice, veloce e misurabile.\n\n"
        "Hai feedback o vuoi segnalare un errore? Usa 🚩 *Segnala* durante le domande oppure ✉️ *Messaggio*."
    )


def format_question(q: dict, idx: int, total: int) -> str:
    materia = q.get("materia", "")
    testo = (q.get("testo") or "").strip()
    qtype = q.get("tipo")

    header = f"🧪 *{materia}* — Q{idx+1}/{total}\n\n"

    if qtype == "scelta":
        opts = q.get("opzioni") or []
        letters = ["A", "B", "C", "D", "E"]
        lines = [header + testo + "\n"]
        for i, o in enumerate(opts[:5]):
            lab = letters[i]
            lines.append(f"{lab}) {o}")
        lines.append("\n✍️ Rispondi scrivendo solo: *A, B, C, D o E*")
        return "\n".join(lines)

    # completamento (mix)
    return (
        f"{header}{testo}\n\n"
        "✍️ Rispondi scrivendo la tua risposta (testo libero).\n"
        "_Nota:_ le risposte di completamento potrebbero non essere valutate automaticamente."
    )


async def show_home(bot: Bot, chat_id: int, user_id: int, name: str, message_to_edit: Optional[Message] = None):
    st = get_state(user_id)
    text = home_text(name)
    kb = main_menu_kb()

    if message_to_edit is not None:
        try:
            await message_to_edit.edit_text(text, parse_mode="Markdown", reply_markup=kb)
            st.home_message_id = message_to_edit.message_id
            return
        except Exception:
            pass

    sent = await bot.send_message(chat_id, text, parse_mode="Markdown", reply_markup=kb)
    st.home_message_id = sent.message_id


async def send_next_question(bot: Bot, chat_id: int, user_id: int) -> None:
    st = get_state(user_id)
    if not st.in_sim:
        return

    if st.idx >= len(st.questions):
        total = len(st.questions)
        score = st.correct
        perc = (score / total * 100) if total else 0.0

        update_user_stats(user_id, add_completed=1, add_correct=score, add_total=total)

        msg = (
            "✅ *Simulazione terminata!*\n\n"
            f"Risposte corrette: *{score}* / *{total}*\n"
            f"Percentuale: *{perc:.1f}%*\n\n"
            "Vuoi fare un’altra simulazione?"
        )
        st.in_sim = False
        await bot.send_message(chat_id, msg, parse_mode="Markdown", reply_markup=after_sim_kb())
        return

    q = st.questions[st.idx]
    st.current_qid = q.get("id")
    text = format_question(q, st.idx, len(st.questions))
    await bot.send_message(chat_id, text, parse_mode="Markdown", reply_markup=question_kb(st.current_qid))


async def token_rotator_loop():
    while True:
        rotate_token()
        await asyncio.sleep(TOKEN_TTL_MINUTES * 60)


async def main():
    bot = Bot(BOT_TOKEN)
    dp = Dispatcher()

    # start token rotator in background
    asyncio.create_task(token_rotator_loop())

    # ------------- Commands -------------
    @dp.message(CommandStart())
    async def start_cmd(message: Message):
        st = get_state(message.from_user.id)
        st.awaiting_contact = False
        st.awaiting_report_note_for = None

        if not is_authorized(message.from_user.id):
            await message.answer(locked_text(), parse_mode="Markdown")
            return

        set_authorized(message.from_user, True)  # refresh user info/last_seen
        await show_home(bot, message.chat.id, message.from_user.id, message.from_user.first_name or "Utente")

    @dp.message(Command("menu"))
    async def menu_cmd(message: Message):
        if not is_authorized(message.from_user.id):
            await message.answer(locked_text(), parse_mode="Markdown")
            return
        await show_home(bot, message.chat.id, message.from_user.id, message.from_user.first_name or "Utente")

    @dp.message(Command("token"))
    async def token_cmd(message: Message):
        if not is_admin(message.from_user.id):
            await message.answer("⛔ Questo comando è riservato all’admin.")
            return
        t = rotate_token()
        exp_local = TOKEN_EXPIRES_AT.astimezone(timezone.utc).strftime("%H:%M UTC") if TOKEN_EXPIRES_AT else ""
        await message.answer(
            "🔑 *Token di accesso*\n\n"
            f"`{t}`\n\n"
            f"⏳ Valido per *{TOKEN_TTL_MINUTES} minuti* (scade alle *{exp_local}*).\n"
            "Gli utenti devono scrivere:\n"
            f"`/access {t}`",
            parse_mode="Markdown",
        )

    @dp.message(Command("access"))
    async def access_cmd(message: Message):
        parts = (message.text or "").strip().split(maxsplit=1)
        if len(parts) < 2:
            await message.answer("Uso corretto: `/access IL_TOKEN`", parse_mode="Markdown")
            return
        provided = parts[1].strip()

        if not token_valid():
            await message.answer("⛔ Token scaduto o non disponibile. Chiedine uno nuovo all’admin.")
            return
        if provided != CURRENT_TOKEN:
            await message.answer("⛔ Token non valido.")
            return

        set_authorized(message.from_user, True)
        await message.answer("✅ Accesso confermato! Ora puoi usare il bot. Scrivi /start")

        await bot.send_message(
            ADMIN_CHAT_ID_INT,
            "✅ *Nuovo utente autorizzato*\n"
            f"ID: `{message.from_user.id}`\n"
            f"Username: @{message.from_user.username}\n"
            f"Nome: {(message.from_user.first_name or '').strip()} {(message.from_user.last_name or '').strip()}",
            parse_mode="Markdown",
        )

    # ------------- Menu navigation (edit same message) -------------
    async def edit_or_send(q: CallbackQuery, text: str, kb: InlineKeyboardMarkup):
        try:
            await q.message.edit_text(text, parse_mode="Markdown", reply_markup=kb)
        except Exception:
            await q.message.answer(text, parse_mode="Markdown", reply_markup=kb)

    @dp.callback_query(F.data == "menu:home")
    async def menu_home(q: CallbackQuery):
        await q.answer()
        if not is_authorized(q.from_user.id):
            await edit_or_send(q, locked_text(), InlineKeyboardMarkup(inline_keyboard=[]))
            return
        set_authorized(q.from_user, True)
        await edit_or_send(q, home_text(q.from_user.first_name or "Utente"), main_menu_kb())

    @dp.callback_query(F.data == "menu:sim")
    async def menu_sim(q: CallbackQuery):
        await q.answer()
        if not is_authorized(q.from_user.id):
            await edit_or_send(q, locked_text(), InlineKeyboardMarkup(inline_keyboard=[]))
            return
        st = get_state(q.from_user.id)
        st.in_sim = False
        st.awaiting_contact = False
        st.awaiting_report_note_for = None
        await edit_or_send(
            q,
            "🧪 *Simulazioni*\n\nScegli come vuoi allenarti:",
            sim_mode_kb(),
        )

    @dp.callback_query(F.data == "menu:profile")
    async def menu_profile(q: CallbackQuery):
        await q.answer()
        if not is_authorized(q.from_user.id):
            await edit_or_send(q, locked_text(), InlineKeyboardMarkup(inline_keyboard=[]))
            return
        text, kb = await build_profile_view(q.from_user)
        await edit_or_send(q, text, kb)

    @dp.callback_query(F.data == "menu:materials")
    async def menu_materials(q: CallbackQuery):
        await q.answer()
        if not is_authorized(q.from_user.id):
            await edit_or_send(q, locked_text(), InlineKeyboardMarkup(inline_keyboard=[]))
            return
        if not api_enabled():
            await edit_or_send(q, "📚 *Materiali*\n\n⚠️ API non configurata. Imposta NOMAD_API_BASE e NOMAD_API_KEY.", simple_back_kb())
            return
        data = await api_get_json("/api/bot/materials", params={"page": 1, "limit": 10})
        await edit_or_send(q, materials_intro_text(), materials_list_kb(data.get("items", []), int(data.get("page", 1)), bool(data.get("has_next", False))))

    @dp.callback_query(F.data == "menu:settings")
    async def menu_settings(q: CallbackQuery):
        await q.answer()
        if not is_authorized(q.from_user.id):
            await edit_or_send(q, locked_text(), InlineKeyboardMarkup(inline_keyboard=[]))
            return
        await edit_or_send(q, settings_text(), simple_back_kb())

    @dp.callback_query(F.data == "menu:about")
    async def menu_about(q: CallbackQuery):
        await q.answer()
        if not is_authorized(q.from_user.id):
            await edit_or_send(q, locked_text(), InlineKeyboardMarkup(inline_keyboard=[]))
            return
        await edit_or_send(q, about_text(), simple_back_kb())

    @dp.callback_query(F.data == "menu:contact")
    async def menu_contact(q: CallbackQuery):
        await q.answer()
        if not is_authorized(q.from_user.id):
            await edit_or_send(q, locked_text(), InlineKeyboardMarkup(inline_keyboard=[]))
            return
        st = get_state(q.from_user.id)
        st.awaiting_contact = True
        await edit_or_send(
            q,
            "✉️ *Messaggio al team*\n\n"
            "Scrivi qui sotto e lo inoltrerò al founder.\n"
            "_Suggerimento:_ problema + contesto + cosa ti aspettavi.\n\n"
            "Per annullare: /menu",
            InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="⬅️ Menu", callback_data="menu:home")]]),
        )

    # ------------- Simulation wizard -------------
    @dp.callback_query(F.data == "sim:mode_back")
    async def sim_mode_back(q: CallbackQuery):
        await q.answer()
        await edit_or_send(q, "🧪 *Simulazioni*\n\nScegli come vuoi allenarti:", sim_mode_kb())

    @dp.callback_query(F.data == "sim:mode:mur")
    async def sim_mode_mur(q: CallbackQuery):
        await q.answer()
        st = get_state(q.from_user.id)
        st.mode = "mur"
        st.subjects = ["Chimica", "Fisica", "Biologia"]
        st.count_per_subject = 31
        await edit_or_send(
            q,
            "🎛 *Modalità*\n\nCome vuoi rispondere?",
            sim_type_kb(),
        )

    @dp.callback_query(F.data == "sim:mode:custom")
    async def sim_mode_custom(q: CallbackQuery):
        await q.answer()
        st = get_state(q.from_user.id)
        st.mode = "custom"
        st.subjects = ["Chimica"]
        await edit_or_send(
            q,
            "📚 *Seleziona materie*\n\nPuoi scegliere più materie, poi premi *Avanti*.",
            subjects_kb(st.subjects),
        )

    @dp.callback_query(F.data.startswith("sim:subj:"))
    async def sim_toggle_subject(q: CallbackQuery):
        subj = q.data.split(":", 2)[2]
        st = get_state(q.from_user.id)
        if subj in st.subjects:
            if len(st.subjects) > 1:
                st.subjects.remove(subj)
        else:
            st.subjects.append(subj)
        await q.answer()
        await q.message.edit_reply_markup(reply_markup=subjects_kb(st.subjects))

    @dp.callback_query(F.data == "sim:subj_done")
    async def sim_subjects_done(q: CallbackQuery):
        await q.answer()
        st = get_state(q.from_user.id)
        st.subjects = [s for s in ALL_SUBJECTS if s in st.subjects]
        await edit_or_send(
            q,
            "🔢 *Numero domande*\n\nQuante domande vuoi per *ogni* materia scelta?",
            count_kb(),
        )

    @dp.callback_query(F.data == "sim:count_back")
    async def sim_count_back(q: CallbackQuery):
        await q.answer()
        st = get_state(q.from_user.id)
        await edit_or_send(
            q,
            "📚 *Seleziona materie*\n\nPuoi scegliere più materie, poi premi *Avanti*.",
            subjects_kb(st.subjects),
        )

    @dp.callback_query(F.data.startswith("sim:count:"))
    async def sim_count_pick(q: CallbackQuery):
        await q.answer()
        st = get_state(q.from_user.id)
        st.count_per_subject = int(q.data.split(":")[2])
        await edit_or_send(
            q,
            "🎛 *Modalità*\n\nCome vuoi rispondere?",
            sim_type_kb(),
        )

    @dp.callback_query(F.data == "sim:type_back")
    async def sim_type_back(q: CallbackQuery):
        await q.answer()
        st = get_state(q.from_user.id)
        # back to count step
        await edit_or_send(
            q,
            "🔢 *Numero domande*\n\nQuante domande vuoi per *ogni* materia scelta?",
            count_kb(),
        )

    async def start_simulation(q: CallbackQuery):
        st = get_state(q.from_user.id)
        st.idx = 0
        st.correct = 0
        st.answers = []
        st.in_sim = True

        seed = q.from_user.id
        if st.mode == "mur":
            st.questions = await build_mur_questions(st.sim_type, seed=seed)
        else:
            st.questions = await build_questions(st.subjects, st.count_per_subject, st.sim_type, seed=seed)

        # close wizard screen nicely
        await edit_or_send(
            q,
            "✅ *Simulazione pronta!*\n\n"
            f"Materie: *{', '.join(st.subjects)}*\n"
            f"Domande per materia: *{st.count_per_subject}*\n"
            f"Modalità: *{'Solo crocette' if st.sim_type == 'mcq' else 'Mix'}*\n\n"
            "Sto per iniziare…",
            InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="🏠 Menu", callback_data="menu:home")]]),
        )
        await send_next_question(q.bot, q.message.chat.id, q.from_user.id)

    @dp.callback_query(F.data == "sim:type:mcq")
    async def sim_type_mcq(q: CallbackQuery):
        await q.answer()
        st = get_state(q.from_user.id)
        st.sim_type = "mcq"
        await start_simulation(q)

    @dp.callback_query(F.data == "sim:type:mix")
    async def sim_type_mix(q: CallbackQuery):
        await q.answer()
        st = get_state(q.from_user.id)
        st.sim_type = "mix"
        await start_simulation(q)

    @dp.callback_query(F.data == "sim:stop")
    async def sim_stop(q: CallbackQuery):
        await q.answer("Simulazione terminata.")
        st = get_state(q.from_user.id)
        if not st.in_sim:
            return
        st.in_sim = False
        await q.message.answer("⏹ *Prova terminata in anticipo.*\n\nVuoi fare un’altra simulazione?", parse_mode="Markdown", reply_markup=after_sim_kb())

    # ------------- Reports -------------
    @dp.callback_query(F.data.startswith("rep:"))
    async def report_start(q: CallbackQuery):
        await q.answer()
        qid = q.data.split(":", 1)[1]
        st = get_state(q.from_user.id)
        st.awaiting_report_note_for = qid
        await q.message.answer(
            "🚩 *Segnalazione*\n"
            "Scrivi cosa c'è che non va (opzionale).\n"
            "Se vuoi inviare senza nota, scrivi /skip.",
            parse_mode="Markdown",
        )

    @dp.message(Command("skip"))
    async def report_skip(message: Message):
        st = get_state(message.from_user.id)
        if not st.awaiting_report_note_for:
            return
        qid = st.awaiting_report_note_for
        st.awaiting_report_note_for = None

        entry = {
            "ts": message.date.isoformat(),
            "user_id": message.from_user.id,
            "username": message.from_user.username,
            "question_id": qid,
            "note": "",
        }
        append_report(entry)
        await message.answer("✅ Segnalazione inviata. Grazie!")
        await bot.send_message(
            ADMIN_CHAT_ID_INT,
            f"🚩 *Nuova segnalazione*\nUser: `{entry['user_id']}` (@{entry.get('username')})\nQID: `{qid}`\nNota: _(vuota)_",
            parse_mode="Markdown",
        )

    # ------------- Main text handler (answers + flows) -------------
    @dp.message()
    async def text_router(message: Message):
        st = get_state(message.from_user.id)

        # gate
        if not is_authorized(message.from_user.id):
            await message.answer(locked_text(), parse_mode="Markdown")
            return

        # report note flow
        if st.awaiting_report_note_for:
            qid = st.awaiting_report_note_for
            st.awaiting_report_note_for = None
            note = (message.text or "").strip()

            entry = {
                "ts": message.date.isoformat(),
                "user_id": message.from_user.id,
                "username": message.from_user.username,
                "question_id": qid,
                "note": note,
            }
            append_report(entry)
            await message.answer("✅ Segnalazione inviata. Grazie!")
            await bot.send_message(
                ADMIN_CHAT_ID_INT,
                f"🚩 *Nuova segnalazione*\nUser: `{entry['user_id']}` (@{entry.get('username')})\nQID: `{qid}`\nNota:\n{note or '_vuota_'}",
                parse_mode="Markdown",
            )
            return

        # contact flow
        if getattr(st, "awaiting_email", False):
            st.awaiting_email = False
            email_raw = (message.text or "").strip()
            # basic email check
            if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email_raw, flags=re.IGNORECASE):
                await message.answer("❌ Email non valida. Riprova (es: nome@gmail.com) oppure /start per tornare al menu.")
                return

            email = email_raw.strip().lower()
            # save on users.json
            users = load_users()
            found = False
            for j, u in enumerate(users):
                if u.get("user_id") == message.from_user.id:
                    users[j] = {**u, "email": email}
                    found = True
                    break
            if not found:
                users.append({"user_id": message.from_user.id, "authorized": True, "email": email})
            save_json(USERS_PATH, users)

            await message.answer("✅ Email collegata! Sto aggiornando il profilo…")
            text, kb = await build_profile_view(message.from_user)
            await message.answer(text, reply_markup=kb, parse_mode="Markdown")
            return

        if st.awaiting_contact:
            txt = (message.text or "").strip()
            if not txt:
                await message.answer("Mandami un messaggio di testo 🙂")
                return
            st.awaiting_contact = False
            await message.answer("✅ Messaggio inviato al team. Grazie!")
            await bot.send_message(
                ADMIN_CHAT_ID_INT,
                f"✉️ *Messaggio Contatti*\nUser: `{message.from_user.id}` (@{message.from_user.username})\n\n{txt}",
                parse_mode="Markdown",
            )
            return

        # simulation answer flow
        if st.in_sim and st.idx < len(st.questions):
            q = st.questions[st.idx]
            qtype = q.get("tipo")
            txt = (message.text or "").strip()

            if qtype == "scelta":
                letter = txt.upper()
                if letter not in ["A", "B", "C", "D", "E"]:
                    await message.answer("✍️ Rispondi solo con *A, B, C, D o E*.", parse_mode="Markdown")
                    return

                picked_idx = ["A", "B", "C", "D", "E"].index(letter)
                correct_idx = int(q.get("corretta_index", -1))
                is_ok = picked_idx == correct_idx
                if is_ok:
                    st.correct += 1

                st.answers.append((q.get("id"), letter, correct_idx))

                correct_letter = ["A", "B", "C", "D", "E"][correct_idx] if 0 <= correct_idx < 5 else "?"
                expl = (q.get("spiegazione") or "").strip()

                if is_ok:
                    msg = "✅ *Corretto*\n"
                else:
                    msg = f"❌ *Sbagliato* — corretta: *{correct_letter}*\n"

                if expl:
                    msg += f"\nMotivo: {expl}"

                await message.answer(msg, parse_mode="Markdown")
                st.idx += 1
                await send_next_question(message.bot, message.chat.id, message.from_user.id)
                return

            # completamento
            # register but may not auto-grade
            await message.answer("📝 Risposta registrata.", parse_mode="Markdown")
            st.idx += 1
            await send_next_question(message.bot, message.chat.id, message.from_user.id)
            return

        # default
        await message.answer("Scrivi /start per aprire il menu.")


    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())