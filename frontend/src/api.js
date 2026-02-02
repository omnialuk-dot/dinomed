// FILE: src/api.js
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL)?.replace(/\/$/, "") ||
  (import.meta.env.DEV ? "http://127.0.0.1:8000" : "");

export async function apiHealth() {
const url = `${API_BASE_URL}/api/health`;

const res = await fetch(url, {
method: "GET",
headers: { Accept: "application/json" },
});

if (!res.ok) {
const text = await res.text().catch(() => "");
throw new Error(`Health failed (${res.status}) ${text}`);
}

return res.json();
}

export async function getFilesList(type = "pdf") {
const url = `${API_BASE_URL}/api/files/list?file_type=${encodeURIComponent(type)}`;
const res = await fetch(url, { headers: { Accept: "application/json" } });

if (!res.ok) {
const text = await res.text().catch(() => "");
throw new Error(`Files list failed (${res.status}) ${text}`);
}

// ✅ il backend ritorna: { files: [...] }
return res.json();
}

// URL pubblico per aprire/scaricare file da /uploads
export function filePublicUrl(filename, type = "pdf") {
const folder = type === "image" ? "images" : "pdf";
return `${API_BASE_URL}/uploads/${folder}/${encodeURIComponent(filename)}`;
}
