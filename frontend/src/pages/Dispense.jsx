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
  const [onlyPdf, setOnlyPdf] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/dispense`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setDispense(Array.isArray(data) ? data : []))
      .catch(() => setError("Impossibile caricare le dispense. Riprova tra poco."))
      .finally(() => setLoading(false));
  }, [API_BASE]);

  const materieDisponibili = useMemo(() => {
    const set = new Set(dispense.map((d) => d?.materia).filter(Boolean));
    return ["Tutte", ...Array.from(set)];
  }, [dispense]);

  const stats = useMemo(() => {
    const total = dispense.length;
    const pdfCount = dispense.filter((d) => Boolean(d?.file_url || d?.link)).length;
    const materieCount = new Set(dispense.map((d) => d?.materia).filter(Boolean)).size;

    const pagesNums = dispense
      .map((d) => Number.parseInt(d?.pagine, 10))
      .filter((n) => Number.isFinite(n));
    const avgPages =
      pagesNums.length > 0 ? Math.round(pagesNums.reduce((a, b) => a + b, 0) / pagesNums.length) : null;

    return { total, pdfCount, materieCount, avgPages };
  }, [dispense]);

  const dispenseFiltrateOrdinate = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = dispense.filter((d) => {
      if (!d) return false;

      if (onlyPdf && !(d.file_url || d.link)) return false;

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
  }, [dispense, search, materia, sort, onlyPdf]);

  const visibleCount = dispenseFiltrateOrdinate.length;

  return (
    <main className="dp">
      <style>{css}</style>

      {/* TOP BAR (tool page, non home) */}
      <section className="dp-top">
        <div className="dp-topInner">
          <div className="dp-kicker">
            <span className="dp-dot" aria-hidden="true" />
            <span className="dp-brand">
              <span className="dp-dino">Dino</span>
              <span className="dp-med">Med</span>
            </span>
            <span className="dp-sep">•</span>
            <span className="dp-tagline">Dispense</span>
          </div>

          <div className="dp-help">
            <span className="dp-helpIcon" aria-hidden="true">
              <IconInfo />
            </span>
            <div className="dp-helpText">
              <b>Cosa sono le dispense?</b> Sono PDF/appunti riassuntivi: spiegano i concetti chiave, con struttura
              chiara, così puoi ripassare veloce e con metodo.
            </div>
          </div>
        </div>
      </section>

      {/* HERO CARD (più bassa, più “pagina strumento”) */}
      <section className="dp-hero">
        <div className="dp-heroGrid">
          <div className="dp-left">
            <h1 className="dp-title">
              Trova la dispensa giusta, <br className="dp-br" />
              e ripassa <span className="dp-grad">meglio</span>.
            </h1>

            <p className="dp-sub">
              Cerca per titolo/argomento, filtra per materia, e scegli l’ordine migliore per il tuo ripasso.
            </p>

            {/* MINI STATS (gerarchia) */}
            <div className="dp-stats">
              <div className="dp-stat">
                <div className="dp-statIco" aria-hidden="true">
                  <IconBook />
                </div>
                <div className="dp-statTxt">
                  <div className="dp-statTop">Dispense</div>
                  <div className="dp-statVal">{stats.total}</div>
                </div>
              </div>

              <div className="dp-stat">
                <div className="dp-statIco isPdf" aria-hidden="true">
                  <IconFile />
                </div>
                <div className="dp-statTxt">
                  <div className="dp-statTop">PDF disponibili</div>
                  <div className="dp-statVal">{stats.pdfCount}</div>
                </div>
              </div>

              <div className="dp-stat">
                <div className="dp-statIco isTag" aria-hidden="true">
                  <IconTag />
                </div>
                <div className="dp-statTxt">
                  <div className="dp-statTop">Materie</div>
                  <div className="dp-statVal">{stats.materieCount}</div>
                </div>
              </div>

              <div className="dp-stat">
                <div className="dp-statIco isClock" aria-hidden="true">
                  <IconClock />
                </div>
                <div className="dp-statTxt">
                  <div className="dp-statTop">Media pagine</div>
                  <div className="dp-statVal">{stats.avgPages ?? "—"}</div>
                </div>
              </div>
            </div>

            {/* STATUS */}
            {loading && <div className="dp-status">Caricamento…</div>}
            {error && <div className="dp-status isErr">{error}</div>}
            {!loading && !error && (
              <div className="dp-status isOk">
                <b>{visibleCount}</b> risultati trovati
              </div>
            )}
          </div>

          <div className="dp-right" aria-hidden="true">
            <div className="dp-visual">
              <img className="dp-img" src={heroImg} alt="" />
              <div className="dp-overlay" />
            </div>
          </div>
        </div>
      </section>

      {/* FILTER BAR (fuori dalla hero) */}
      {!loading && !error && (
        <section className="dp-fbar">
          <div className="dp-frow">
            <div className="dp-field">
              <label className="dp-label">
                <IconSearch /> Cerca
              </label>
              <input
                className="dp-input"
                type="text"
                placeholder="Es. biochimica, membrane, metabolismo…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="dp-field">
              <label className="dp-label">
                <IconTag /> Materia
              </label>
              <select className="dp-select" value={materia} onChange={(e) => setMateria(e.target.value)}>
                {materieDisponibili.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="dp-field">
              <label className="dp-label">
                <IconSort /> Ordina
              </label>
              <select className="dp-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="AZ">Titolo: A → Z</option>
                <option value="ZA">Titolo: Z → A</option>
                <option value="PAGES_ASC">Pagine: poche → tante</option>
                <option value="PAGES_DESC">Pagine: tante → poche</option>
              </select>
            </div>
          </div>

          <div className="dp-toggles">
            <button
              type="button"
              className={`dp-toggle ${onlyPdf ? "isOn" : ""}`}
              onClick={() => setOnlyPdf((v) => !v)}
            >
              <span className="dp-toggleIco" aria-hidden="true">
                <IconFile />
              </span>
              Solo PDF disponibili
            </button>

            <div className="dp-hint">
              <span className="dp-hintDot" aria-hidden="true" />
              Tip: usa la ricerca per trovare parole precise (es. “mitocondrio”, “DNA eucariotico”).
            </div>
          </div>
        </section>
      )}

      {/* LISTA */}
      <section className="dp-section">
        <div className="dp-grid">
          {!loading && !error && dispenseFiltrateOrdinate.length === 0 && (
            <div className="dp-empty">
              Nessuna dispensa trovata. Prova a cambiare ricerca/materia o disattiva “Solo PDF”.
            </div>
          )}

          {!loading &&
            !error &&
            dispenseFiltrateOrdinate.map((d) => (
              <article key={d.id ?? `${d.titolo}-${d.materia}`} className="dp-card">
                <div className="dp-cardTop">
                  <span className="dp-badge">
                    <IconTag /> {d.materia || "Dispensa"}
                  </span>
                  <span className="dp-meta">
                    <IconPages /> {d.pagine ? `${d.pagine} pag.` : "pagine n/d"}
                  </span>
                </div>

                <div className="dp-cardTitle">{d.titolo}</div>

                {d.descrizione && <div className="dp-cardText">{d.descrizione}</div>}

                <div className="dp-cardCtaRow">
                  {d.file_url || d.link ? (
                    <a
                      className="dp-btn dp-primary"
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
                      <span className="dp-shine" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="dp-disabled">
                      <IconWarn /> PDF non disponibile
                    </span>
                  )}
                </div>
              </article>
            ))}
        </div>
      </section>
    </main>
  );
}

/* ---------------- Icons (sobrie) ---------------- */
function IconSearch() {
  return (
    <span className="dp-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}
function IconSort() {
  return (
    <span className="dp-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M8 7h10M8 12h7M8 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M6 6v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}
function IconTag() {
  return (
    <span className="dp-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M20 13l-7 7-10-10V3h7l10 10Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M7.5 7.5h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </span>
  );
}
function IconBook() {
  return (
    <span className="dp-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2V5a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M8 7h8M8 10h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}
function IconFile() {
  return (
    <span className="dp-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-6Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M8 13h8M8 17h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}
function IconClock() {
  return (
    <span className="dp-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}
function IconPages() {
  return (
    <span className="dp-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M7 7h10M7 11h10M7 15h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path
          d="M6 3h9l3 3v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
function IconInfo() {
  return (
    <span className="dp-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 10v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 7h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </span>
  );
}
function IconWarn() {
  return (
    <span className="dp-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 9v4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path d="M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path
          d="M10.3 4.6a2 2 0 0 1 3.4 0l8.2 14.2A2 2 0 0 1 20.2 22H3.8a2 2 0 0 1-1.7-3.2l8.2-14.2Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/* ---------------- CSS (tool page premium, non-home) ---------------- */
const css = `
:root{
  --dino2:#16a34a;
  --med2:#0ea5e9;
  --ink: rgba(15,23,42,0.92);
  --ink2: rgba(15,23,42,0.72);
  --bd: rgba(15,23,42,0.10);
  --shadow2: 0 12px 28px rgba(2,6,23,0.08);
}

