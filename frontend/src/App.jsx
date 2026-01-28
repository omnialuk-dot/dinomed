import { useEffect, useState } from "react";
import { apiHealth } from "./api";

export default function App() {
const [data, setData] = useState(null);
const [err, setErr] = useState(null);

useEffect(() => {
apiHealth().then(setData).catch((e) => setErr(e.message));
}, []);

return (
<div style={{ padding: 40 }}>
<h1>DinoMed Frontend</h1>
{err && <p style={{ color: "red" }}>Errore: {err}</p>}
{!err && !data && <p>Caricamento...</p>}
{data && <pre>{JSON.stringify(data, null, 2)}</pre>}
</div>
);
}
