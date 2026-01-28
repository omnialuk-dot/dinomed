import { useEffect, useState } from "react";
import { healthCheck } from "./api";

export default function App() {
const [result, setResult] = useState("Caricamento...");
const [error, setError] = useState("");

useEffect(() => {
healthCheck()
.then((data) => setResult(JSON.stringify(data)))
.catch((err) => setError(err.message));
}, []);

return (
<div style={{ padding: 20, fontFamily: "sans-serif" }}>
<h1>DinoMed</h1>

{error && <p style={{ color: "red" }}>Errore: {error}</p>}
{!error && <p>{result}</p>}
</div>
);
}
