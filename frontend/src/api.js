const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function healthCheck() {
const res = await fetch(`${BASE_URL}/api/health`);
if (!res.ok) {
const text = await res.text();
throw new Error(`Health check failed: ${res.status} ${text}`);
}
return res.json();
}



import { useEffect, useState } from "react";
import { healthCheck } from "./api";

export default function App() {
const [data, setData] = useState(null);
const [err, setErr] = useState("");

useEffect(() => {
healthCheck()
.then(setData)
.catch((e) => setErr(e.message));
}, []);

return (
<div style={{ fontFamily: "sans-serif", padding: 20 }}>
<h1>DinoMed Frontend</h1>

{err && <p style={{ color: "red" }}>Errore: {err}</p>}

{!err && !data && <p>Caricamento…</p>}

{data && (
<>
<p>Backend collegato ✅</p>
<pre>{JSON.stringify(data, null, 2)}</pre>
</>
)}
</div>
);
}

