// ===============================
// DinoMed API helper (pulito)
// ===============================

// URL backend
// In locale: frontend/.env -> VITE_API_BASE=http://127.0.0.1:8000
// In prod (Vercel): setti la stessa variabile nelle env di Vercel
const API_BASE =
  import.meta.env.VITE_API_BASE?.trim() || "http://127.0.0.1:8000";

// Debug: serve ORA per capire se l'env viene letto
console.log("[DinoMed] API_BASE =", API_BASE);

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
  const {
    method = "GET",
    body = null,
    auth = false,
  } = options;

  const headers = {
    "Accept": "application/json",
  };

  if (body !== null) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== null ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    // ERRORE DI RETE (backend giù, URL sbagliato, CORS, ecc.)
    throw new Error("Backend non raggiungibile (failed to fetch)");
  }

  let data = null;
  const text = await response.text();

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
    return request("/api/dispense?include_unpublished=true", {
      auth: true,
    });
  },

  createDispensa(payload) {
    return request("/api/dispense", {
      method: "POST",
      body: payload,
      auth: true,
    });
  },

  updateDispensa(id, payload) {
    return request(`/api/dispense/${id}`, {
      method: "PUT",
      body: payload,
      auth: true,
    });
  },

  toggleDispensa(id) {
    return request(`/api/dispense/${id}/toggle`, {
      method: "PATCH",
      auth: true,
    });
  },

  deleteDispensa(id) {
    return request(`/api/dispense/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
};