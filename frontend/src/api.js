// frontend/src/api.js

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "https://dinomed-api.onrender.com"; // fallback sicuro

export async function apiHealth() {
  const url = `${API_BASE_URL}/api/health`;

  const res = await fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Health failed (${res.status}) ${text}`);
  }

  return res.json();
}
