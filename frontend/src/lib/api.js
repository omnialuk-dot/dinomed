// ===============================
// DinoMed API helper (pulito)
// ===============================

// Base URL (dev usa localhost; prod richiede VITE_API_BASE)
const RAW_BASE = import.meta.env.VITE_API_BASE?.trim();
export const API_BASE = (RAW_BASE ? RAW_BASE : (import.meta.env.DEV ? "http://127.0.0.1:8000" : ""))
  .replace(/\/$/, "");

// Helper per link assoluti (es. /uploads/...)
export function absUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (!API_BASE) return path; // fallback (evita crash in build); meglio settare VITE_API_BASE in prod
  return path.startsWith("/") ? `${API_BASE}${path}` : `${API_BASE}/${path}`;
}

// ===============================
// Token helpers
// ===============================
const TOKEN_KEY = "dm_admin_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ===============================
// Core request
// ===============================
async function request(path, options = {}) {
  const { method = "GET", body = null, auth = false } = options;

  const headers = { Accept: "application/json" };

  if (body !== null) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    if (!API_BASE) throw new Error('API_BASE non configurato: imposta VITE_API_BASE su Vercel');
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== null ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Backend non raggiungibile (failed to fetch)");
  }

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    let msg =
      (data && data.detail) ||
      (data && data.message) ||
      `Errore ${response.status}`;

    if (typeof msg !== "string") {
      try {
        msg = JSON.stringify(msg);
      } catch {
        msg = String(msg);
      }
    }
    throw new Error(msg);
  }

  return data;
}

// ===============================
// API pubblica
// ===============================
export const api = {
  // ---------- ADMIN AUTH ----------
  login(email, password) {
    return request("/api/admin/login", {
      method: "POST",
      body: { email, password },
    });
  },

  me() {
    return request("/api/admin/me", { auth: true });
  },

  // ---------- DISPENSE (ADMIN) ----------
  listDispenseAll() {
    return request("/api/dispense?include_unpublished=true", { auth: true });
  },

  createDispensa(payload) {
    return request("/api/dispense", { method: "POST", body: payload, auth: true });
  },

  updateDispensa(id, payload) {
    return request(`/api/dispense/${id}`, { method: "PUT", body: payload, auth: true });
  },

  toggleDispensa(id) {
    return request(`/api/dispense/${id}/toggle`, { method: "PATCH", auth: true });
  },

  deleteDispensa(id) {
    return request(`/api/dispense/${id}`, { method: "DELETE", auth: true });
  },

  // ---------- SIMULAZIONI (ADMIN) ----------
  listSimulazioniAll() {
    return request("/api/simulazioni?include_unpublished=true", { auth: true });
  },

  createSimulazione(payload) {
    return request("/api/simulazioni", { method: "POST", body: payload, auth: true });
  },

  updateSimulazione(id, payload) {
    return request(`/api/simulazioni/${id}`, { method: "PUT", body: payload, auth: true });
  },

  toggleSimulazione(id) {
    return request(`/api/simulazioni/${id}/toggle`, { method: "PATCH", auth: true });
  },

  deleteSimulazione(id) {
    return request(`/api/simulazioni/${id}`, { method: "DELETE", auth: true });
  },

  // ---------- DOMANDE (ADMIN) ----------
  listDomandeAll() {
    return request("/api/admin/domande", { auth: true });
  },

  createDomanda(payload) {
    return request("/api/admin/domande", { method: "POST", body: payload, auth: true });
  },

  updateDomanda(id, payload) {
    return request(`/api/admin/domande/${id}`, { method: "PUT", body: payload, auth: true });
  },

  deleteDomanda(id) {
    return request(`/api/admin/domande/${id}`, { method: "DELETE", auth: true });
  },
};