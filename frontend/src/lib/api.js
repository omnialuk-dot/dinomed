// ===============================
// DinoMed API helper (pulito e robusto)
// - compatibile con tutto il frontend esistente (admin + user)
// ===============================

const env = import.meta.env;

// Priorità: VITE_API_BASE (tuo standard) → VITE_API_URL → VITE_API_BASE_URL
const RAW_BASE = (env.VITE_API_BASE || env.VITE_API_URL || env.VITE_API_BASE_URL || "").trim();

export const API_BASE = (RAW_BASE ? RAW_BASE : (env.DEV ? "http://127.0.0.1:8000" : ""))
  .replace(/\/$/, "");

// ---------------- Token (ADMIN) ----------------
const ADMIN_TOKEN_KEY = "dinomed_admin_token";

export function getToken() {
  try { return localStorage.getItem(ADMIN_TOKEN_KEY) || ""; } catch { return ""; }
}
export function setToken(t) {
  try { localStorage.setItem(ADMIN_TOKEN_KEY, t || ""); } catch {}
}
export function clearToken() {
  try { localStorage.removeItem(ADMIN_TOKEN_KEY); } catch {}
}

function authHeaders(extra = {}) {
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
}

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

// ---------------- API object (compat) ----------------
async function json(path, { method = "GET", body, headers } = {}) {
  const h = { "Content-Type": "application/json", ...(headers || {}) };
  return apiFetch(path, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
}

export const api = {
  // admin auth
  login(email, password) {
    return json("/api/admin/login", { method: "POST", body: { email, password } });
  },
  me() {
    return apiFetch("/api/admin/me", { headers: authHeaders() });
  },

  // admin domande
  listDomandeAll() {
    return apiFetch("/api/admin/domande", { headers: authHeaders() });
  },
  createDomanda(payload) {
    return json("/api/admin/domande", { method: "POST", body: payload, headers: authHeaders() });
  },
  updateDomanda(id, payload) {
    return json(`/api/admin/domande/${id}`, { method: "PUT", body: payload, headers: authHeaders() });
  },
  deleteDomanda(id) {
    return apiFetch(`/api/admin/domande/${id}`, { method: "DELETE", headers: authHeaders() });
  },

  // admin dispense (note: alcune rotte sono su /api/admin/dispense)
  listDispenseAll() {
    return apiFetch("/api/dispense", { headers: authHeaders() });
  },
  createDispensa(payload) {
    return json("/api/dispense", { method: "POST", body: payload, headers: authHeaders() });
  },
  updateDispensa(id, payload) {
    return json(`/api/dispense/${id}`, { method: "PUT", body: payload, headers: authHeaders() });
  },
  deleteDispensa(id) {
    return apiFetch(`/api/dispense/${id}`, { method: "DELETE", headers: authHeaders() });
  },
  toggleDispensa(id, enabled) {
    return json(`/api/dispense/${id}`, { method: "PATCH", body: { enabled }, headers: authHeaders() });
  },

  // admin simulazioni preset
  listSimulazioniAll() {
    return apiFetch("/api/simulazioni", { headers: authHeaders() });
  },
  createSimulazione(payload) {
    return json("/api/simulazioni", { method: "POST", body: payload, headers: authHeaders() });
  },
  updateSimulazione(id, payload) {
    return json(`/api/simulazioni/${id}`, { method: "PUT", body: payload, headers: authHeaders() });
  },
  deleteSimulazione(id) {
    return apiFetch(`/api/simulazioni/${id}`, { method: "DELETE", headers: authHeaders() });
  },
  toggleSimulazione(id, enabled) {
    return json(`/api/simulazioni/${id}`, { method: "PATCH", body: { enabled }, headers: authHeaders() });
  },

  // reports
  listReports(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      qs.set(k, String(v));
    });
    const q = qs.toString();
    return apiFetch(`/api/admin/reports${q ? "?" + q : ""}`, { headers: authHeaders() });
  },
  updateReport(id, payload) {
    return json(`/api/admin/reports/${id}`, { method: "PATCH", body: payload, headers: authHeaders() });
  },
};

