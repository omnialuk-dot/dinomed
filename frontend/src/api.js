// frontend/src/api.js

// Se hai un .env, Vite legge variabili che iniziano con VITE_
// Esempio: VITE_API_BASE_URL=https://dinomed-api.onrender.com
const ENV_BASE = import.meta?.env?.VITE_API_BASE_URL;

// fallback se .env non c’è
export const API_BASE_URL = (ENV_BASE || "https://dinomed-api.onrender.com").replace(/\/$/, "");

// helper fetch JSON con errori chiari
async function getJson(path) {
const url = `${API_BASE_URL}${path}`;
const res = await fetch(url, { method: "GET" });

if (!res.ok) {
const text = await res.text().catch(() => "");
throw new Error(`HTTP ${res.status} su ${url} ${text ? `- ${text}` : ""}`.trim());
}
return res.json();
}

// chiamata health
export function apiHealth() {
return getJson("/api/health");
}
