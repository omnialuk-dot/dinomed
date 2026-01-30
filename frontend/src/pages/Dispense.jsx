import { useEffect, useMemo, useState } from "react";
import heroImg from "../assets/photos/bookheart.jpg";

export default function Dispense() {
  const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");

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
      .then((data) => setDispense(Array.isArray(data) ? data : []))
      .catch(() => setError("Impossibile caricare le dispense."))
      .finally(() => setLoading(false));
  }, [API_BASE]);

  const materieDisponibili = useMemo(() => {
    const set = new Set(dispense.map((d) => d?.materia).filter(Boolean));
    return ["Tutte", ...Array.from(set)];
  }, [dispense]);

  const stats = useMemo(() => {
    const total = dispense.length;
    const filteredCount = (() => {
      const q = search.trim().toLowerCase();
      return dispense.filter((d) => {
        if (!d) return false;
        const matchMateria = materia === "Tutte" || d.materia === materia;
        const hay = `${d.titolo || ""} ${d.descrizione || ""} ${d.materia || ""}`.toLowerCase();
        const matchSearch = q === "" || hay.includes(q);
        return matchMateria && matchSearch;
      }).length;
    })();

    const materieCount = new Set(dispense.map((d) => d?.materia).filter(Boolean)).size;

    const pagesNums = dispense
      .map((d) => Number.parseInt(d?.pagine, 10))
      .filter((n) => Number.isFinite(n));

    const avgPages =
      pagesNums.length > 0 ? Math.round(pagesNums.reduce((a, b) => a + b, 0) / pagesNums.length) : null;

    return { total, filteredCount, materieCount, avgPages };
  }, [dispense, search, materia]);

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

    return filtered.slice().sort((a, b) => {
      if (sort === "AZ" || sort === "ZA") {
        const ta = (a?.titolo || "").toLowerCase();
        const tb = (b?.titolo || "").toLowerCase();
        const cmp = ta.localeCompare(tb, "it");
        return sort === "AZ" ? cmp : -cmp;
      }

      const pa = pagesVal(a);
      const pb = pagesVal(b);
      if (pa === null && pb === null) return 0;
      if (pa === null) return 1;
      if (pb === null) return -1;
      return sort === "PAGES_ASC" ? pa - pb : pb - pa;
    });
  }, [dispense, search, materia, sort]);

  return (
    <main className="d5">
      <style>{css}</style>

      {/* HERO */}
      <section className="d5-hero">
        <div className="d5-heroGrid">
          <div className="d5-left">
            {/* KICKER DENTRO, IN ALTO A SINISTRA */}
            <div className="d5-kicker">
              <span className="d5-dot" aria-hidden="true" />
              <span className="d5-brand">
                <span className="d5-dino">Dino</span>
                <span className="d5-med">Med</span>
              </span>
              <span className="d5-sep">•</span>
              <span className="d5-tagline">Dispense</span>
            </div>

            <h1 className="d5-title">
              Ripassa <span className="d5-grad">meglio</span>. <br className="d5-br" />
              Con materiale ordinato.
            </h1>

            <p className="d5-sub">
              Cerca, filtra e ordina in un attimo. PDF puliti, senza caos, pronti per il semestre filtro.
            </p>

            {/* MINI GERARCHIA / PROVA SOCIALE */}
            <div className="d5-pills" aria-label="Panoramica">
              <div className="d5-pill">
                <div className="d5-pillTop">Totale</div>
                <div className="d5-pillVal">{stats.total}</div>
              </div>
              <div className="d5-pill">
                <div className="d5-pillTop">Materie</div>
                <div className="d5-pillVal">{stats.materieCount}</div>
              </div>
              <div className="d5-pill">
                <div className="d5-pillTop">Media pagine</div>
                <div className="d5-pillVal">{stats.avgPages ?? "—"}</div>
              </div>
            </div>

            {/* STATO */}
            {loading && <div className="d5-status">Caricamento…</div>}
            {error && <div className="d5-status isErr">{error}</div>}
            {!loading && !error && (
              <div className="d5-status isOk">
                Stai vedendo <b>{stats.filteredCount}</b> dispense (su {stats.total})
              </div>
            )}
          </div>

          <div className="d5-right" aria-hidden="true">
            <div className="d5-visual">
              <img className="d5-img" src={heroImg} alt="" />
              <div className="d5-overlay" />
            </div>
          </div>
        </div>
      </section>

      {/* FILTRI FUORI DAL RETTANGOLO */}
      {!loading && !error && (
        <section className="d5-filterBar">
          <div className="d5-filters">
            <input
              className="d5-input"
              type="text"
              placeholder="Cerca una dispensa…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select className="d5-select" value={materia} onChange={(e) => setMateria(e.target.value)}>
              {materieDisponibili.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <select className="d5-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="AZ">Titolo: A → Z</option>
              <option value="ZA">Titolo: Z → A</option>
              <option value="PAGES_ASC">Pagine: poche → tante</option>
              <option value="PAGES_DESC">Pagine: tante → poche</option>
            </select>
          </div>
        </section>
      )}

      {/* LISTA */}
      <section className="d5-section">
        <div className="d5-grid">
          {!loading && !error && dispenseFiltrateOrdinate.length === 0 && (
            <div className="d5-empty">Nessuna dispensa trovata. Prova a cambiare ricerca o materia.</div>
          )}

          {!loading &&
            !error &&
            dispenseFiltrateOrdinate.map((d) => (
              <article key={d.id ?? `${d.titolo}-${d.materia}`} className="d5-card">
                <div className="d5-cardTop">
                  <span className="d5-tag">{d.materia || "Dispensa"}</span>
                  {d.pagine && <span className="d5-pages">{d.pagine} pag.</span>}
                </div>

                <div className="d5-cardTitle">{d.titolo}</div>

                {d.descrizione && <div className="d5-cardText">{d.descrizione}</div>}

                <div className="d5-cardCtaRow">
                  {d.file_url || d.link ? (
                    <a
                      className="d5-btn d5-primary"
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
                      Apri PDF <span aria-hidden="true">→</span>
                      <span className="d5-shine" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="d5-disabled">PDF non disponibile</span>
                  )}
                </div>
              </article>
            ))}
        </div>
      </section>
    </main>
  );
}

