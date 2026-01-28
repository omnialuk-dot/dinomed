// frontend/src/api.js

const API_BASE_URL =
import.meta.env.VITE_API_URL || "https://dinomed-api.onrender.com";

// helper per fetch con gestione errori
async function request(path, options = {}) {
const url = `${API_BASE_URL}${path}`;

const res = await fetch(url, {
headers: {
"Content-Type": "application/json",
...(options.headers || {}),
},
...options,
});

// prova a leggere JSON se c'è
const text = await res.text();
let data = null;
try {
data = text ? JSON.parse(text) : null;
} catch {
data = text;
}

if (!res.ok) {
const msg =
(data && data.detail) ||
(typeof data === "string" && data) ||
`HTTP ${res.status}`;
throw new Error(msg);
}

return data;
}

// ---- ENDPOINTS BASE (quelli che mi hai mostrato nel backend) ----

// health check: GET /api/health
export function apiHealth() {
return request("/api/health");
}

// root: GET /api/
export function apiRoot() {
return request("/api/");
}

export { API_BASE_URL };
