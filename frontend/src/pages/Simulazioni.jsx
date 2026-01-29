import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import hero from "../assets/photos/hero-desk.jpg";
import imgCoding from "../assets/photos/coding.jpg";
import imgLab from "../assets/photos/lab.jpg";
import imgReading from "../assets/photos/reading.jpg";
import imgGraduation from "../assets/photos/graduation.jpg";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");

export default function Simulazioni() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });

  const [q, setQ] = useState("");
  const [materia, setMateria] = useState("Tutte");
  const [livello, setLivello] = useState("Tutti");

  useEffect(() => {
    let alive = true;

    async function load() {
      setStatus({ loading: true, error: "" });

      const endpoints = [`${API_BASE}/api/simulazioni`, `${API_BASE}/api/simulazioni/`];

      for (const url of endpoints) {
        try {
          const res = await fetch(url, { method: "GET" });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();

          if (!alive) return;

          const arr = Array.isArray(data) ? data : data?.items || data?.simulazioni || [];
          // se ci sono published, filtra; altrimenti mostra tutto
          const cleaned = arr
            .map(normalizeSim)
            .filter((x) => (typeof x.published === "boolean" ? x.published : true));

          setItems(cleaned);
          setStatus({ loading: false, error: "" });
          return;
        } catch (e) {
          // prova l’altro endpoint
        }
      }

      if (!alive) return;
      setStatus({
        loading: false,
        error: "Non riesco a caricare le simulazioni. Endpoint non trovato o backend non raggiungibile.",
      });
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const allMaterie = useMemo(() => {
    const set = new Set(items.map((x) => x.materia).filter(Boolean));
    return ["Tutte", ...Array.from(set).sort()];
  }, [items]);

  const allLivelli = useMemo(() => {
    const set = new Set(items.map((x) => x.livello).filter(Boolean));
    return ["Tutti", ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((x) => {
      if (materia !== "Tutte" && x.materia !== materia) return false;
      if (livello !== "Tutti" && x.livello !== livello) return false;

      if (!query) return true;
      const hay = `${x.titolo} ${x.descrizione} ${x.materia} ${x.livello} ${(x.tag || []).join(" ")}`.toLowerCase();
      return hay.includes(query);
    });
  }, [items, q, materia, livello]);

  return (
    <main className="sim-root">
      <style>{css}</style>

      {/* HERO */}
      <section className="sim-hero">
        <div className="sim-heroBg" style={{ backgroundImage: `url(${hero})` }} />
        <div className="sim-heroOverlay" />

        <div className="sim-heroInner">
          <div className="sim-pill animIn">
            <ShieldIcon />
            <span>Affidabile • Ordinato • Veloce</span>
          </div>

          <h1 className="sim-title animIn d1">
            Simulazioni <span className="sim-grad">premium</span>
          </h1>

          <p className="sim-sub animIn d2">
            Qui trovi tutte le simulazioni pubblicate dall’area admin. Cerca, filtra e inizia subito.
          </p>

          <div className="sim-controls animIn d3">
            <div className="sim-search">
              <SearchIcon />
              <input
                className="sim-input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cerca simulazioni (titolo, materia, tag...)"
              />
            </div>

            <div className="sim-filters">
              <select className="sim-select" value={materia} onChange={(e) => setMateria(e.target.value)}>
                {allMaterie.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <select className="sim-select" value={livello} onChange={(e) => setLivello(e.target.value)}>
                {allLivelli.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sim-metrics animIn d4">
            <Metric tone="blue" label="Struttura" value="Esame-like" icon={<GridIcon />} />
            <Metric tone="yellow" label="Studio" value="Concentrato" icon={<BookIcon />} />
            <Metric tone="cyan" label="Tempo" value="Controllato" icon={<BoltIcon />} />
          </div>
        </div>
      </section>

      {/* LIST */}
      <section className="sim-section">
        <div className="sim-sectionHead">
          <div>
            <h2 className="sim-h2">Elenco simulazioni</h2>
            <p className="sim-p">
              {status.loading
                ? "Caricamento..."
                : status.error
                ? status.error
                : `${filtered.length} simulazioni disponibili`}
            </p>
          </div>

          <div className="sim-miniHint">
            <span className="sim-dot" />
            <span>Le simulazioni vengono gestite dall’admin</span>
          </div>
        </div>

        {status.loading ? (
          <div className="sim-grid">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : status.error ? (
          <div className="sim-error">
            <div className="sim-errorIcon">⚠️</div>
            <div>
              <div className="sim-errorTitle">Errore caricamento</div>
              <div className="sim-errorText">
                Controlla che il backend sia avviato e che <code>VITE_API_BASE</code> punti al server giusto.
              </div>
              <div className="sim-errorText" style={{ marginTop: 8 }}>
                Ora: <code>{API_BASE}</code>
              </div>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="sim-grid">
            {filtered.map((s, idx) => (
              <SimCard key={s.id} sim={s} idx={idx} />
            ))}
          </div>
        )}
      </section>

      {/* FOOTER CTA */}
      <section className="sim-footer">
        <div className="sim-footerCard">
          <div className="sim-footerLeft">
            <div className="sim-badge">
              <TargetIcon />
              <span>Consiglio</span>
            </div>
            <div className="sim-footerTitle">Fai una simulazione → poi apri la dispensa giusta.</div>
            <div className="sim-footerText">
              Il metodo DinoMed è: prova, controlla, ripassa. Così migliori davvero.
            </div>
          </div>

          <div className="sim-footerRight">
            <Link to="/dispense" className="sim-btn sim-btnGhost sim-wide">
              Vai alle dispense
            </Link>
            <Link to="/admin" className="sim-btn sim-btnPrimary sim-wide">
              Area admin →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------- CARD ---------- */

function SimCard({ sim, idx }) {
  const cover = pickCover(sim, idx);
  const tags = (sim.tag || []).slice(0, 3);

  const content = (
    <>
      <div className="sim-cardCover" style={{ backgroundImage: `url(${cover})` }}>
        <div className="sim-cardShade" />
        <div className="sim-chipRow">
          {sim.materia ? <span className="sim-chip">{sim.materia}</span> : null}
          {sim.livello ? <span className="sim-chip sim-chipSoft">{sim.livello}</span> : null}
        </div>
      </div>

      <div className="sim-cardBody">
        <div className="sim-cardTitle">{sim.titolo}</div>
        <div className="sim-cardText">{sim.descrizione || "Simulazione disponibile."}</div>

        {tags.length ? (
          <div className="sim-tags">
            {tags.map((t) => (
              <span key={t} className="sim-tag">
                {t}
              </span>
            ))}
          </div>
        ) : (
          <div className="sim-tags sim-tagsMuted"> </div>
        )}

        <div className="sim-cardFooter">
          <span className="sim-kpi">
            <ClockIcon /> {sim.durataMin ? `${sim.durataMin} min` : "durata variabile"}
          </span>
          <span className="sim-open">Apri →</span>
        </div>
      </div>
    </>
  );

  // se c’è link (es. quiz esterno) → apri in nuova tab
  if (sim.link) {
    return (
      <a className="sim-card" href={sim.link} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }

  // altrimenti prova ad aprire una pagina simulazione
  return (
    <Link className="sim-card" to={`/simulazioni/${encodeURIComponent(sim.id)}`}>
      {content}
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="sim-card sim-skel">
      <div className="sim-skelCover" />
      <div className="sim-skelBody">
        <div className="sim-skelLine w60" />
        <div className="sim-skelLine w90" />
        <div className="sim-skelLine w80" />
        <div className="sim-skelPills">
          <div className="sim-skelPill" />
          <div className="sim-skelPill" />
          <div className="sim-skelPill" />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="sim-empty">
      <div className="sim-emptyIcon">🧪</div>
      <div className="sim-emptyTitle">Nessuna simulazione trovata</div>
      <div className="sim-emptyText">
        Se sei admin, vai nell’area riservata e pubblica la prima simulazione.
      </div>
      <div className="sim-emptyActions">
        <Link className="sim-btn sim-btnPrimary" to="/admin">
          Vai all’admin →
        </Link>
      </div>
    </div>
  );
}

/* ---------- METRIC ---------- */

function Metric({ label, value, icon, tone }) {
  return (
    <div className={`sim-metric sim-${tone}`}>
      <div className="sim-metricIcon">{icon}</div>
      <div>
        <div className="sim-metricLabel">{label}</div>
        <div className="sim-metricValue">{value}</div>
      </div>
    </div>
  );
}

/* ---------- NORMALIZE + COVER ---------- */

function normalizeSim(raw) {
  const id = raw.id || raw._id || raw.slug || raw.uuid || raw.titolo || cryptoFallbackId(raw);
  return {
    id: String(id),
    titolo: raw.titolo || raw.title || "Simulazione",
    descrizione: raw.descrizione || raw.description || "",
    materia: raw.materia || raw.subject || "",
    livello: raw.livello || raw.level || "",
    tag: Array.isArray(raw.tag) ? raw.tag : Array.isArray(raw.tags) ? raw.tags : [],
    durataMin: raw.durataMin || raw.durata || raw.minutes || null,
    link: raw.link || raw.url || "",
    published: typeof raw.published === "boolean" ? raw.published : undefined,
  };
}

function cryptoFallbackId(raw) {
  try {
    const str = JSON.stringify(raw);
    let h = 0;
    for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i);
    return `sim-${Math.abs(h)}`;
  } catch {
    return `sim-${Date.now()}`;
  }
}

function pickCover(sim, idx) {
  const m = (sim.materia || "").toLowerCase();
  if (m.includes("chim")) return imgLab;
  if (m.includes("bio")) return imgReading;
  if (m.includes("fis")) return imgCoding;
  const pool = [imgCoding, imgLab, imgReading, imgGraduation];
  return pool[idx % pool.length];
}

/* ---------- ICONS ---------- */

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M10 2a8 8 0 105.3 14l4.4 4.4 1.4-1.4-4.4-4.4A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z"
        fill="currentColor"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M12 2l8 4v6c0 5-3.5 9.4-8 10-4.5-.6-8-5-8-10V6l8-4z" fill="currentColor" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" fill="currentColor" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M4 4h10a2 2 0 012 2v14H6a2 2 0 01-2-2V4zm14 2h2v14h-2V6z" fill="currentColor" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" fill="currentColor" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 5h-2v6l5 3 1-1.7-4-2.3V7z"
        fill="currentColor"
      />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M12 2a10 10 0 1010 10h-2a8 8 0 11-8-8V2zm6 10a6 6 0 11-6-6v2a4 4 0 104 4h2z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ---------- CSS ---------- */

const css = `
.sim-root{
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 20px 48px;
}

.sim-hero{
  position: relative;
  border-radius: 32px;
  overflow: hidden;
  border: 1px solid rgba(15,23,42,0.10);
  box-shadow: 0 30px 90px rgba(15,23,42,0.14);
}
.sim-heroBg{
  position:absolute;
  inset:0;
  background-size: cover;
  background-position: center;
  filter: saturate(0.85) contrast(0.95);
  transform: scale(1.05);
}
.sim-heroOverlay{
  position:absolute;
  inset:0;
  background:
    radial-gradient(circle at 20% 20%, rgba(255,255,255,0.92), rgba(255,255,255,0.68) 45%, rgba(255,255,255,0.38) 70%),
    linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.78));
}
.sim-heroInner{
  position: relative;
  padding: 34px 28px;
  max-width: 900px;
}

.sim-pill{
  display:inline-flex;
  align-items:center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid rgba(16,185,129,0.30);
  background: rgba(16,185,129,0.12);
  color: rgba(15,23,42,0.88);
  font-weight: 950;
}

.sim-title{
  margin: 14px 0 8px 0;
  font-size: 48px;
  line-height: 1.04;
  letter-spacing: -1px;
  color: rgba(15,23,42,0.94);
}
.sim-grad{
  background: linear-gradient(90deg, #10b981, #2563eb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.sim-sub{
  margin: 0;
  margin-top: 10px;
  max-width: 70ch;
  color: rgba(15,23,42,0.70);
  font-weight: 800;
  line-height: 1.45;
  font-size: 17px;
}

/* controls */
.sim-controls{
  margin-top: 18px;
  display:flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}
.sim-search{
  flex: 1;
  min-width: 260px;
  display:flex;
  align-items:center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(255,255,255,0.90);
  border: 1px solid rgba(15,23,42,0.12);
  box-shadow: 0 14px 45px rgba(15,23,42,0.08);
  color: rgba(15,23,42,0.75);
}
.sim-input{
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  font-weight: 850;
  color: rgba(15,23,42,0.92);
}
.sim-input::placeholder{ color: rgba(15,23,42,0.45); font-weight: 800; }

.sim-filters{
  display:flex;
  gap: 10px;
}
.sim-select{
  padding: 12px 14px;
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.12);
  background: rgba(255,255,255,0.90);
  font-weight: 900;
  color: rgba(15,23,42,0.86);
  box-shadow: 0 14px 45px rgba(15,23,42,0.08);
}

/* metrics */
.sim-metrics{
  margin-top: 18px;
  display:flex;
  gap: 12px;
  flex-wrap: wrap;
}
.sim-metric{
  display:flex;
  align-items:center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.76);
  box-shadow: 0 12px 40px rgba(15,23,42,0.08);
}
.sim-metricIcon{
  width: 38px;
  height: 38px;
  display:grid;
  place-items:center;
  border-radius: 14px;
  color: rgba(15,23,42,0.85);
}
.sim-metricLabel{
  font-weight: 900;
  color: rgba(15,23,42,0.70);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: .08em;
}
.sim-metricValue{
  font-weight: 1000;
  color: rgba(15,23,42,0.92);
}

/* metric tones */
.sim-blue .sim-metricIcon{ background: rgba(37,99,235,0.12); border: 1px solid rgba(37,99,235,0.25); }
.sim-yellow .sim-metricIcon{ background: rgba(234,179,8,0.18); border: 1px solid rgba(234,179,8,0.35); }
.sim-cyan .sim-metricIcon{ background: rgba(6,182,212,0.18); border: 1px solid rgba(6,182,212,0.35); }

/* section */
.sim-section{ margin-top: 18px; }
.sim-sectionHead{
  display:flex;
  align-items:flex-end;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 2px;
}
.sim-h2{
  margin: 0;
  font-size: 18px;
  font-weight: 1000;
  color: rgba(15,23,42,0.92);
}
.sim-p{
  margin: 8px 0 0 0;
  color: rgba(15,23,42,0.66);
  font-weight: 800;
}
.sim-miniHint{
  display:flex;
  align-items:center;
  gap: 10px;
  color: rgba(15,23,42,0.60);
  font-weight: 850;
}
.sim-dot{
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(16,185,129,0.9);
  box-shadow: 0 0 0 6px rgba(16,185,129,0.12);
}

/* grid cards */
.sim-grid{
  margin-top: 12px;
  display:grid;
  grid-template-columns: repeat(3, minmax(0,1fr));
  gap: 14px;
}
@media (max-width: 980px){
  .sim-grid{ grid-template-columns: 1fr; }
  .sim-title{ font-size: 42px; }
}

.sim-card{
  border-radius: 22px;
  overflow:hidden;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.92);
  box-shadow: 0 16px 55px rgba(15,23,42,0.06);
  text-decoration:none;
  color: inherit;
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}
.sim-card:hover{
  transform: translateY(-3px);
  box-shadow: 0 26px 95px rgba(15,23,42,0.14);
  border-color: rgba(37,99,235,0.22);
}
.sim-cardCover{
  position: relative;
  height: 150px;
  background-size: cover;
  background-position: center;
}
.sim-cardShade{
  position:absolute;
  inset:0;
  background: linear-gradient(180deg, rgba(15,23,42,0.10), rgba(15,23,42,0.45));
}
.sim-chipRow{
  position:absolute;
  left: 12px;
  right: 12px;
  bottom: 12px;
  display:flex;
  gap: 8px;
  flex-wrap: wrap;
}
.sim-chip{
  display:inline-flex;
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(255,255,255,0.38);
  font-weight: 950;
  color: rgba(15,23,42,0.86);
}
.sim-chipSoft{
  background: rgba(255,255,255,0.82);
  color: rgba(15,23,42,0.74);
}

.sim-cardBody{
  padding: 14px 14px 16px 14px;
  display:grid;
  gap: 8px;
}
.sim-cardTitle{
  font-weight: 1000;
  color: rgba(15,23,42,0.92);
}
.sim-cardText{
  color: rgba(15,23,42,0.68);
  font-weight: 800;
  line-height: 1.35;
  min-height: 44px;
}

.sim-tags{
  display:flex;
  gap: 8px;
  flex-wrap: wrap;
  min-height: 26px;
}
.sim-tag{
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(37,99,235,0.18);
  background: rgba(37,99,235,0.06);
  font-weight: 900;
  color: rgba(15,23,42,0.82);
}
.sim-tagsMuted{ opacity: .25; }

.sim-cardFooter{
  display:flex;
  align-items:center;
  justify-content: space-between;
  margin-top: 4px;
}
.sim-kpi{
  display:inline-flex;
  align-items:center;
  gap: 6px;
  font-weight: 900;
  color: rgba(15,23,42,0.70);
}
.sim-open{
  font-weight: 1000;
  color: rgba(37,99,235,0.95);
}

/* skeleton */
.sim-skel{ pointer-events:none; }
.sim-skelCover{
  height: 150px;
  background: linear-gradient(90deg, rgba(15,23,42,0.04), rgba(15,23,42,0.08), rgba(15,23,42,0.04));
  animation: shimmer 1.1s infinite linear;
}
.sim-skelBody{ padding: 14px; display:grid; gap: 10px; }
.sim-skelLine{
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(15,23,42,0.06), rgba(15,23,42,0.12), rgba(15,23,42,0.06));
  animation: shimmer 1.1s infinite linear;
}
.w60{ width: 60%; }
.w80{ width: 80%; }
.w90{ width: 90%; }
.sim-skelPills{ display:flex; gap: 8px; }
.sim-skelPill{
  width: 70px; height: 24px; border-radius: 999px;
  background: linear-gradient(90deg, rgba(37,99,235,0.08), rgba(37,99,235,0.14), rgba(37,99,235,0.08));
  animation: shimmer 1.1s infinite linear;
}
@keyframes shimmer{
  from{ background-position: 0 0; }
  to{ background-position: 220px 0; }
}

/* empty + error */
.sim-empty{
  margin-top: 12px;
  padding: 22px;
  border-radius: 22px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.92);
  box-shadow: 0 16px 55px rgba(15,23,42,0.06);
}
.sim-emptyIcon{ font-size: 26px; }
.sim-emptyTitle{ margin-top: 8px; font-weight: 1000; }
.sim-emptyText{ margin-top: 6px; color: rgba(15,23,42,0.68); font-weight: 800; }
.sim-emptyActions{ margin-top: 12px; }

.sim-error{
  margin-top: 12px;
  padding: 18px;
  border-radius: 22px;
  border: 1px solid rgba(244,63,94,0.18);
  background: rgba(244,63,94,0.06);
  display:flex;
  gap: 12px;
  align-items:flex-start;
}
.sim-errorIcon{ font-size: 20px; }
.sim-errorTitle{ font-weight: 1000; }
.sim-errorText{ color: rgba(15,23,42,0.74); font-weight: 800; }

/* footer */
.sim-footer{
  margin-top: 14px;
}
.sim-footerCard{
  border-radius: 26px;
  border: 1px solid rgba(15,23,42,0.10);
  background: linear-gradient(135deg, rgba(16,185,129,0.08), rgba(37,99,235,0.08));
  box-shadow: 0 16px 55px rgba(15,23,42,0.06);
  padding: 18px;
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.sim-badge{
  display:inline-flex;
  align-items:center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(16,185,129,0.28);
  background: rgba(16,185,129,0.12);
  font-weight: 950;
  color: rgba(15,23,42,0.88);
}
.sim-footerTitle{ margin-top: 10px; font-weight: 1000; }
.sim-footerText{ margin-top: 6px; color: rgba(15,23,42,0.68); font-weight: 800; }
.sim-footerRight{ display:grid; gap: 10px; }
.sim-btn{
  text-decoration:none;
  padding: 12px 16px;
  border-radius: 16px;
  font-weight: 950;
  text-align:center;
  user-select:none;
}
.sim-btnPrimary{
  background: rgba(15,23,42,0.92);
  color: white;
  box-shadow: 0 20px 60px rgba(15,23,42,0.20);
}
.sim-btnGhost{
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(15,23,42,0.14);
  color: rgba(15,23,42,0.86);
}
.sim-wide{ min-width: 220px; }

/* animations */
.animIn{ animation: in .7s ease-out both; }
.d1{ animation-delay: .06s; }
.d2{ animation-delay: .12s; }
.d3{ animation-delay: .18s; }
.d4{ animation-delay: .24s; }
@keyframes in{
  from{ opacity:0; transform: translateY(12px) }
  to{ opacity:1; transform: translateY(0) }
}
`;