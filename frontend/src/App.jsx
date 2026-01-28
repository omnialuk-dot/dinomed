import { useEffect, useState } from "react";
import { apiHealth, API_BASE_URL } from "./api";

export default function App() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    apiHealth()
      .then(setData)
      .catch((e) => setErr(String(e)));
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>DinoMed Frontend</h1>

      <p>
        <b>API_BASE_URL:</b> {API_BASE_URL}
      </p>

      {err && <p style={{ color: "red" }}>Errore: {err}</p>}
      {!err && !data && <p>Caricamento...</p>}
      {data && (
        <pre
          style={{
            background: "#111",
            color: "#0f0",
            padding: 12,
            borderRadius: 8,
            maxWidth: 520,
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

