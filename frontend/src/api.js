// frontend/src/api.js
const API_BASE_URL =
import.meta.env.VITE_API_URL || "https://dinomed-api.onrender.com";

export async function apiHealth() {
const res = await fetch(`${API_BASE_URL}/api/health`);
if (!res.ok) throw new Error("API non raggiungibile");
return res.json();
}
