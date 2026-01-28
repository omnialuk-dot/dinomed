import { useEffect, useState } from "react";
import { healthCheck } from "./api";

function App() {
const [status, setStatus] = useState("loading...");
const [error, setError] = useState(null);

useEffect(() => {
healthCheck()
.then((res) => setStatus(JSON.stringify(res)))
.catch((err) => setError(err.message));
}, []);

return (
<div style={{ padding: 20 }}>
<h1>DinoMed Frontend</h1>
{error ? <p style={{ color: "red" }}>{error}</p> : <p>{status}</p>}
</div>
);
}

export default App;