.dp{ max-width: 1120px; margin: 0 auto; padding: 22px; }

.dp-ico{ width:18px; height:18px; display:inline-grid; place-items:center; }
.dp-ico svg{ width:18px; height:18px; }
.dp-grad{
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  -webkit-background-clip:text;
  background-clip:text;
  color: transparent;
}

/* Top section */
.dp-top{ margin-bottom: 14px; }
.dp-topInner{
  display:grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
.dp-kicker{
  display:inline-flex;
  align-items:center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid var(--bd);
  background: rgba(255,255,255,0.78);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
  font-weight: 950;
  color: rgba(15,23,42,0.82);
  width: fit-content;
}
.dp-dot{
  width: 10px; height: 10px; border-radius: 999px;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  box-shadow: 0 10px 20px rgba(2,6,23,0.10);
}
.dp-brand{ display:inline-flex; gap: 0; }
.dp-dino{ color: var(--dino2); font-weight: 1000; }
.dp-med{ color: var(--med2); font-weight: 1000; }
.dp-sep{ opacity:.55; }
.dp-tagline{ font-weight: 950; }

.dp-help{
  display:flex;
  gap: 10px;
  align-items:flex-start;
  padding: 12px 14px;
  border-radius: 18px;
  border: 1px solid var(--bd);
  background: rgba(255,255,255,0.86);
  box-shadow: var(--shadow2);
  color: rgba(15,23,42,0.78);
  font-weight: 850;
}
.dp-helpIcon{ margin-top: 2px; color: rgba(14,165,233,0.9); }
.dp-helpText b{ color: rgba(15,23,42,0.92); }

/* Hero (tool, not landing) */
.dp-hero{
  border-radius: 28px;
  border: 1px solid var(--bd);
  background:
    radial-gradient(700px 220px at 12% -25%, rgba(34,197,94,0.14), transparent 60%),
    radial-gradient(700px 220px at 70% -30%, rgba(56,189,248,0.14), transparent 55%),
    rgba(255,255,255,0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: var(--shadow2);
  overflow:hidden;
}
.dp-heroGrid{
  display:grid;
  grid-template-columns: 1.12fr .88fr;
  gap: 22px;
  padding: 22px;
  align-items: center;
}
@media (max-width: 980px){
  .dp-heroGrid{ grid-template-columns: 1fr; }
}

.dp-title{
  margin: 0 0 10px;
  font-size: 38px;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--ink);
  font-weight: 1000;
}
.dp-br{ display:none; }
@media (max-width: 520px){
  .dp-title{ font-size: 32px; }
  .dp-br{ display:block; }
}
.dp-sub{ margin: 0; color: var(--ink2); font-weight: 850; max-width: 72ch; }

.dp-stats{
  margin-top: 14px;
  display:grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: 10px;
}
@media (max-width: 520px){
  .dp-stats{ grid-template-columns: 1fr; }
}
.dp-stat{
  display:flex;
  gap: 10px;
  align-items:center;
  padding: 12px 12px;
  border-radius: 18px;
  border: 1px solid var(--bd);
  background: rgba(255,255,255,0.76);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
}
.dp-statIco{
  width: 40px; height: 40px;
  border-radius: 14px;
  display:grid; place-items:center;
  border: 1px solid rgba(15,23,42,0.08);
  background: linear-gradient(135deg, rgba(56,189,248,0.16), rgba(56,189,248,0.06));
  color: rgba(14,165,233,0.95);
}
.dp-statIco.isPdf{
  background: linear-gradient(135deg, rgba(34,197,94,0.14), rgba(34,197,94,0.06));
  color: rgba(22,163,74,0.95);
}
.dp-statIco.isTag{
  background: linear-gradient(135deg, rgba(16,185,129,0.14), rgba(16,185,129,0.06));
  color: rgba(5,150,105,0.95);
}
.dp-statIco.isClock{
  background: linear-gradient(135deg, rgba(99,102,241,0.14), rgba(99,102,241,0.06));
  color: rgba(79,70,229,0.95);
}
.dp-statTop{ font-weight: 900; color: rgba(15,23,42,0.62); font-size: 0.82rem; }
.dp-statVal{ margin-top: 2px; font-weight: 1000; color: rgba(15,23,42,0.92); font-size: 1.1rem; }

.dp-status{
  margin-top: 12px;
  font-weight: 850;
  color: rgba(15,23,42,0.70);
}
.dp-status.isErr{ color: #b91c1c; }
.dp-status.isOk b{ color: rgba(15,23,42,0.92); }

/* Visual */
.dp-visual{
  position: relative;
  border-radius: 22px;
  overflow:hidden;
  border: 1px solid var(--bd);
  background: rgba(255,255,255,0.92);
  box-shadow: var(--shadow2);
  height: 320px;
}
@media (max-width: 980px){ .dp-visual{ height: 240px; } }

.dp-img{
  width:100%; height:100%;
  object-fit: cover;
  display:block;
  transform: scale(1.02);
  filter: saturate(0.96) contrast(1.05);
}
.dp-overlay{
  position:absolute; inset:0;
  background: linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.34) 55%, rgba(255,255,255,0.88) 100%);
}

