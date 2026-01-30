import { useEffect, useMemo, useState } from "react";
import heroImg from "../assets/photos/bookheart.jpg";
import "../styles/dispense.css";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");

export default function Dispense() {
  const [dispense, setDispense] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [materia, setMateria] = useState("Tutte");

  useEffect(() => {
    fetch(`${API_BASE}/api/dispense`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setDispense(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setError("Impossibile caricare le dispense.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const materieDisponibili = useMemo(() => {
    const set = new Set(dispense.map((d) => d.materia).filter(Boolean));
    return ["Tutte", ...Array.from(set)];
  }, [dispense]);

  const dispenseFiltrate = useMemo(() => {
    return dispense.filter((d) => {
      const matchMateria =
        materia === "Tutte" || d.materia === materia;

      const matchSearch =
        d.titolo?.toLowerCase().includes(search.toLowerCase()) ||
        d.descrizione?.toLowerCase().includes(search.toLowerCase());

      return matchMateria && matchSearch;
    });
  }, [dispense, search, materia]);

  return (
    <main className="dm-page">
      <header className="dm-header with-image">
        <div className="dm-header-text">
          <span className="dm-kicker">Dispense</span>
          <h1>
            Studia meglio. <br />
            <span className="dm-accent">Studia con metodo.</span>
          </h1>
          <p>
            Dispense selezionate, ordinate per argomento e pensate per aiutarti
            a capire davvero, non solo a memorizzare.
          </p>
        </div>

        <div className="dm-header-image">
          <img src={heroImg} alt="Studio medico" />
        </div>
      </header>

      {/* FILTRI */}
      {!loading && !error && (
        <div className="dm-filters">
          <input
            type="text"
            placeholder="Cerca una dispensa…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={materia}
            onChange={(e) => setMateria(e.target.value)}
          >
            {materieDisponibili.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && <p className="dm-status">Caricamento…</p>}
      {error && <p className="dm-status error">{error}</p>}

      {!loading && !error && (
        <section className="dm-grid">
          {dispenseFiltrate.length === 0 && (
            <p className="dm-status">Nessuna dispensa trovata.</p>
          )}

          {dispenseFiltrate.map((d) => (
            <article key={d.id} className="dm-card">
              <div className="dm-card-top">
                <span className="dm-tag">{d.materia || "Dispensa"}</span>
                {d.pagine && <span className="dm-pages">{d.pagine} pag.</span>}
              </div>

              <h3>{d.titolo}</h3>

              {d.descrizione && (
                <p className="dm-desc">{d.descrizione}</p>
              )}

              <div className="dm-actions">
                {d.file_url || d.link ? (
                  <a
                    className="dm-btn"
                    href={
                      d.file_url
                        ? d.file_url.startsWith("http")
                          ? d.file_url
                          : `${API_BASE}${d.file_url}`
                        : d.link
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    Apri PDF
                  </a>
                ) : (
                  <span className="dm-disabled">PDF non disponibile</span>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}