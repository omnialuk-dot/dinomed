import { useEffect, useState } from "react";
import { apiHealth, API_BASE_URL } from "./api";

export default function App() {
const [data, setData] = useState(null);
const [err, setErr] = useState("");

useEffect(() => {
apiHealth()
.then(setData)
.catch((e) => setErr(e.message || String(e)));
}, []);

return (
<div style={{ fontFamily: "system-ui", padding: 24 }}>
<h1>DinoMed Frontend</h1>

<p><b>API:</b> {API_BASE_URL}</p>

{err && <p style={{ color: "red" }}>Errore: {err}</p>}
{!err && !data && <p>Caricamento...</p>}
{data && <pre>{JSON.stringify(data, null, 2)}</pre>}
</div>
);
}