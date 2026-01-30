import React, { useEffect, useMemo, useState } from "react";
import { getFilesList } from "../api";

function humanizeFilename(name = "") {
  const base = String(name).replace(/\.pdf$/i, "");
  return base
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function detectMateria(filename = "") {
  const s = String(filename).toLowerCase();
  if (s.includes("chim")) return "Chimica";
  if (s.includes("fis")) return "Fisica";
  if (s.includes("bio")) return "Biologia";
  return "Altro";
}

function sortLabel(sort) {
  if (sort === "az") return "Titolo (A→Z)";
  if (sort === "za") return "Titolo (Z→A)";
  return "Più recenti (lista)";
}

function Icon({ name = "doc", size = 18 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none" };
  if (name === "search") {
    return (
      <svg {...common}>
        <path
          d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M16.5 16.5 21 21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (name === "doc") {
    return (
      <svg {...common}>
        <path
          d="M7 3h7l3 3v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M14 3v3h3" stroke="currentColor" strokeWidth="2" />
        <path
          d="M8 12h8M8 16h8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (name === "arrow") {
    return (
      <svg {...common}>
        <path
          d="M5 12h12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M13 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === "download") {
    return (
      <svg {...common}>
        <path
          d="M12 3v10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M8 10l4 4 4-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 21h14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path
        d="M4 6h16M4 12h16M4 18h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MateriaChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`dp-chip ${active ? "dp-chipOn" : ""}`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

export default function Dispense() {
  const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // UI state
  const [q, setQ] = useState("");
  const [materia, setMateria] = useState("Tutte");
  const [sort, setSort] = useState("recenti"); // recenti | az | za

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr("");
      try {
        const list = await getFilesList();
        setFiles(Array.isArray(list) ? list : []);
      } catch (e) {
        setErr(e?.message || "Errore nel caricamento delle dispense.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const dataset = useMemo(() => {
    return (files || []).map((filename) => ({
      filename,
      title: humanizeFilename(filename),
      materia: detectMateria(filename),
    }));
  }, [files]);

  const countsByMateria = useMemo(() => {
    const map = { Chimica: 0, Fisica: 0, Biologia: 0, Altro: 0 };
    for (const d of dataset) map[d.materia] = (map[d.materia] || 0) + 1;
    return map;
  }, [dataset]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    let arr = dataset.filter((d) => {
      if (materia !== "Tutte" && d.materia !== materia) return false;
      if (!s) return true;
      return (d.title + " " + d.filename + " " + d.materia).toLowerCase().includes(s);
    });

    if (sort === "az") arr = arr.slice().sort((a, b) => a.title.localeCompare(b.title, "it"));
    else if (sort === "za") arr = arr.slice().sort((a, b) => b.title.localeCompare(a.title, "it"));
    // recenti: manteniamo l’ordine che arriva dal backend
    return arr;
  }, [dataset, q, materia, sort]);

  function openPdf(filename) {
    window.open(`${API_BASE}/api/files/download/${encodeURIComponent(filename)}`, "_blank", "noreferrer");
  }

  return (
    <div className="container">
      <style>{css}</style>

      {/* Navbar (coerente con Home) */}
      <nav className="top-nav">
        <div className="brand">
          <img src="/logo-full.png" alt="DinoMed Logo" className="logo-img" />
        </div>

        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/dispense" style={{ fontWeight: 900 }}>Dispense</a>
          <a href="/simulazioni">Simulazioni</a>
        </div>

        <a href="/simulazioni" className="cta-btn">Inizia</a>
      </nav>

      {/* Hero */}
      <section className="dp-hero">
        <div className="dp-heroLeft">
          <div className="dp-kicker">DinoMed • Dispense</div>
          <h1 className="dp-title">Dispense chiare. Zero caos.</h1>
          <p className="dp-sub">
            Scarica e apri i PDF quando ti servono. Cerca per parola chiave o filtra per materia.
          </p>

          <div className="dp-controls">
            <div className="dp-search">
              <span className="dp-ic" aria-hidden="true">
                <Icon name="search" size={18} />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cerca: acidi-basi, stechiometria, moto, DNA..."
                className="dp-input"
              />
            </div>

            <div className="dp-row">
              <div className="dp-chips">
                <MateriaChip
                  label={`Tutte (${dataset.length})`}
                  active={materia === "Tutte"}
                  onClick={() => setMateria("Tutte")}
                />
                <MateriaChip
                  label={`Chimica (${countsByMateria.Chimica || 0})`}
                  active={materia === "Chimica"}
                  onClick={() => setMateria("Chimica")}
                />
                <MateriaChip
                  label={`Fisica (${countsByMateria.Fisica || 0})`}
                  active={materia === "Fisica"}
                  onClick={() => setMateria("Fisica")}
                />
                <MateriaChip
                  label={`Biologia (${countsByMateria.Biologia || 0})`}
                  active={materia === "Biologia"}
                  onClick={() => setMateria("Biologia")}
                />
                <MateriaChip
                  label={`Altro (${countsByMateria.Altro || 0})`}
                  active={materia === "Altro"}
                  onClick={() => setMateria("Altro")}
                />
              </div>

              <div className="dp-sortWrap">
                <span className="dp-sortLbl">Ordina:</span>
                <select className="dp-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="recenti">Più recenti (lista)</option>
                  <option value="az">Titolo (A→Z)</option>
                  <option value="za">Titolo (Z→A)</option>
                </select>
              </div>
            </div>

            <div className="dp-meta">
              <span className="dp-pill">
                <b>{filtered.length}</b> risultati • {sortLabel(sort)}
              </span>
            </div>
          </div>
        </div>

        {/* Hero visual */}
        <div className="dp-heroRight" aria-hidden="true">
          <div className="dp-visualCard">
            <div className="dp-visualTop">
              <div className="dp-visualBadge">
                <Icon name="doc" size={16} /> PDF pronti
              </div>
              <div className="dp-visualBadge dp-visualBadge2">
                <Icon name="arrow" size={16} /> Apri / scarica
              </div>
            </div>

            <div className="dp-visualBody">
              <div className="dp-visualBig">📚</div>
              <div className="dp-visualText">
                Organizzate per materia, facili da trovare.
              </div>
            </div>

            <div className="dp-visualFooter">
              <div className="dp-miniStat">
                <div className="dp-miniK">Totali</div>
                <div className="dp-miniV">{dataset.length}</div>
              </div>
              <div className="dp-miniStat">
                <div className="dp-miniK">Chimica</div>
                <div className="dp-miniV">{countsByMateria.Chimica || 0}</div>
              </div>
              <div className="dp-miniStat">
                <div className="dp-miniK">Fisica</div>
                <div className="dp-miniV">{countsByMateria.Fisica || 0}</div>
              </div>
              <div className="dp-miniStat">
                <div className="dp-miniK">Bio</div>
                <div className="dp-miniV">{countsByMateria.Biologia || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* States */}
      {err ? (
        <div className="dp-alert">
          <b>⚠️ Errore</b>
          <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{err}</div>
        </div>
      ) : null}

      {loading ? (
        <div className="dp-skelGrid">
          <div className="dp-skelCard" />
          <div className="dp-skelCard" />
          <div className="dp-skelCard" />
          <div className="dp-skelCard" />
          <div className="dp-skelCard" />
          <div className="dp-skelCard" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="dp-empty">
          <div className="dp-emptyTitle">Nessuna dispensa trovata.</div>
          <div className="dp-emptyText">
            Prova a cambiare materia oppure cerca con una parola diversa.
          </div>
        </div>
      ) : (
        <section className="dp-grid">
          {filtered.map((d) => (
            <article key={d.filename} className="dp-card">
              <div className="dp-cardTop">
                <div className={`dp-icBox dp-icBox-${d.materia}`}>
                  <Icon name="doc" size={18} />
                </div>
                <div className="dp-cardHead">
                  <div className="dp-cardTitle" title={d.title}>{d.title}</div>
                  <div className="dp-cardSub">
                    <span className={`dp-badge dp-badge-${d.materia}`}>{d.materia}</span>
                    <span className="dp-soft">•</span>
                    <span className="dp-softMono">{d.filename}</span>
                  </div>
                </div>
              </div>

              <div className="dp-actions">
                <button className="dp-btn dp-btnPrimary" type="button" onClick={() => openPdf(d.filename)}>
                  Apri PDF <span className="dp-btnIcon"><Icon name="arrow" size={18} /></span>
                </button>

                <a
                  className="dp-btn dp-btnGhost"
                  href={`${API_BASE}/api/files/download/${encodeURIComponent(d.filename)}`}
                  download
                >
                  Scarica <span className="dp-btnIcon"><Icon name="download" size={18} /></span>
                </a>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

const css = `
/* ===== Layout page ===== */
.dp-hero{
  margin-top: 18px;
  border-radius: 22px;
  border: 1px solid rgba(0,0,0,0.08);
  background: white;
  padding: 18px;
  display: grid;
  grid-template-columns: 1.2fr .8fr;
  gap: 14px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 18px 55px rgba(15,23,42,0.06);
}
.dp-hero:before{
  content:"";
  position:absolute;
  inset:-160px -180px auto auto;
  width: 520px;
  height: 520px;
  background: radial-gradient(circle at 30% 30%, rgba(0,166,118,0.18), rgba(28,140,255,0.14), rgba(255,255,255,0));
  transform: rotate(10deg);
  pointer-events:none;
}
@media (max-width: 980px){
  .dp-hero{ grid-template-columns: 1fr; }
  .dp-heroRight{ display:none; }
}

.dp-heroLeft{ position: relative; }
.dp-kicker{
  display:inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(0,166,118,0.25);
  background: rgba(0,166,118,0.08);
  font-weight: 900;
}
.dp-title{
  margin: 10px 0 6px;
  font-size: 34px;
  line-height: 1.05;
}
.dp-sub{
  margin: 0;
  color: rgba(15,23,42,0.70);
  font-weight: 650;
  max-width: 75ch;
}

.dp-controls{ margin-top: 14px; display: grid; gap: 10px; }
.dp-search{
  display:flex; align-items:center; gap: 10px;
  border-radius: 16px;
  border: 1px solid rgba(0,0,0,0.10);
  background: rgba(255,255,255,0.95);
  padding: 10px 12px;
  box-shadow: 0 10px 25px rgba(15,23,42,0.06);
}
.dp-ic{ color: rgba(15,23,42,0.55); display:grid; place-items:center; }
.dp-input{
  width: 100%;
  border: 0;
  outline: none;
  font-weight: 750;
  font-size: 14px;
  background: transparent;
}
.dp-row{
  display:flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.dp-chips{ display:flex; gap: 8px; flex-wrap:wrap; }
.dp-chip{
  padding: 9px 12px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,0.12);
  background: rgba(255,255,255,0.95);
  cursor: pointer;
  font-weight: 800;
  transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease;
}
.dp-chip:hover{
  transform: translateY(-1px);
  box-shadow: 0 14px 35px rgba(15,23,42,0.08);
  border-color: rgba(28,140,255,0.25);
}
.dp-chipOn{
  background: rgba(28,140,255,0.08);
  border-color: rgba(28,140,255,0.26);
}
.dp-sortWrap{ display:flex; gap: 8px; align-items:center; }
.dp-sortLbl{ font-weight: 800; color: rgba(15,23,42,0.60); font-size: 12px; }
.dp-select{
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(0,0,0,0.12);
  background: white;
  font-weight: 850;
  outline: none;
}

.dp-meta{ display:flex; gap: 8px; flex-wrap:wrap; }
.dp-pill{
  display:inline-flex; gap: 8px; align-items:center;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,0.10);
  background: rgba(15,23,42,0.03);
  font-weight: 850;
  color: rgba(15,23,42,0.75);
}

/* ===== Right visual ===== */
.dp-heroRight{ position: relative; display:grid; align-items: stretch; }
.dp-visualCard{
  border-radius: 20px;
  border: 1px solid rgba(0,0,0,0.08);
  background: linear-gradient(180deg, rgba(28,140,255,0.06), rgba(255,255,255,0.95));
  box-shadow: 0 18px 55px rgba(15,23,42,0.06);
  padding: 14px;
  display:flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow: hidden;
}
.dp-visualCard:before{
  content:"";
  position:absolute;
  inset:auto -120px -120px auto;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle at 30% 30%, rgba(0,166,118,0.20), rgba(255,255,255,0));
  transform: rotate(-10deg);
}
.dp-visualTop{ display:flex; gap: 10px; flex-wrap: wrap; position: relative; }
.dp-visualBadge{
  display:inline-flex; gap: 8px; align-items:center;
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,0.10);
  background: rgba(255,255,255,0.85);
  font-weight: 900;
}
.dp-visualBadge2{
  border-color: rgba(0,166,118,0.25);
  background: rgba(0,166,118,0.08);
}
.dp-visualBody{ position: relative; padding: 6px 2px; }
.dp-visualBig{ font-size: 40px; line-height: 1; }
.dp-visualText{ margin-top: 8px; font-weight: 850; color: rgba(15,23,42,0.72); }

.dp-visualFooter{
  position: relative;
  display:grid;
  grid-template-columns: repeat(4, minmax(0,1fr));
  gap: 10px;
}
.dp-miniStat{
  border-radius: 16px;
  border: 1px solid rgba(0,0,0,0.08);
  background: rgba(255,255,255,0.85);
  padding: 10px;
}
.dp-miniK{ font-size: 12px; color: rgba(15,23,42,0.55); font-weight: 900; }
.dp-miniV{ margin-top: 4px; font-size: 18px; font-weight: 950; }

/* ===== Alerts / Empty / Skeleton ===== */
.dp-alert{
  margin-top: 12px;
  border-radius: 16px;
  border: 1px solid rgba(239,68,68,0.30);
  background: rgba(239,68,68,0.08);
  padding: 12px;
  font-weight: 800;
}
.dp-empty{
  margin-top: 12px;
  border-radius: 18px;
  border: 1px solid rgba(0,0,0,0.08);
  background: white;
  padding: 16px;
  box-shadow: 0 18px 55px rgba(15,23,42,0.06);
}
.dp-emptyTitle{ font-weight: 950; font-size: 16px; }
.dp-emptyText{ margin-top: 6px; color: rgba(15,23,42,0.65); font-weight: 750; }

.dp-skelGrid{
  margin-top: 14px;
  display:grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
@media (max-width: 980px){ .dp-skelGrid{ grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 620px){ .dp-skelGrid{ grid-template-columns: 1fr; } }
.dp-skelCard{
  height: 170px;
  border-radius: 18px;
  border: 1px solid rgba(0,0,0,0.08);
  background: linear-gradient(90deg, rgba(15,23,42,0.04), rgba(15,23,42,0.07), rgba(15,23,42,0.04));
  background-size: 200% 100%;
  animation: dpShimmer 1.1s infinite linear;
}
@keyframes dpShimmer{
  0%{ background-position: 0% 0; }
  100%{ background-position: 200% 0; }
}

/* ===== Cards grid ===== */
.dp-grid{
  margin-top: 14px;
  display:grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0,1fr));
}
@media (max-width: 980px){ .dp-grid{ grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (max-width: 620px){ .dp-grid{ grid-template-columns: 1fr; } }

.dp-card{
  border-radius: 18px;
  border: 1px solid rgba(0,0,0,0.08);
  background: white;
  box-shadow: 0 14px 40px rgba(15,23,42,0.06);
  padding: 12px;
  display:flex;
  flex-direction: column;
  gap: 12px;
  transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease;
}
.dp-card:hover{
  transform: translateY(-2px);
  box-shadow: 0 20px 60px rgba(15,23,42,0.10);
  border-color: rgba(28,140,255,0.22);
}
.dp-cardTop{ display:flex; gap: 10px; align-items:flex-start; }
.dp-icBox{
  width: 40px; height: 40px;
  display:grid; place-items:center;
  border-radius: 14px;
  border: 1px solid rgba(28,140,255,0.18);
  background: rgba(28,140,255,0.06);
  color: rgba(28,140,255,0.95);
  flex: 0 0 auto;
}
.dp-icBox-Chimica{ border-color: rgba(0,166,118,0.22); background: rgba(0,166,118,0.08); color: rgba(0,166,118,1); }
.dp-icBox-Fisica{ border-color: rgba(28,140,255,0.22); background: rgba(28,140,255,0.08); color: rgba(28,140,255,1); }
.dp-icBox-Biologia{ border-color: rgba(99,102,241,0.22); background: rgba(99,102,241,0.08); color: rgba(99,102,241,1); }
.dp-icBox-Altro{ border-color: rgba(15,23,42,0.14); background: rgba(15,23,42,0.05); color: rgba(15,23,42,0.75); }

.dp-cardHead{ min-width: 0; }
.dp-cardTitle{
  font-weight: 950;
  font-size: 16px;
  color: rgba(15,23,42,0.92);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.dp-cardSub{
  margin-top: 5px;
  display:flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items:center;
}
.dp-badge{
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,0.10);
  background: rgba(15,23,42,0.03);
  font-weight: 900;
}
.dp-badge-Chimica{ border-color: rgba(0,166,118,0.25); background: rgba(0,166,118,0.08); }
.dp-badge-Fisica{ border-color: rgba(28,140,255,0.25); background: rgba(28,140,255,0.08); }
.dp-badge-Biologia{ border-color: rgba(99,102,241,0.25); background: rgba(99,102,241,0.08); }
.dp-badge-Altro{ border-color: rgba(15,23,42,0.14); background: rgba(15,23,42,0.04); }
.dp-soft{ color: rgba(15,23,42,0.35); font-weight: 900; }
.dp-softMono{
  color: rgba(15,23,42,0.55);
  font-weight: 800;
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono","Courier New", monospace;
}

.dp-actions{
  display:flex;
  gap: 10px;
  margin-top: auto;
}
.dp-btn{
  flex: 1;
  display:inline-flex;
  justify-content:center;
  align-items:center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  font-weight: 950;
  text-decoration: none;
  user-select: none;
  border: 1px solid rgba(0,0,0,0.10);
  cursor: pointer;
  background: white;
}
.dp-btnIcon{ display:grid; place-items:center; }
.dp-btnPrimary{
  background: rgba(28,140,255,0.10);
  border-color: rgba(28,140,255,0.24);
}
.dp-btnPrimary:hover{
  background: rgba(28,140,255,0.14);
}
.dp-btnGhost{
  background: rgba(0,166,118,0.08);
  border-color: rgba(0,166,118,0.22);
}
.dp-btnGhost:hover{
  background: rgba(0,166,118,0.12);
}
`;