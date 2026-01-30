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
    <main className="d4">
      <style>{css}</style>

      {/* HERO (stile Home) */}
      <section className="d4-hero">
        <div className="d4-heroGrid">
          <div className="d4-left">
            <div className="d4-kicker">
              <span className="d4-dot" aria-hidden="true" />
              <span className="d4-brand">
                <span className="d4-dino">Dino</span>
                <span className="d4-med">Med</span>
              </span>
              <span className="d4-sep">•</span>
              <span className="d4-tagline">Dispense</span>
            </div>

            <h1 className="d4-title">
              Ripassa <span className="d4-grad">meglio</span>. <br className="d4-br" />
              Senza confusione.
            </h1>

            <p className="d4-sub">
              Cerca, filtra e ordina in due click. PDF puliti, trovabili, pronti.
            </p>

            {/* FILTRI */}
            <div className="d4-filters">
              <input
                className="d4-input"
                type="text"
                placeholder="Cerca una dispensa…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select className="d4-select" value={materia} onChange={(e) => setMateria(e.target.value)}>
                {materieDisponibili.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <select className="d4-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="AZ">Titolo: A → Z</option>
                <option value="ZA">Titolo: Z → A</option>
                <option value="PAGES_ASC">Pagine: poche → tante</option>
                <option value="PAGES_DESC">Pagine: tante → poche</option>
              </select>
            </div>

            {/* STATO */}
            {loading && <div className="d4-status">Caricamento…</div>}
            {error && <div className="d4-status isErr">{error}</div>}
            {!loading && !error && (
              <div className="d4-status isOk">
                {dispenseFiltrateOrdinate.length} dispense trovate
              </div>
            )}
          </div>

          <div className="d4-right" aria-hidden="true">
            <div className="d4-visual">
              <img className="d4-img" src={heroImg} alt="" />
              <div className="d4-overlay" />

              <div className="d4-float d4-floatTop">
                <span className="d4-badge">
                  <span className="d4-miniDot" aria-hidden="true" /> Filtra per materia
                </span>
                <span className="d4-badge">
                  <span className="d4-miniDot" aria-hidden="true" /> Ordina in 1 click
                </span>
              </div>

              <div className="d4-float d4-floatBottom">
                <div className="d4-miniTitle">Dentro trovi</div>
                <div className="d4-miniGrid">
                  <div className="d4-miniItem">
                    <span className="d4-miniDot" /> PDF ordinati
                  </div>
                  <div className="d4-miniItem">
                    <span className="d4-miniDot" /> Descrizioni chiare
                  </div>
                  <div className="d4-miniItem">
                    <span className="d4-miniDot" /> Ripasso guidato
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LISTA */}
      <section className="d4-section">
        <div className="d4-grid">
          {!loading && !error && dispenseFiltrateOrdinate.length === 0 && (
            <div className="d4-empty">
              Nessuna dispensa trovata. Prova a cambiare ricerca o materia.
            </div>
          )}

          {!loading &&
            !error &&
            dispenseFiltrateOrdinate.map((d) => (
              <article key={d.id ?? `${d.titolo}-${d.materia}`} className="d4-card">
                <div className="d4-cardTop">
                  <span className="d4-tag">{d.materia || "Dispensa"}</span>
                  {d.pagine && <span className="d4-pages">{d.pagine} pag.</span>}
                </div>

                <div className="d4-cardTitle">{d.titolo}</div>

                {d.descrizione && <div className="d4-cardText">{d.descrizione}</div>}

                <div className="d4-cardCtaRow">
                  {d.file_url || d.link ? (
                    <a
                      className="d4-btn d4-primary"
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
                      <span className="d4-shine" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="d4-disabled">PDF non disponibile</span>
                  )}
                </div>
              </article>
            ))}
        </div>
      </section>
    </main>
  );
}

