import { useEffect, useMemo, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");

export default function Dispense() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/dispense`);
        if (!res.ok) throw new Error("Impossibile caricare le dispense");
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

  const grouped = useMemo(() => {
    const map = {};
    items.forEach((d) => {
      const area = d.area || "Altro";
      if (!map[area]) map[area] = [];
      map[area].push(d);
    });
    return map;
  }, [items]);

  if (loading) {
    return (
      <div className="page">
        <div className="container narrow">
          <p className="muted">Caricamento dispense…</p>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="page">
        <div className="container narrow">
          <p className="error">{err}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* HERO */}
      <section className="hero compact">
        <div className="container narrow">
          <h1>Dispense di studio</h1>
          <p className="subtitle">
            Materiale selezionato per studenti di area medico-scientifica.
            Diretto, chiaro, senza perdite di tempo.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="container">
        {Object.keys(grouped).length === 0 && (
          <p className="muted">Nessuna dispensa disponibile.</p>
        )}

        {Object.entries(grouped).map(([area, docs]) => (
          <div key={area} className="block">
            <h2 className="section-title">{area}</h2>

            <div className="grid cards">
              {docs.map((d) => (
                <a
                  key={d.id}
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="card link"
                >
                  <div className="card-body">
                    <h3>{d.titolo}</h3>
                    {d.descrizione && (
                      <p className="muted small">{d.descrizione}</p>
                    )}
                  </div>

                  <div className="card-footer">
                    <span className="tag">{d.formato || "PDF"}</span>
                    <span className="cta">Apri →</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}