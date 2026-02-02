// ===============================
// DinoMed API helper (pulito e robusto)
// ===============================

const env = import.meta.env;

// Priorità: VITE_API_BASE (tuo standard) → VITE_API_URL → VITE_API_BASE_URL
const RAW_BASE = (env.VITE_API_BASE || env.VITE_API_URL || env.VITE_API_BASE_URL || "").trim();

export const API_BASE = (RAW_BASE ? RAW_BASE : (env.DEV ? "http://127.0.0.1:8000" : ""))
  .replace(/\/$/, "");

// Helper per link assoluti (es. /uploads/...)
export function absUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (!API_BASE) return path;
  return path.startsWith("/") ? `${API_BASE}${path}` : `${API_BASE}/${path}`;
}

// fetch JSON con errori consistenti
export async function apiFetch(path, opts = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  const res = await fetch(url, opts);
  const txt = await res.text().catch(() => "");
  let data = null;
  try { data = txt ? JSON.parse(txt) : null; } catch { data = null; }
  if (!res.ok) {
    const msg = data?.detail || data?.error || txt || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
