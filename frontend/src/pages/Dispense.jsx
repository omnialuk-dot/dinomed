import { useEffect, useMemo, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");

export default function Dispense() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/dispense`)
      .then((r) => {
        if (!r.ok) throw new Error("Errore nel caricamento delle dispense");
        return r.json();
      })
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  const featured = useMemo(() => items.slice(0, 3), [items]);
  const rest = useMemo(() => items.slice(3), [items]);

  return (
    <main className="dispense-page">
      <style>{css}</style>

      {/* HERO */}
      <section className="dispense-hero">
        <span className="dispense-kicker">Dispense DinoMed</span>
        <h1>Studia meno. Studia meglio.</h1>
        <p>
          Appunti mirati, puliti e realmente utili per esami e test di ingresso.
          Solo ciò che serve. Nient’altro.
        </p>
      </section>

      {loading && <div className="dispense-state">Caricamento…</div>}
      {err && <div className="dispense-error">⚠️ {err}</div>}

      {!loading && !err && (
        <>
          {featured.length > 0 && (
            <section className="dispense-section">
              <h2>In evidenza</h2>
              <div className="dispense-grid">
                {featured.map((d) => (
                  <DispensaCard key={d.id} d={d} />
                ))}
              </div>
            </section>
          )}

          <section className="dispense-section">
            <h2>Tutte le dispense</h2>
            <div className="dispense-grid">
              {rest.map((d) => (
                <DispensaCard key={d.id} d={d} />
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function DispensaCard({ d }) {
  const url = d.file_url
    ? d.file_url.startsWith("http")
      ? d.file_url
      : `${API_BASE}${d.file_url}`
    : d.link;

  return (
    <article className="dispensa-card">
      <div className="dispensa-meta">
        <span>{d.materia || "Dispensa"}</span>
        {d.pagine && <span>{d.pagine} pag.</span>}
      </div>

      <h3>{d.titolo}</h3>
      {d.descrizione && <p>{d.descrizione}</p>}

      <div className="dispensa-action">
        {url ? (
          <a href={url} target="_blank" rel="noreferrer">
            Apri PDF
          </a>
        ) : (
          <span className="disabled">Non disponibile</span>
        )}
      </div>
    </article>
  );
}

/* =========================
   CSS PREMIUM – INLINE
   ========================= */

const css = `
.dispense-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 20px 80px;
}

/* HERO */
.dispense-hero {
  margin-bottom: 56px;
  padding: 48px;
  border-radius: 28px;
  background: linear-gradient(
    135deg,
    rgba(15, 23, 42, 0.06),
    rgba(15, 23, 42, 0.02)
  );
}

.dispense-kicker {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: rgba(15, 23, 42, 0.55);
  margin-bottom: 12px;
  display: inline-block;
}

.dispense-hero h1 {
  font-size: 38px;
  line-height: 1.15;
  margin: 0 0 12px;
}

.dispense-hero p {
  max-width: 65ch;
  font-size: 16px;
  color: rgba(15, 23, 42, 0.65);
}

/* SEZIONI */
.dispense-section {
  margin-bottom: 56px;
}

.dispense-section h2 {
  font-size: 22px;
  margin-bottom: 18px;
}

/* GRID */
.dispense-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

@media (max-width: 900px) {
  .dispense-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .dispense-grid {
    grid-template-columns: 1fr;
  }
}

/* CARD */
.dispensa-card {
  background: white;
  border-radius: 22px;
  padding: 22px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.dispensa-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
}

.dispensa-meta {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: rgba(15, 23, 42, 0.5);
  margin-bottom: 10px;
}

.dispensa-card h3 {
  font-size: 17px;
  margin: 0 0 8px;
}

.dispensa-card p {
  font-size: 14px;
  color: rgba(15, 23, 42, 0.65);
  line-height: 1.5;
  margin-bottom: 16px;
}

/* ACTION */
.dispensa-action {
  margin-top: auto;
}

.dispensa-action a {
  display: inline-block;
  padding: 10px 16px;
  border-radius: 14px;
  background: #0f172a;
  color: white;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
}

.dispensa-action a:hover {
  background: #020617;
}

.disabled {
  font-size: 14px;
  color: rgba(15, 23, 42, 0.35);
}

/* STATES */
.dispense-state {
  margin-top: 40px;
  font-size: 15px;
  color: rgba(15, 23, 42, 0.6);
}

.dispense-error {
  margin-top: 40px;
  color: #b91c1c;
  font-weight: 600;
}
`;