/* Filter bar */
.dp-fbar{ margin-top: 14px; }
.dp-frow{
  display:grid;
  grid-template-columns: 1.2fr .8fr .8fr;
  gap: 12px;
}
@media (max-width: 980px){
  .dp-frow{ grid-template-columns: 1fr; }
}
.dp-field{ display:flex; flex-direction:column; gap: 6px; }
.dp-label{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  font-weight: 950;
  color: rgba(15,23,42,0.76);
}
.dp-input, .dp-select{
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid var(--bd);
  background: rgba(255,255,255,0.92);
  font-weight: 900;
  color: rgba(15,23,42,0.86);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
}
.dp-input:focus, .dp-select:focus{
  outline: none;
  border-color: rgba(14,165,233,0.40);
}

.dp-toggles{
  margin-top: 10px;
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.dp-toggle{
  display:inline-flex;
  align-items:center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid var(--bd);
  background: rgba(255,255,255,0.86);
  font-weight: 950;
  color: rgba(15,23,42,0.82);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
  cursor:pointer;
}
.dp-toggle.isOn{
  border-color: rgba(34,197,94,0.35);
  background: linear-gradient(135deg, rgba(34,197,94,0.12), rgba(56,189,248,0.12));
}
.dp-toggleIco{ color: rgba(14,165,233,0.95); }

.dp-hint{
  display:inline-flex;
  align-items:center;
  gap: 10px;
  font-weight: 900;
  color: rgba(15,23,42,0.68);
}
.dp-hintDot{
  width: 10px; height: 10px; border-radius: 999px;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
}

/* Grid cards */
.dp-section{ margin-top: 16px; }
.dp-grid{
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
@media (max-width: 980px){ .dp-grid{ grid-template-columns: 1fr; } }

.dp-card{
  border-radius: 24px;
  border: 1px solid var(--bd);
  background:
    radial-gradient(520px 220px at 30% -10%, rgba(34,197,94,0.10), transparent 60%),
    radial-gradient(520px 220px at 80% -10%, rgba(56,189,248,0.10), transparent 60%),
    rgba(255,255,255,0.92);
  box-shadow: 0 14px 52px rgba(2,6,23,0.08);
  padding: 18px;
  color: rgba(15,23,42,0.88);
}

.dp-cardTop{
  display:flex;
  justify-content: space-between;
  align-items:center;
  gap: 10px;
  margin-bottom: 10px;
}

.dp-badge{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid var(--bd);
  background: rgba(255,255,255,0.76);
  font-weight: 950;
  color: rgba(15,23,42,0.78);
}
.dp-meta{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  font-weight: 900;
  color: rgba(15,23,42,0.62);
  font-size: 0.9rem;
}

.dp-cardTitle{
  font-weight: 1000;
  color: rgba(15,23,42,0.92);
  letter-spacing: -0.01em;
  font-size: 1.05rem;
}

.dp-cardText{
  margin-top: 8px;
  font-weight: 850;
  color: rgba(15,23,42,0.72);
  line-height: 1.35;
}

.dp-cardCtaRow{ margin-top: 14px; display:flex; align-items:center; gap: 12px; flex-wrap: wrap; }

.dp-btn{
  position: relative;
  overflow: hidden;
  display:inline-flex;
  align-items:center;
  gap: 10px;
  padding: 13px 16px;
  border-radius: 999px;
  text-decoration:none;
  font-weight: 1000;
  border: 1px solid var(--bd);
  box-shadow: 0 14px 30px rgba(2,6,23,0.10);
  transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
  color: rgba(15,23,42,0.86);
  background: rgba(255,255,255,0.72);
}
.dp-btn:hover{ transform: translateY(-1px); box-shadow: 0 18px 40px rgba(2,6,23,0.14); filter: saturate(1.03); }

.dp-primary{
  color:white;
  border: 1px solid rgba(255,255,255,0.18);
  background: linear-gradient(90deg, var(--dino2), var(--med2));
}

.dp-shine{
  position:absolute; inset:0;
  background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.26) 25%, transparent 50%);
  transform: translateX(-120%);
  animation: dpShine 4.2s ease-in-out infinite;
  pointer-events: none;
}
@keyframes dpShine{
  0%, 58% { transform: translateX(-120%); }
  88%, 100% { transform: translateX(120%); }
}

.dp-disabled{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  font-weight: 900;
  color: rgba(15,23,42,0.60);
}

.dp-empty{
  grid-column: 1 / -1;
  border-radius: 24px;
  border: 1px solid var(--bd);
  background: rgba(255,255,255,0.92);
  box-shadow: var(--shadow2);
  padding: 18px;
  font-weight: 900;
  color: rgba(15,23,42,0.72);
}
`;