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
  const [sort, setSort] = useState("AZ"); // AZ | ZA | PAGES_ASC | PAGES_DESC

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
    const set = new Set(dispense.map((d) => d?.materia).filter(Boolean));
    return ["Tutte", ...Array.from(set)];
  }, [dispense]);

  const dispenseFiltrateOrdinate = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = dispense.filter((d) => {
      if (!d) return false;

      const matchMateria = materia === "Tutte" || d.materia === materia;

      const hay = `${d.titolo || ""} ${d.descrizione || ""} ${d.materia || ""}`.toLowerCase();
      const matchSearch = q === "" || hay.includes(q);

      return matchMateria && matchSearch;
    });

    const pagesVal = (d) => {
      const n = Number.parseInt(d?.pagine, 10);
      return Number.isFinite(n) ? n : null;
    };

    const sorted = filtered.slice().sort((a, b) => {
      if (sort === "AZ" || sort === "ZA") {
        const ta = (a?.titolo || "").toLowerCase();
        const tb = (b?.titolo || "").toLowerCase();
        const cmp = ta.localeCompare(tb, "it");
        return sort === "AZ" ? cmp : -cmp;
      }

      const pa = pagesVal(a);
      const pb = pagesVal(b);

      // Metti quelli senza pagine in fondo
      if (pa === null && pb === null) return 0;
      if (pa === null) return 1;
      if (pb === null) return -1;

      return sort === "PAGES_ASC" ? pa - pb : pb - pa;
    });

    return sorted;
  }, [dispense, search, materia, sort]);

  return (
    <main className="dm-page">
      <header className="dm-header with-image">
        <div className="dm-header-text">
          <span className="dm-kicker">Dispense</span>

          <h1 className="dm-title">
            Ripassa <span className="dm-grad">meglio</span>.<br className="dm-br" />
            Senza confusione.
          </h1>

          <p className="dm-sub">
            Materiale pulito, essenziale e ordinato. Trova subito la dispensa giusta e vai dritto al punto.
          </p>
        </div>

        <div className="dm-header-image">
          <img src={heroImg} alt="Dispense e studio" />
        </div>
      </header>

      {!loading && !error && (
        <div className="dm-filters">
          <input
            type="text"
            placeholder="Cerca una dispensa…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={materia} onChange={(e) => setMateria(e.target.value)}>
            {materieDisponibili.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="AZ">Titolo: A → Z</option>
            <option value="ZA">Titolo: Z → A</option>
            <option value="PAGES_ASC">Pagine: poche → tante</option>
            <option value="PAGES_DESC">Pagine: tante → poche</option>
          </select>
        </div>
      )}

      {loading && <p className="dm-status">Caricamento…</p>}
      {error && <p className="dm-status error">{error}</p>}

      {!loading && !error && (
        <section className="dm-grid">
          {dispenseFiltrateOrdinate.length === 0 && (
            <p className="dm-status">Nessuna dispensa trovata.</p>
          )}

          {dispenseFiltrateOrdinate.map((d) => (
            <article key={d.id ?? `${d.titolo}-${d.materia}`} className="dm-card">
              <div className="dm-card-top">
                <span className="dm-tag">{d.materia || "Dispensa"}</span>
                {d.pagine && <span className="dm-pages">{d.pagine} pag.</span>}
              </div>

              <h3 className="dm-card-title">{d.titolo}</h3>

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