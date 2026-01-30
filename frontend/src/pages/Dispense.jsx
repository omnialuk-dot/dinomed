import { useEffect, useState } from "react";
import heroImg from "../assets/photos/lab.jpg";
import "../styles/dispense.css";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");

export default function Dispense() {
  const [dispense, setDispense] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <main className="dm-page">
      <header className="dm-header with-image">
        <div className="dm-header-text">
          <span className="dm-kicker">Dispense</span>
          <h1>Materiale di studio</h1>
          <p>
            Appunti essenziali, ordinati per argomento e pensati per aiutarti a
            studiare meglio, non di più.
          </p>
        </div>

        <div className="dm-header-image">
          <img src={heroImg} alt="Laboratorio medico" />
        </div>
      </header>

      {loading && <p className="dm-status">Caricamento…</p>}
      {error && <p className="dm-status error">{error}</p>}

      {!loading && !error && (
        <section className="dm-grid">
          {dispense.length === 0 && (
            <p className="dm-status">Nessuna dispensa disponibile.</p>
          )}

          {dispense.map((d) => (
            <article key={d.id} className="dm-card">
              <div className="dm-card-top">
                <span className="dm-tag">{d.materia || "Dispensa"}</span>
                {d.pagine && <span className="dm-pages">{d.pagine} pag.</span>}
              </div>

              <h3>{d.titolo}</h3>

              {d.descrizione && <p className="dm-desc">{d.descrizione}</p>}

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