// frontend/src/api.js

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://dinomed-api.onrender.com";

// controllo rapido backend
export async function healthCheck() {
const res = await fetch(`${API_BASE_URL}/api/health`);
if (!res.ok) {
throw new Error("Backend non raggiungibile");
}
return res.json();
}

// esempio: lista file (adatta il path se serve)
export async function getFiles() {
const res = await fetch(`${API_BASE_URL}/api/files`);
if (!res.ok) {
throw new Error("Errore nel recupero file");
}
return res.json();
}

// esempio upload file
export async function uploadFile(file) {
const formData = new FormData();
formData.append("file", file);

const res = await fetch(`${API_BASE_URL}/api/files/upload`, {
method: "POST",
body: formData,
});

if (!res.ok) {
throw new Error("Errore upload file");
}

return res.json();
}