const css = `
:root{
  --dino:#22c55e; --dino2:#16a34a;
  --med:#38bdf8;  --med2:#0ea5e9;
  --ink: rgba(15,23,42,0.92);
  --ink2: rgba(15,23,42,0.72);
  --bd: rgba(15,23,42,0.10);
  --shadow2: 0 12px 28px rgba(2,6,23,0.08);
}

.d5{ max-width: 1120px; margin: 0 auto; padding: 22px; }

/* HERO */
.d5-hero{
  border-radius: 28px;
  border: 1px solid var(--bd);
  background:
    radial-gradient(900px 280px at 12% -25%, rgba(34,197,94,0.16), transparent 60%),
    radial-gradient(900px 280px at 70% -30%, rgba(56,189,248,0.16), transparent 55%),
    rgba(255,255,255,0.90);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: var(--shadow2);
  overflow:hidden;
}

.d5-heroGrid{
  display:grid;
  grid-template-columns: 1.05fr .95fr;
  gap: 28px;
  padding: 28px;
  align-items: center;
}
@media (max-width: 980px){
  .d5-heroGrid{ grid-template-columns: 1fr; padding: 18px; gap: 18px; }
}

/* Kicker inside */
.d5-kicker{
  display:inline-flex;
  align-items:center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.68);
  font-weight: 950;
  color: rgba(15,23,42,0.82);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
  margin-bottom: 14px;
}
.d5-dot{
  width: 10px; height: 10px; border-radius: 999px;
  background: linear-gradient(90deg, var(--dino), var(--med));
  box-shadow: 0 10px 20px rgba(2,6,23,0.10);
}
.d5-brand{ display:inline-flex; gap: 0; }
.d5-dino{ color: var(--dino2); font-weight: 1000; }
.d5-med{ color: var(--med2); font-weight: 1000; }
.d5-sep{ opacity:.55; }
.d5-tagline{ font-weight: 950; }

/* Title */
.d5-title{
  margin: 0 0 10px;
  font-size: 46px;
  line-height: 1.02;
  letter-spacing: -0.035em;
  color: var(--ink);
  font-weight: 1000;
}
.d5-br{ display:none; }
@media (max-width: 520px){
  .d5-title{ font-size: 36px; }
  .d5-br{ display:block; }
}
.d5-grad{
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  -webkit-background-clip:text;
  background-clip:text;
  color: transparent;
}
.d5-sub{ margin: 0; color: var(--ink2); font-weight: 850; max-width: 70ch; }

/* Pills */
.d5-pills{
  margin-top: 14px;
  display:flex;
  gap: 10px;
  flex-wrap: wrap;
}
.d5-pill{
  min-width: 120px;
  padding: 10px 12px;
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.70);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
}
.d5-pillTop{ font-weight: 950; color: rgba(15,23,42,0.62); font-size: 0.82rem; }
.d5-pillVal{ margin-top: 4px; font-weight: 1000; color: rgba(15,23,42,0.92); font-size: 1.05rem; }

/* Status */
.d5-status{
  margin-top: 12px;
  font-weight: 850;
  color: rgba(15,23,42,0.70);
}
.d5-status.isErr{ color: #b91c1c; }
.d5-status.isOk b{ color: rgba(15,23,42,0.92); }

/* Visual */
.d5-visual{
  position: relative;
  border-radius: 24px;
  overflow:hidden;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.92);
  box-shadow: var(--shadow2);
  height: 430px;
}
@media (max-width: 980px){ .d5-visual{ height: 320px; } }

.d5-img{
  width:100%; height:100%;
  object-fit: cover;
  display:block;
  transform: scale(1.02);
  filter: saturate(0.96) contrast(1.05);
}
.d5-overlay{
  position:absolute; inset:0;
  background: linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.34) 55%, rgba(255,255,255,0.88) 100%);
}

/* Filter bar */
.d5-filterBar{ margin-top: 14px; }
.d5-filters{
  display:grid;
  grid-template-columns: 1.2fr .8fr .8fr;
  gap: 10px;
}
@media (max-width: 980px){
  .d5-filters{ grid-template-columns: 1fr; }
}

.d5-input, .d5-select{
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.86);
  font-weight: 900;
  color: rgba(15,23,42,0.86);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
}
.d5-input:focus, .d5-select:focus{
  outline: none;
  border-color: rgba(14,165,233,0.40);
}

/* Grid cards */
.d5-section{ margin-top: 18px; padding-top: 6px; }
.d5-grid{
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
@media (max-width: 980px){ .d5-grid{ grid-template-columns: 1fr; } }

.d5-card{
  border-radius: 24px;
  border: 1px solid rgba(15,23,42,0.10);
  background:
    radial-gradient(520px 220px at 30% -10%, rgba(34,197,94,0.10), transparent 60%),
    radial-gradient(520px 220px at 80% -10%, rgba(56,189,248,0.10), transparent 60%),
    rgba(255,255,255,0.90);
  box-shadow: 0 14px 52px rgba(2,6,23,0.08);
  padding: 18px;
  color: rgba(15,23,42,0.88);
}

.d5-cardTop{
  display:flex;
  justify-content: space-between;
  align-items:center;
  gap: 10px;
  margin-bottom: 10px;
}

.d5-tag{
  display:inline-flex;
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.70);
  font-weight: 950;
  color: rgba(15,23,42,0.78);
}
.d5-pages{
  font-weight: 900;
  color: rgba(15,23,42,0.62);
  font-size: 0.9rem;
}

.d5-cardTitle{
  font-weight: 1000;
  color: rgba(15,23,42,0.92);
  letter-spacing: -0.01em;
  font-size: 1.05rem;
}
.d5-cardText{
  margin-top: 8px;
  font-weight: 850;
  color: rgba(15,23,42,0.72);
  line-height: 1.35;
}

.d5-cardCtaRow{ margin-top: 14px; display:flex; align-items:center; gap: 12px; flex-wrap: wrap; }

.d5-btn{
  position: relative;
  overflow: hidden;
  display:inline-flex;
  align-items:center;
  gap: 10px;
  padding: 13px 16px;
  border-radius: 999px;
  text-decoration:none;
  font-weight: 1000;
  border: 1px solid rgba(15,23,42,0.10);
  box-shadow: 0 14px 30px rgba(2,6,23,0.10);
  transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
  color: rgba(15,23,42,0.86);
  background: rgba(255,255,255,0.72);
}
.d5-btn:hover{ transform: translateY(-1px); box-shadow: 0 18px 40px rgba(2,6,23,0.14); filter: saturate(1.03); }

.d5-primary{
  color:white;
  border: 1px solid rgba(255,255,255,0.18);
  background: linear-gradient(90deg, var(--dino2), var(--med2));
}

.d5-shine{
  position:absolute; inset:0;
  background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.26) 25%, transparent 50%);
  transform: translateX(-120%);
  animation: d5Shine 4.2s ease-in-out infinite;
  pointer-events: none;
}
@keyframes d5Shine{
  0%, 58% { transform: translateX(-120%); }
  88%, 100% { transform: translateX(120%); }
}

.d5-disabled{
  font-weight: 900;
  color: rgba(15,23,42,0.55);
}

.d5-empty{
  grid-column: 1 / -1;
  border-radius: 24px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.86);
  box-shadow: var(--shadow2);
  padding: 18px;
  font-weight: 900;
  color: rgba(15,23,42,0.72);
}
`;