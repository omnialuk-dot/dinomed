import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

/* ---------------- Icons (inline, zero dipendenze) ---------------- */
function Icon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none" };

  if (name === "chem") {
    return (
      <svg {...common}>
        <path d="M10 2v6l-5.5 9.2A3.5 3.5 0 0 0 7.5 22h9a3.5 3.5 0 0 0 3-4.8L14 8V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8.2 14h7.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "math") {
    return (
      <svg {...common}>
        <path d="M6 8h12M6 16h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M9 6l6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M15 6l-6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "bio") {
    return (
      <svg {...common}>
        <path d="M12 2c2 2 3 4 3 6a3 3 0 0 1-6 0c0-2 1-4 3-6Z" stroke="currentColor" strokeWidth="2" />
        <path d="M7 12c0 5 3 10 5 10s5-5 5-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 15h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "phys") {
    return (
      <svg {...common}>
        <path d="M12 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 9c2-3 6-4 8-4s6 1 8 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 15c2 3 6 4 8 4s6-1 8-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  // default
  return (
    <svg {...common}>
      <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function materiaIcon(materia = "") {
  const m = materia.toLowerCase();
  if (m.includes("chim")) return "chem";
  if (m.includes("mat")) return "math";
  if (m.includes("bio")) return "bio";
  if (m.includes("fis")) return "phys";
  return "doc";
}

function normalizeTag(s) {
  return String(s || "").trim().toLowerCase();
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

/* ---------------- Page ---------------- */
export default function Dispense() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // UX states
  const [query, setQuery] = useState("");
  const [materia, setMateria] = useState("Tutte");
  const [tag, setTag] = useState("Tutti");
  const [sort, setSort] = useState("recenti"); // recenti | pagine | titolo

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`${API_BASE}/api/dispense`);
        if (!res.ok) {
          let detail = "";
          try {
            const j = await res.json();
            detail = j?.detail ? ` — ${JSON.stringify(j.detail)}` : "";
          } catch {}
          throw new Error(`Errore backend (${res.status})${detail}`);
        }
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e.message || "Errore: non riesco a caricare le dispense.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const allMaterie = useMemo(() => {
    const ms = items.map((x) => x.materia).filter(Boolean);
    return ["Tutte", ...uniq(ms)];
  }, [items]);

  const allTags = useMemo(() => {
    const ts = [];
    for (const x of items) {
      if (Array.isArray(x.tag)) ts.push(...x.tag);
    }
    const cleaned = uniq(ts.map((t) => String(t).trim()).filter(Boolean));
    cleaned.sort((a, b) => a.localeCompare(b, "it"));
    return ["Tutti", ...cleaned];
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let arr = items.filter((x) => {
      if (materia !== "Tutte" && (x.materia || "") !== materia) return false;
      if (tag !== "Tutti") {
        const tags = Array.isArray(x.tag) ? x.tag : [];
        const has = tags.some((t) => String(t).trim() === tag);
        if (!has) return false;
      }
      if (!q) return true;

      const blob = [
        x.titolo,
        x.descrizione,
        x.materia,
        x.aChiServe,
        Array.isArray(x.tag) ? x.tag.join(" ") : "",
        x.filename,
      ]
        .join(" ")
        .toLowerCase();

      return blob.includes(q);
    });

    // sort
    if (sort === "pagine") {
      arr = arr.slice().sort((a, b) => (b.pagine || 0) - (a.pagine || 0));
    } else if (sort === "titolo") {
      arr = arr.slice().sort((a, b) => String(a.titolo || "").localeCompare(String(b.titolo || ""), "it"));
    } else {
      // recenti (created_at desc if available)
      arr = arr.slice().sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
    }

    return arr;
  }, [items, query, materia, tag, sort]);

  const featured = useMemo(() => {
    // “sezione curata” in alto: massimo 3 dispense più recenti
    return filtered.slice(0, 3);
  }, [filtered]);

  const rest = useMemo(() => filtered.slice(3), [filtered]);

  return (
    <main className="dm-page">
      <style>{css}</style>

      {/* Hero */}
      <section className="dm-hero">
        <div className="dm-heroTop">
          <div className="dm-kicker">DinoMad • Dispense</div>
          <h1 className="dm-title">Dispense fatte per farti capire davvero.</h1>
          <p className="dm-sub">
            Niente caos, niente “blog”. Qui trovi schede chiare, tag utili e PDF pronti quando servono.
          </p>
        </div>

        {/* Controls */}
        <div className="dm-controls">
          <div className="dm-search">
            <span className="dm-searchIcon">⌕</span>
            <input
              className="dm-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca: acidi, equilibrio, limiti, cinetica..."
            />
          </div>

          <div className="dm-filters">
            <select className="dm-select" value={materia} onChange={(e) => setMateria(e.target.value)}>
              {allMaterie.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <select className="dm-select" value={tag} onChange={(e) => setTag(e.target.value)}>
              {allTags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select className="dm-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="recenti">Più recenti</option>
              <option value="pagine">Più pagine</option>
              <option value="titolo">Titolo (A→Z)</option>
            </select>
          </div>

          <div className="dm-metaRow">
            <span className="dm-pill">
              <b>{filtered.length}</b> risultati
            </span>
            <span className="dm-pill dm-muted">
              API: <span className="dm-mono">{API_BASE}</span>
            </span>
          </div>
        </div>
      </section>

      {/* States */}
      {err ? (
        <div className="dm-alert">
          <b>⚠️ Errore</b>
          <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{err}</div>
        </div>
      ) : null}

      {loading ? (
        <div className="dm-skeletonWrap">
          <div className="dm-skeletonCard" />
          <div className="dm-skeletonCard" />
          <div className="dm-skeletonCard" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="dm-empty">
          <div className="dm-emptyTitle">Nessuna dispensa trovata.</div>
          <div className="dm-emptyText">
            Prova a cambiare filtro o scrivere una parola chiave diversa.
          </div>
        </div>
      ) : (
        <>
          {/* Featured */}
          <section className="dm-section">
            <div className="dm-sectionHead">
              <h2 className="dm-h2">In evidenza</h2>
              <div className="dm-sectionHint">Le più recenti (e spesso le più utili per iniziare).</div>
            </div>

            <div className="dm-grid dm-gridFeatured">
              {featured.map((d) => (
                <DispensaCard key={d.id} d={d} featured />
              ))}
            </div>
          </section>

          {/* Rest */}
          <section className="dm-section">
            <div className="dm-sectionHead">
              <h2 className="dm-h2">Tutte le dispense</h2>
              <div className="dm-sectionHint">Filtra per materia o tag e vai dritto al punto.</div>
            </div>

            <div className="dm-grid">
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

function DispensaCard({ d, featured = false }) {
  const iconName = materiaIcon(d.materia);
  const tags = Array.isArray(d.tag) ? d.tag : [];
  const hasPdf = !!d.file_url;

  return (
    <article className={`dm-card ${featured ? "dm-cardFeatured" : ""}`}>
      <div className="dm-cardTop">
        <div className="dm-icWrap" aria-hidden="true">
          <Icon name={iconName} size={18} />
        </div>

        <div className="dm-cardTitleWrap">
          <div className="dm-cardTitle">{d.titolo}</div>
          <div className="dm-cardSub">
            <span className="dm-badge">{d.materia || "Altro"}</span>
            <span className="dm-dot">•</span>
            <span className="dm-soft">{d.pagine || 0} pag.</span>
          </div>
        </div>
      </div>

      <div className="dm-cardBody">
        {d.aChiServe ? (
          <div className="dm-line">
            <span className="dm-lineLabel">A chi serve:</span>
            <span className="dm-lineText">{d.aChiServe}</span>
          </div>
        ) : null}

        {d.descrizione ? <div className="dm-desc">{d.descrizione}</div> : null}

        {tags.length > 0 ? (
          <div className="dm-tags">
            {tags.slice(0, 6).map((t, idx) => (
              <span key={`${d.id}-t-${idx}`} className={`dm-tag ${normalizeTag(t).length > 10 ? "dm-tagWide" : ""}`}>
                {t}
              </span>
            ))}
            {tags.length > 6 ? <span className="dm-tag dm-tagMore">+{tags.length - 6}</span> : null}
          </div>
        ) : null}
      </div>

      <div className="dm-cardActions">
        {hasPdf ? (
          <a className="dm-btn dm-btnPrimary" href={d.file_url} target="_blank" rel="noreferrer">
            Apri PDF <span className="dm-arrow">→</span>
          </a>
        ) : (
          <span className="dm-btn dm-btnGhost" title="Carica un PDF dall'admin (filename) per abilitarlo">
            PDF non disponibile
          </span>
        )}
      </div>
    </article>
  );
}

/* ---------------- CSS (premium, app-like, hover) ---------------- */
const css = `
.dm-page{
  padding: 18px;
  max-width: 1100px;
  margin: 0 auto;
}

.dm-hero{
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.92);
  border-radius: 22px;
  padding: 18px;
  box-shadow: 0 18px 55px rgba(15,23,42,0.06);
  overflow: hidden;
  position: relative;
}
.dm-hero:before{
  content:"";
  position:absolute;
  inset:-120px -160px auto auto;
  width: 360px;
  height: 360px;
  background: radial-gradient(circle at 30% 30%, rgba(37,99,235,0.18), rgba(16,185,129,0.12), rgba(255,255,255,0));
  filter: blur(0px);
  transform: rotate(12deg);
}
.dm-heroTop{ position: relative; }
.dm-kicker{
  display:inline-flex;
  font-weight: 950;
  letter-spacing: .2px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(37,99,235,0.06);
  border: 1px solid rgba(37,99,235,0.14);
  color: rgba(15,23,42,0.85);
}
.dm-title{
  margin: 10px 0 6px 0;
  font-size: 34px;
  line-height: 1.08;
}
.dm-sub{
  margin: 0;
  color: rgba(15,23,42,0.68);
  font-weight: 750;
  max-width: 70ch;
}

.dm-controls{
  position: relative;
  margin-top: 14px;
  display: grid;
  gap: 10px;
}
.dm-search{
  display:flex;
  align-items:center;
  gap: 10px;
  background: white;
  border: 1px solid rgba(15,23,42,0.14);
  border-radius: 16px;
  padding: 10px 12px;
  box-shadow: 0 10px 25px rgba(15,23,42,0.05);
}
.dm-searchIcon{
  font-weight: 950;
  color: rgba(15,23,42,0.55);
}
.dm-input{
  width: 100%;
  border: 0;
  outline: none;
  font-weight: 850;
  font-size: 14px;
}
.dm-filters{
  display:flex;
  gap: 10px;
  flex-wrap: wrap;
}
.dm-select{
  flex: 1;
  min-width: 180px;
  border-radius: 14px;
  padding: 10px 12px;
  border: 1px solid rgba(15,23,42,0.14);
  background: white;
  font-weight: 900;
  color: rgba(15,23,42,0.85);
  outline: none;
}
.dm-metaRow{
  display:flex;
  gap: 8px;
  flex-wrap: wrap;
}
.dm-pill{
  display:inline-flex;
  gap: 6px;
  align-items:center;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.12);
  background: rgba(15,23,42,0.03);
  font-weight: 900;
  color: rgba(15,23,42,0.82);
}
.dm-muted{ color: rgba(15,23,42,0.55); }
.dm-mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

.dm-alert{
  margin-top: 12px;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(239,68,68,0.35);
  background: rgba(239,68,68,0.08);
  font-weight: 800;
}

.dm-section{ margin-top: 16px; }
.dm-sectionHead{
  display:flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
  padding: 0 2px;
}
.dm-h2{
  margin: 0;
  font-size: 18px;
}
.dm-sectionHint{
  color: rgba(15,23,42,0.60);
  font-weight: 750;
}

.dm-grid{
  margin-top: 10px;
  display:grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.dm-gridFeatured{
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
@media (max-width: 980px){
  .dm-grid, .dm-gridFeatured{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dm-title{ font-size: 30px; }
}
@media (max-width: 620px){
  .dm-grid, .dm-gridFeatured{ grid-template-columns: 1fr; }
  .dm-title{ font-size: 28px; }
}

.dm-card{
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.92);
  box-shadow: 0 14px 40px rgba(15,23,42,0.06);
  padding: 12px;
  display:flex;
  flex-direction: column;
  gap: 10px;
  transform: translateY(0);
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}
.dm-card:hover{
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 20px 60px rgba(15,23,42,0.10);
  border-color: rgba(37,99,235,0.22);
}
.dm-cardFeatured{
  background: linear-gradient(180deg, rgba(37,99,235,0.06), rgba(255,255,255,0.92));
}

.dm-cardTop{
  display:flex;
  gap: 10px;
  align-items: center;
}
.dm-icWrap{
  width: 38px;
  height: 38px;
  display:grid;
  place-items:center;
  border-radius: 14px;
  border: 1px solid rgba(37,99,235,0.18);
  background: rgba(37,99,235,0.06);
  color: rgba(37,99,235,0.95);
}
.dm-cardTitleWrap{ min-width: 0; }
.dm-cardTitle{
  font-weight: 950;
  font-size: 16px;
  color: rgba(15,23,42,0.92);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.dm-cardSub{
  margin-top: 3px;
  display:flex;
  gap: 8px;
  align-items:center;
  flex-wrap: wrap;
}
.dm-badge{
  font-size: 12px;
  font-weight: 950;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.12);
  background: rgba(15,23,42,0.03);
}
.dm-dot{ color: rgba(15,23,42,0.35); font-weight: 900; }
.dm-soft{ color: rgba(15,23,42,0.60); font-weight: 850; }

.dm-cardBody{ display:grid; gap: 8px; }
.dm-line{ display:flex; gap: 6px; flex-wrap: wrap; }
.dm-lineLabel{ font-weight: 950; color: rgba(15,23,42,0.82); }
.dm-lineText{ font-weight: 750; color: rgba(15,23,42,0.72); }
.dm-desc{
  color: rgba(15,23,42,0.72);
  font-weight: 700;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dm-tags{
  display:flex;
  gap: 6px;
  flex-wrap: wrap;
}
.dm-tag{
  font-size: 12px;
  font-weight: 950;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid rgba(16,185,129,0.18);
  background: rgba(16,185,129,0.08);
  color: rgba(15,23,42,0.85);
}
.dm-tagWide{
  border-color: rgba(37,99,235,0.18);
  background: rgba(37,99,235,0.06);
}
.dm-tagMore{
  border-color: rgba(15,23,42,0.12);
  background: rgba(15,23,42,0.03);
  color: rgba(15,23,42,0.62);
}

.dm-cardActions{
  margin-top: auto;
  display:flex;
  justify-content: flex-end;
}
.dm-btn{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 14px;
  font-weight: 950;
  text-decoration: none;
  user-select: none;
}
.dm-btnPrimary{
  background: rgba(15,23,42,0.92);
  color: white;
  border: 1px solid rgba(15,23,42,0.20);
  box-shadow: 0 12px 30px rgba(15,23,42,0.12);
  transition: transform .18s ease, box-shadow .18s ease;
}
.dm-btnPrimary:hover{
  transform: translateY(-1px);
  box-shadow: 0 18px 45px rgba(15,23,42,0.18);
}
.dm-btnGhost{
  background: rgba(15,23,42,0.03);
  color: rgba(15,23,42,0.55);
  border: 1px dashed rgba(15,23,42,0.18);
}
.dm-arrow{ font-weight: 1000; }

.dm-skeletonWrap{
  margin-top: 14px;
  display:grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
@media (max-width: 980px){ .dm-skeletonWrap{ grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 620px){ .dm-skeletonWrap{ grid-template-columns: 1fr; } }
.dm-skeletonCard{
  height: 180px;
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: linear-gradient(90deg, rgba(15,23,42,0.04), rgba(15,23,42,0.07), rgba(15,23,42,0.04));
  background-size: 200% 100%;
  animation: shimmer 1.1s infinite linear;
}
@keyframes shimmer{
  0%{ background-position: 0% 0; }
  100%{ background-position: 200% 0; }
}

.dm-empty{
  margin-top: 14px;
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.92);
  padding: 16px;
  box-shadow: 0 18px 55px rgba(15,23,42,0.06);
}
.dm-emptyTitle{ font-weight: 950; font-size: 16px; }
.dm-emptyText{ margin-top: 6px; color: rgba(15,23,42,0.62); font-weight: 800; }
`;