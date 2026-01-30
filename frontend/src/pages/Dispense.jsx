import { useEffect, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");

export default function Dispense() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/dispense`);
        if (!res.ok) throw new Error("Errore nel caricamento delle dispense");
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e.message || "Errore");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="h4">
      <style>{css}</style>

      {/* HEADER COERENTE CON HOME */}
      <section className="h4-section">
        <div className="h4-kicker">
          <span className="h4-dot" aria-hidden="true" />
          <span className="h4-tagline">Materiale di studio</span>
        </div>

        <h1 className="h4-title">
          Dispense <span className="h4-grad">ordinate</span>
        </h1>

        <p className="h4-sub">
          Niente caos. Solo ciò che serve, quando serve.
        </p>
      </section>

      {/* CONTENUTO */}
      <section className="h4-section">
        {err && <div className="h4-state h4-error">⚠️ {err}</div>}
        {loading ? (
          <div className="h4-state">Caricamento dispense…</div>
        ) : (
          <div className="h4-list">
            {items.length === 0 ? (
              <div className="h4-state">Nessuna dispensa disponibile.</div>
            ) : (
              items.map((d) => <DispensaItem key={d.id} d={d} />)
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function DispensaItem({ d }) {
  const pdfUrl = d.file_url
    ? d.file_url.startsWith("http")
      ? d.file_url
      : `${API_BASE}${d.file_url}`
    : d.link;

  return (
    <article className="h4-card">
      <div className="h4-cardTop">
        <span className="h4-pill">{d.materia || "Dispensa"}</span>
        {d.pagine && <span className="h4-meta">{d.pagine} pag.</span>}
      </div>

      <h3 className="h4-cardTitle">{d.titolo}</h3>

      {d.descrizione && (
        <p className="h4-cardText">{d.descrizione}</p>
      )}

      <div className="h4-cardCta">
        {pdfUrl ? (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="h4-link"
          >
            Apri PDF →
          </a>
        ) : (
          <span className="h4-disabled">Non disponibile</span>
        )}
      </div>
    </article>
  );
}

/* =========================
   STESSO SISTEMA VISIVO HOME
   ========================= */
const css = `
.h4-section{
  margin-top: 28px;
}
.h4-list{
  display:grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.h4-card{
  border-radius: 22px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.90);
  padding: 16px 18px;
  box-shadow: var(--shadow2);
}
.h4-cardTop{
  display:flex;
  justify-content: space-between;
  align-items:center;
  gap: 8px;
}
.h4-pill{
  border: 1px solid var(--border);
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 12px;
  background:#fff;
}
.h4-meta{
  font-weight: 800;
  font-size: 12px;
  color: rgba(15,23,42,0.55);
}
.h4-state{
  padding: 18px;
  font-weight: 900;
  color: rgba(15,23,42,0.65);
}
.h4-error{
  color: #b91c1c;
}
.h4-disabled{
  opacity: 0.5;
  font-weight: 900;
}
.h4-link{
  font-weight: 1000;
  color: rgba(15,23,42,0.85);
}
`;