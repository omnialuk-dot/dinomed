import { useEffect, useState } from "react";
import { apiHealth } from "./api";

export default function App() {
const [msg, setMsg] = useState("Carico...");

useEffect(() => {
apiHealth()
.then((data) => setMsg(JSON.stringify(data)))
.catch((err) => setMsg("Errore: " + err.message));
}, []);

return (
<div style={{ padding: 20, fontFamily: "sans-serif" }}>
<h1>DinoMed Frontend</h1>
<p>{msg}</p>
</div>
);
}