/* ---------------- CSS (stile Home) ---------------- */
const css = `
:root{
  --dino:#22c55e; --dino2:#16a34a;
  --med:#38bdf8;  --med2:#0ea5e9;

  --ink: rgba(15,23,42,0.92);
  --ink2: rgba(15,23,42,0.72);
  --bd: rgba(15,23,42,0.10);
  --shadow2: 0 12px 28px rgba(2,6,23,0.08);
}

.d4{ max-width: 1120px; margin: 0 auto; padding: 22px; }

/* HERO */
.d4-hero{
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

.d4-heroGrid{
  display:grid;
  grid-template-columns: 1.05fr .95fr;
  gap: 28px;
  padding: 28px;
  align-items: center;
}
@media (max-width: 980px){
  .d4-heroGrid{ grid-template-columns: 1fr; padding: 18px; gap: 18px; }
}

/* Kicker DinoMed • Dispense */
.d4-kicker{
  display:inline-flex;
  align-items:center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.68);
  font-weight: 950;
  color: rgba(15,23,42,0.82);
}
.d4-dot{
  width: 10px; height: 10px; border-radius: 999px;
  background: linear-gradient(90deg, var(--dino), var(--med));
  box-shadow: 0 10px 20px rgba(2,6,23,0.10);
}
.d4-brand{ display:inline-flex; gap: 0; }
.d4-dino{ color: var(--dino2); font-weight: 1000; }
.d4-med{ color: var(--med2); font-weight: 1000; }
.d4-sep{ opacity:.55; }
.d4-tagline{ font-weight: 950; }

/* Title */
.d4-title{
  margin: 16px 0 10px;
  font-size: 46px;
  line-height: 1.02;
  letter-spacing: -0.035em;
  color: var(--ink);
  font-weight: 1000;
}
.d4-br{ display:none; }
@media (max-width: 520px){
  .d4-title{ font-size: 36px; }
  .d4-br{ display:block; }
}
.d4-grad{
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  -webkit-background-clip:text;
  background-clip:text;
  color: transparent;
}
.d4-sub{ margin: 0; color: var(--ink2); font-weight: 850; max-width: 70ch; }

/* Filters */
.d4-filters{
  margin-top: 16px;
  display:grid;
  grid-template-columns: 1.2fr .8fr .8fr;
  gap: 10px;
}
@media (max-width: 980px){
  .d4-filters{ grid-template-columns: 1fr; }
}

.d4-input, .d4-select{
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.72);
  font-weight: 900;
  color: rgba(15,23,42,0.86);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
}
.d4-input:focus, .d4-select:focus{
  outline: none;
  border-color: rgba(14,165,233,0.40);
}

.d4-status{
  margin-top: 12px;
  font-weight: 850;
  color: rgba(15,23,42,0.70);
}
.d4-status.isErr{ color: #b91c1c; }
.d4-status.isOk{ color: rgba(15,23,42,0.72); }

/* Visual (destra) */
.d4-visual{
  position: relative;
  border-radius: 24px;
  overflow:hidden;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.92);
  box-shadow: var(--shadow2);
  height: 430px;
}
@media (max-width: 980px){ .d4-visual{ height: 320px; } }

.d4-img{
  width:100%; height:100%;
  object-fit: cover;
  display:block;
  transform: scale(1.02);
  filter: saturate(0.96) contrast(1.05);
}
.d4-overlay{
  position:absolute; inset:0;
  background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.30) 55%, rgba(255,255,255,0.88) 100%);
}

.d4-float{
  position:absolute;
  left: 14px; right: 14px;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.40);
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 18px 55px rgba(2,6,23,0.10);
  padding: 12px;
}
.d4-floatTop{ top: 14px; display:flex; gap: 8px; flex-wrap: wrap; }
.d4-floatBottom{ bottom: 14px; }

.d4-badge{
  display:inline-flex; align-items:center; gap: 8px;
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.70);
  font-weight: 950;
  color: rgba(15,23,42,0.78);
}

.d4-miniTitle{ font-weight: 1000; color: rgba(15,23,42,0.90); }
.d4-miniGrid{ margin-top: 10px; display:grid; gap: 8px; }
.d4-miniItem{ display:flex; gap: 8px; align-items:center; font-weight: 900; color: rgba(15,23,42,0.76); }
.d4-miniDot{
  width: 10px; height: 10px; border-radius: 999px;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
}

/* LIST */
.d4-section{ margin-top: 18px; padding-top: 6px; }

.d4-grid{
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
@media (max-width: 980px){ .d4-grid{ grid-template-columns: 1fr; } }

.d4-card{
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

.d4-cardTop{
  display:flex;
  justify-content: space-between;
  align-items:center;
  gap: 10px;
  margin-bottom: 10px;
}

.d4-tag{
  display:inline-flex;
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.70);
  font-weight: 950;
  color: rgba(15,23,42,0.78);
}

.d4-pages{
  font-weight: 900;
  color: rgba(15,23,42,0.62);
  font-size: 0.9rem;
}

.d4-cardTitle{
  font-weight: 1000;
  color: rgba(15,23,42,0.92);
  letter-spacing: -0.01em;
  font-size: 1.05rem;
}

.d4-cardText{
  margin-top: 8px;
  font-weight: 850;
  color: rgba(15,23,42,0.72);
  line-height: 1.35;
}

.d4-cardCtaRow{ margin-top: 14px; display:flex; align-items:center; gap: 12px; flex-wrap: wrap; }

.d4-btn{
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
.d4-btn:hover{ transform: translateY(-1px); box-shadow: 0 18px 40px rgba(2,6,23,0.14); filter: saturate(1.03); }

.d4-primary{
  color:white;
  border: 1px solid rgba(255,255,255,0.18);
  background: linear-gradient(90deg, var(--dino2), var(--med2));
}

.d4-shine{
  position:absolute; inset:0;
  background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.26) 25%, transparent 50%);
  transform: translateX(-120%);
  animation: d4Shine 4.2s ease-in-out infinite;
  pointer-events: none;
}
@keyframes d4Shine{
  0%, 58% { transform: translateX(-120%); }
  88%, 100% { transform: translateX(120%); }
}

.d4-disabled{
  font-weight: 900;
  color: rgba(15,23,42,0.55);
}

.d4-empty{
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