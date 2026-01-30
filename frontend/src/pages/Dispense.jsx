import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import bookheartImg from "../assets/photos/bookheart.jpg";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");

/* ---------------- helpers ---------------- */
const s = (v) => String(v ?? "").trim();
const low = (v) => s(v).toLowerCase();
const uniq = (arr) => Array.from(new Set(arr));

function getPdfUrl(d) {
  const pick = d?.link || d?.file_url || d?.file || d?.url;
  if (!pick) return null;

  const p = String(pick);
  if (p.startsWith("http")) return p;
  if (p.startsWith("/")) return API_BASE + p;
  return API_BASE + "/" + p;
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
}

function parseQS(search) {
  const p = new URLSearchParams(search);
  return {
    q: p.get("q") || "",
    m: p.get("m") || "Tutte",
    t: p.get("t") || "Tutti",
    sort: p.get("sort") || "recenti",
  };
}

function setQS(navigate, location, next) {
  const p = new URLSearchParams(location.search);
  p.set("q", next.q || "");
  p.set("m", next.m || "Tutte");
  p.set("t", next.t || "Tutti");
  p.set("sort", next.sort || "recenti");
  // pulizia URL
  if (!next.q) p.delete("q");
  if (next.m === "Tutte") p.delete("m");
  if (next.t === "Tutti") p.delete("t");
  if (next.sort === "recenti") p.delete("sort");
  navigate({ pathname: location.pathname, search: p.toString() ? `?${p.toString()}` : "" }, { replace: true });
}

/* ---------------- page ---------------- */
export default function Dispense() {
  const location = useLocation();
  const navigate = useNavigate();

  // init dai parametri url
  const init = useMemo(() => parseQS(location.search), [location.search]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState(init.q);
  const [materia, setMateria] = useState(init.m);
  const [tag, setTag] = useState(init.t);
  const [sort, setSort] = useState(init.sort); // recenti | pagine | titolo

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  const didInitRef = useRef(false);

  // carico dati
  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");
      try {
        const r = await fetch(`${API_BASE}/api/dispense`);
        if (!r.ok) throw new Error(`Errore caricamento (${r.status})`);
        const d = await r.json();
        if (!alive) return;
        setItems(Array.isArray(d) ? d : []);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Non riesco a caricare le dispense.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  // sync stato -> URL (solo dopo mount)
  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      return;
    }
    setQS(navigate, location, { q, m: materia, t: tag, sort });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, materia, tag, sort]);

  // opzioni filtri
  const materie = useMemo(() => {
    const ms = items.map((x) => s(x.materia)).filter(Boolean);
    ms.sort((a, b) => a.localeCompare(b, "it"));
    return ["Tutte", ...uniq(ms)];
  }, [items]);

  const tags = useMemo(() => {
    const all = [];
    for (const x of items) {
      if (Array.isArray(x.tag)) all.push(...x.tag.map((t) => s(t)).filter(Boolean));
    }
    const u = uniq(all);
    u.sort((a, b) => a.localeCompare(b, "it"));
    return ["Tutti", ...u];
  }, [items]);

  // filtro + sort
  const filtered = useMemo(() => {
    const query = low(q);

    let arr = items.filter((x) => {
      if (materia !== "Tutte" && s(x.materia) !== materia) return false;

      if (tag !== "Tutti") {
        const xt = Array.isArray(x.tag) ? x.tag.map(s) : [];
        if (!xt.includes(tag)) return false;
      }

      if (!query) return true;

      const blob = [
        x.titolo,
        x.descrizione,
        x.aChiServe,
        x.materia,
        Array.isArray(x.tag) ? x.tag.join(" ") : "",
      ]
        .map(low)
        .join(" ");

      return blob.includes(query);
    });

    if (sort === "pagine") {
      arr = arr.slice().sort((a, b) => (b.pagine || 0) - (a.pagine || 0));
    } else if (sort === "titolo") {
      arr = arr.slice().sort((a, b) => s(a.titolo).localeCompare(s(b.titolo), "it"));
    } else {
      // recenti
      arr = arr.slice().sort((a, b) => s(b.created_at).localeCompare(s(a.created_at)));
    }

    return arr;
  }, [items, q, materia, tag, sort]);

  const top = useMemo(() => filtered.slice(0, 6), [filtered]);
  const rest = useMemo(() => filtered.slice(6), [filtered]);

  const hasFilters =
    q.trim() !== "" || materia !== "Tutte" || tag !== "Tutti" || sort !== "recenti";

  function reset() {
    setQ("");
    setMateria("Tutte");
    setTag("Tutti");
    setSort("recenti");
  }

  function openCard(d) {
    setActive(d);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setTimeout(() => setActive(null), 150);
  }

  // chiusura ESC
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") closeModal();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <main className="dp">
      <style>{css}</style>

      {/* HERO */}
      <section className="dp-hero">
        <div className="dp-heroInner">
          <div className="dp-left">
            <div className="dp-kicker">
              <span className="dp-kDot" aria-hidden="true" />
              Dispense
            </div>

            <h1 className="dp-title">
              Studia più <span className="dp-grad">chiaro</span>, senza caos.
            </h1>

            <p className="dp-sub">
              Qui trovi dispense ordinate e PDF pronti. Filtra in due secondi e vai dritto al punto.
            </p>

            <div className="dp-miniRow">
              <span className="dp-pill">
                <b>{items.length}</b> totali
              </span>
              <span className="dp-pill dp-soft">
                <b>{filtered.length}</b> risultati
              </span>
              <a className="dp-pill dp-link" href="/contatti">
                Manca una dispensa? Scrivici →
              </a>
            </div>
          </div>

          <div className="dp-right" aria-hidden="true">
            <div className="dp-orb dp-orbA" />
            <div className="dp-orb dp-orbB" />

            <div className="dp-glass">
              <img className="dp-glassImg" src={bookheartImg} alt="" />
              <div className="dp-glassOverlay" />
              <div className="dp-glassLine" />
              <div className="dp-glassLine dp-glassLine2" />
              <div className="dp-glassLine dp-glassLine3" />
              <div className="dp-glassHint">PDF • Tag • Ripasso</div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTROLS */}
      <section className="dp-controls">
        <div className="dp-search">
          <span className="dp-searchIcon" aria-hidden="true">⌕</span>
          <input
            className="dp-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca: acidi e basi, equilibrio, limiti, cinetica…"
          />
          {q.trim() ? (
            <button className="dp-clear" onClick={() => setQ("")} aria-label="Svuota ricerca">
              ✕
            </button>
          ) : null}
        </div>

        <div className="dp-filterGrid">
          <div className="dp-field">
            <div className="dp-label">Materia</div>
            <select className="dp-select" value={materia} onChange={(e) => setMateria(e.target.value)}>
              {materie.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="dp-field">
            <div className="dp-label">Tag</div>
            <select className="dp-select" value={tag} onChange={(e) => setTag(e.target.value)}>
              {tags.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="dp-field">
            <div className="dp-label">Ordina</div>
            <div className="dp-pills">
              <button type="button" className={"dp-pillBtn" + (sort === "recenti" ? " isOn" : "")} onClick={() => setSort("recenti")}>
                Recenti
              </button>
              <button type="button" className={"dp-pillBtn" + (sort === "pagine" ? " isOn" : "")} onClick={() => setSort("pagine")}>
                Pagine
              </button>
              <button type="button" className={"dp-pillBtn" + (sort === "titolo" ? " isOn" : "")} onClick={() => setSort("titolo")}>
                Titolo
              </button>
            </div>
          </div>

          <button className="dp-reset" type="button" onClick={reset} disabled={!hasFilters}>
            Reset
          </button>
        </div>
      </section>

      {/* STATES */}
      {err ? (
        <div className="dp-alert">
          <div className="dp-alertTitle">⚠️ Qualcosa non va</div>
          <div className="dp-alertText">{err}</div>
        </div>
      ) : null}

      {loading ? (
        <div className="dp-grid">
          {Array.from({ length: 9 }).map((_, i) => (
            <div className="dp-skel" key={i}>
              <div className="dp-sTop" />
              <div className="dp-sLine" />
              <div className="dp-sLine dp-sLine2" />
              <div className="dp-sTags" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="dp-empty">
          <div className="dp-emptyTitle">Nessuna dispensa trovata.</div>
          <div className="dp-emptyText">Cambia filtro o prova con una parola diversa.</div>
          <button className="dp-ghostBtn" type="button" onClick={reset}>
            Reset filtri
          </button>
        </div>
      ) : (
        <>
          <section className="dp-section">
            <div className="dp-sectionHead">
              <h2 className="dp-h2">In evidenza</h2>
              <div className="dp-h2Hint">clicca una card per vedere dettagli e aprire il PDF</div>
            </div>
            <div className="dp-grid dp-gridTop">
              {top.map((d) => (
                <DispensaCard key={d.id ?? d.titolo} d={d} premium onOpen={() => openCard(d)} />
              ))}
            </div>
          </section>

          <section className="dp-section">
            <div className="dp-sectionHead">
              <h2 className="dp-h2">Tutte le dispense</h2>
              <div className="dp-h2Hint">ordinate e filtrabili — come deve essere</div>
            </div>
            <div className="dp-grid">
              {rest.map((d) => (
                <DispensaCard key={d.id ?? d.titolo} d={d} onOpen={() => openCard(d)} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* MODAL */}
      {open ? (
        <div className="dp-modalBackdrop" onMouseDown={closeModal} role="presentation">
          <div className="dp-modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-label="Dettagli dispensa">
            <button className="dp-modalClose" onClick={closeModal} aria-label="Chiudi">
              ✕
            </button>

            {active ? (
              <>
                <div className="dp-modalHead">
                  <div className="dp-modalTitle">{s(active.titolo) || "Dispensa"}</div>
                  <div className="dp-modalMeta">
                    <span className="dp-badge">{s(active.materia) || "Altro"}</span>
                    <span className="dp-metaSep">•</span>
                    <span className="dp-metaText">{active.pagine || 0} pag.</span>
                    {active.created_at ? (
                      <>
                        <span className="dp-metaSep">•</span>
                        <span className="dp-metaText">{formatDate(active.created_at)}</span>
                      </>
                    ) : null}
                  </div>
                </div>

                {active.aChiServe ? (
                  <div className="dp-line">
                    <span className="dp-lineK">A chi serve:</span>
                    <span className="dp-lineV">{s(active.aChiServe)}</span>
                  </div>
                ) : null}

                {active.descrizione ? (
                  <div className="dp-modalDesc">{s(active.descrizione)}</div>
                ) : (
                  <div className="dp-modalDesc dp-muted">
                    Nessuna descrizione aggiunta (puoi inserirla dall’admin quando carichi).
                  </div>
                )}

                {Array.isArray(active.tag) && active.tag.length ? (
                  <div className="dp-tags">
                    {active.tag.map((t, i) => (
                      <span className="dp-tag" key={s(t) + i}>
                        {s(t)}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="dp-modalActions">
                  {getPdfUrl(active) ? (
                    <a className="dp-btn" href={getPdfUrl(active)} target="_blank" rel="noreferrer">
                      Apri PDF <span className="dp-arrow">→</span>
                      <span className="dp-shine" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="dp-btn dp-btnDisabled">PDF non disponibile</span>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}

/* ---------------- card ---------------- */
function DispensaCard({ d, premium = false, onOpen }) {
  const titolo = s(d.titolo) || "Dispensa";
  const materia = s(d.materia) || "Altro";
  const pagine = d.pagine ?? 0;
  const date = formatDate(d.created_at);
  const tags = Array.isArray(d.tag) ? d.tag.map(s).filter(Boolean) : [];
  const desc = s(d.descrizione);
  const aChi = s(d.aChiServe);
  const hasPdf = !!getPdfUrl(d);

  return (
    <button type="button" className={"dp-card" + (premium ? " isPremium" : "")} onClick={onOpen}>
      <div className="dp-cardBar" aria-hidden="true" />

      <div className="dp-cardHead">
        <div className="dp-cardTitle">{titolo}</div>
        <div className="dp-cardMeta">
          <span className="dp-badge">{materia}</span>
          <span className="dp-metaSep">•</span>
          <span className="dp-metaText">{pagine} pag.</span>
          {date ? (
            <>
              <span className="dp-metaSep">•</span>
              <span className="dp-metaText">{date}</span>
            </>
          ) : null}
          <span className={"dp-pdfChip" + (hasPdf ? " ok" : "")}>{hasPdf ? "PDF ✔" : "PDF —"}</span>
        </div>
      </div>

      {aChi ? (
        <div className="dp-line">
          <span className="dp-lineK">A chi serve:</span>
          <span className="dp-lineV">{aChi}</span>
        </div>
      ) : null}

      {desc ? <div className="dp-desc">{desc}</div> : null}

      {tags.length ? (
        <div className="dp-tags">
          {tags.slice(0, 6).map((t, i) => (
            <span className="dp-tag" key={t + i}>
              {t}
            </span>
          ))}
          {tags.length > 6 ? <span className="dp-tag dp-tagMore">+{tags.length - 6}</span> : null}
        </div>
      ) : null}

      <div className="dp-cardHint">
        Apri dettagli <span className="dp-arrow">→</span>
      </div>
    </button>
  );
}

/* ---------------- CSS (premium) ---------------- */
const css = `
:root{
  --dino:#22c55e;
  --dino2:#16a34a;
  --med:#38bdf8;
  --med2:#0ea5e9;

  --ink:#0b1220;
  --ink2: rgba(15,23,42,0.72);

  --bd: rgba(15,23,42,0.10);
  --glass: rgba(255,255,255,0.72);

  --shadow2: 0 10px 30px rgba(2,6,23,0.08);
  --shadow: 0 18px 50px rgba(2,6,23,0.10);
}

.dp{
  max-width:1100px;
  margin:0 auto;
  padding:18px;
}

/* HERO */
.dp-hero{
  border-radius: 22px;
  border: 1px solid var(--bd);
  background:
    radial-gradient(900px 260px at 12% -25%, rgba(34,197,94,0.16), transparent 60%),
    radial-gradient(900px 260px at 70% -30%, rgba(56,189,248,0.16), transparent 55%),
    rgba(255,255,255,0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: var(--shadow2);
  overflow:hidden;
}
.dp-heroInner{
  display:grid;
  grid-template-columns: 1.2fr .8fr;
  gap: 14px;
  padding: 18px;
}
@media (max-width: 920px){
  .dp-heroInner{ grid-template-columns: 1fr; }
}

.dp-kicker{
  display:inline-flex;
  align-items:center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.65);
  font-weight: 950;
  color: rgba(15,23,42,0.84);
}
.dp-kDot{
  width:10px;height:10px;border-radius:999px;
  background: linear-gradient(90deg, var(--dino), var(--med));
  box-shadow: 0 10px 20px rgba(2,6,23,0.12);
}
.dp-title{
  margin: 10px 0 6px;
  font-size: 34px;
  line-height: 1.08;
  letter-spacing: -0.02em;
  color: rgba(15,23,42,0.94);
  font-weight: 1000;
}
.dp-grad{
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  -webkit-background-clip:text;
  background-clip:text;
  color: transparent;
}
.dp-sub{
  margin:0;
  font-weight: 800;
  color: var(--ink2);
  max-width: 72ch;
}

.dp-miniRow{
  margin-top: 12px;
  display:flex;
  gap: 8px;
  flex-wrap: wrap;
}
.dp-pill{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.65);
  font-weight: 900;
  color: rgba(15,23,42,0.82);
  text-decoration:none;
  transition: transform .18s ease, background .18s ease;
}
.dp-pill:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.80); }
.dp-soft{
  background: linear-gradient(135deg, rgba(34,197,94,0.10), rgba(56,189,248,0.10));
}
.dp-link{ cursor: pointer; }

/* right visual */
.dp-right{
  position: relative;
  padding: 6px;
  display:grid;
  place-items: center;
  min-height: 210px;
}
.dp-orb{
  position:absolute;
  width: 240px;
  height: 240px;
  border-radius: 999px;
  filter: blur(22px);
  opacity: .70;
  pointer-events:none;
}
.dp-orbA{ left:-60px; top:-60px; background: radial-gradient(circle at 30% 30%, rgba(34,197,94,0.45), transparent 60%); }
.dp-orbB{ right:-70px; bottom:-70px; background: radial-gradient(circle at 60% 60%, rgba(56,189,248,0.45), transparent 60%); }

.dp-glass{
  width: min(380px, 95%);
  border-radius: 20px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.55);
  box-shadow: var(--shadow2);
  overflow:hidden;
  position: relative;
}
.dp-glassImg{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit: cover;
  filter: saturate(0.95) contrast(1.05);
  transform: scale(1.02);
}
.dp-glassOverlay{
  position:absolute;
  inset:0;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.72) 65%, rgba(255,255,255,0.84) 100%);
}
.dp-glassLine{
  height: 52px;
  background: linear-gradient(90deg, rgba(15,23,42,0.06), rgba(15,23,42,0.02));
  border-bottom: 1px solid rgba(15,23,42,0.06);
  position: relative;
}
.dp-glassLine2{ opacity: .85; }
.dp-glassLine3{ opacity: .70; }
.dp-glassHint{
  position:absolute;
  left: 14px;
  bottom: 12px;
  font-weight: 950;
  color: rgba(15,23,42,0.72);
}

/* CONTROLS */
.dp-controls{
  margin-top: 14px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid var(--bd);
  background: rgba(255,255,255,0.72);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 14px 34px rgba(2,6,23,0.06);
}

.dp-search{
  display:flex;
  align-items:center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 16px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.78);
  transition: box-shadow .18s ease, border-color .18s ease;
}
.dp-search:focus-within{
  border-color: rgba(56,189,248,0.30);
  box-shadow: 0 0 0 4px rgba(56,189,248,0.16);
}
.dp-searchIcon{ font-weight: 1000; color: rgba(15,23,42,0.55); }
.dp-input{
  width:100%;
  border:0;
  outline:0;
  background: transparent;
  font-weight: 850;
  color: rgba(15,23,42,0.90);
}
.dp-clear{
  border:0;
  background: rgba(15,23,42,0.06);
  border: 1px solid rgba(15,23,42,0.10);
  width: 34px; height: 34px;
  border-radius: 12px;
  cursor:pointer;
  font-weight: 1000;
  color: rgba(15,23,42,0.70);
}

.dp-filterGrid{
  margin-top: 12px;
  display:grid;
  grid-template-columns: 1fr 1fr 1.2fr auto;
  gap: 12px;
  align-items:end;
}
@media (max-width: 980px){
  .dp-filterGrid{ grid-template-columns: 1fr 1fr; }
}
@media (max-width: 560px){
  .dp-filterGrid{ grid-template-columns: 1fr; }
}

.dp-field{ display:grid; gap: 8px; }
.dp-label{
  font-weight: 950;
  font-size: 12px;
  color: rgba(15,23,42,0.72);
}
.dp-select{
  width:100%;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.78);
  font-weight: 900;
  color: rgba(15,23,42,0.84);
}

.dp-pills{ display:flex; gap: 6px; flex-wrap: wrap; }
.dp-pillBtn{
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.70);
  border-radius: 999px;
  padding: 8px 10px;
  font-weight: 950;
  color: rgba(15,23,42,0.78);
  cursor:pointer;
  transition: transform .18s ease, background .18s ease, border-color .18s ease;
}
.dp-pillBtn:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.85); }
.dp-pillBtn.isOn{
  background: linear-gradient(135deg, rgba(34,197,94,0.14), rgba(56,189,248,0.14));
  border-color: rgba(56,189,248,0.22);
  color: rgba(15,23,42,0.92);
  box-shadow: 0 10px 24px rgba(2,6,23,0.08);
}

.dp-reset{
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(15,23,42,0.03);
  font-weight: 1000;
  cursor:pointer;
}
.dp-reset:disabled{ opacity: .45; cursor:not-allowed; }

/* SECTIONS + GRID */
.dp-section{ margin-top: 18px; }
.dp-sectionHead{
  display:flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 10px;
  margin: 6px 2px 10px;
}
.dp-h2{
  margin: 0;
  font-size: 18px;
  font-weight: 1000;
  letter-spacing: -0.01em;
  color: rgba(15,23,42,0.92);
}
.dp-h2Hint{
  font-weight: 850;
  font-size: 13px;
  color: rgba(15,23,42,0.62);
}

.dp-grid{
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.dp-gridTop{ grid-template-columns: repeat(3, 1fr); }
@media (max-width: 980px){
  .dp-grid{ grid-template-columns: repeat(2, 1fr); }
  .dp-gridTop{ grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px){
  .dp-grid, .dp-gridTop{ grid-template-columns: 1fr; }
}

/* CARDS (button) */
.dp-card{
  position: relative;
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.86);
  box-shadow: 0 14px 36px rgba(2,6,23,0.05);
  padding: 14px;
  overflow: hidden;
  text-align: left;
  cursor: pointer;
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}
.dp-card:hover{
  transform: translateY(-2px);
  border-color: rgba(56,189,248,0.22);
  box-shadow: 0 18px 46px rgba(2,6,23,0.08);
}
.dp-card.isPremium{
  background:
    radial-gradient(520px 220px at 30% -10%, rgba(34,197,94,0.12), transparent 60%),
    radial-gradient(520px 220px at 80% -10%, rgba(56,189,248,0.12), transparent 60%),
    rgba(255,255,255,0.88);
}
.dp-cardBar{
  position:absolute;
  left:0; top:0; bottom:0;
  width: 4px;
  background: linear-gradient(180deg, var(--dino2), var(--med2));
  opacity: .85;
}
.dp-cardHead{ padding-left: 6px; }
.dp-cardTitle{
  font-weight: 1000;
  letter-spacing: -0.01em;
  color: rgba(15,23,42,0.92);
}
.dp-cardMeta{
  margin-top: 6px;
  display:flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
.dp-badge{
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(15,23,42,0.03);
  font-weight: 950;
  font-size: 12px;
  color: rgba(15,23,42,0.78);
}
.dp-metaSep{ opacity: .55; font-weight: 900; }
.dp-metaText{ font-weight: 850; font-size: 12px; color: rgba(15,23,42,0.66); }
.dp-pdfChip{
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(15,23,42,0.03);
  font-weight: 950;
  font-size: 12px;
  color: rgba(15,23,42,0.60);
}
.dp-pdfChip.ok{
  background: rgba(34,197,94,0.10);
  border-color: rgba(34,197,94,0.20);
  color: rgba(15,23,42,0.82);
}

.dp-line{
  margin-top: 10px;
  display:flex;
  gap: 8px;
  flex-wrap: wrap;
  padding-left: 6px;
}
.dp-lineK{ font-weight: 950; color: rgba(15,23,42,0.62); font-size: 13px; }
.dp-lineV{ font-weight: 900; color: rgba(15,23,42,0.82); font-size: 13px; }
.dp-desc{
  margin-top: 10px;
  padding-left: 6px;
  color: rgba(15,23,42,0.70);
  font-weight: 780;
  font-size: 13px;
  line-height: 1.35;
}
.dp-tags{
  margin-top: 10px;
  padding-left: 6px;
  display:flex;
  gap: 6px;
  flex-wrap: wrap;
}
.dp-tag{
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.72);
  font-weight: 900;
  font-size: 12px;
  color: rgba(15,23,42,0.76);
}
.dp-tagMore{
  background: linear-gradient(135deg, rgba(34,197,94,0.10), rgba(56,189,248,0.10));
}
.dp-cardHint{
  margin-top: 12px;
  padding-left: 6px;
  font-weight: 950;
  color: rgba(15,23,42,0.70);
}

/* CTA button with shine */
.dp-btn{
  position: relative;
  overflow:hidden;
  display:inline-flex;
  align-items:center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  text-decoration:none;
  font-weight: 1000;
  color: #fff;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  border: 1px solid rgba(255,255,255,0.18);
  box-shadow: 0 14px 30px rgba(2,6,23,0.16);
  transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
}
.dp-btn:hover{
  transform: translateY(-1px);
  box-shadow: 0 18px 40px rgba(2,6,23,0.22);
  filter: saturate(1.05);
}
.dp-arrow{ font-weight: 1000; }
.dp-shine{
  position:absolute;
  inset:0;
  background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.26) 25%, transparent 50%);
  transform: translateX(-120%);
  animation: dpShine 4.2s ease-in-out infinite;
  pointer-events:none;
}
@keyframes dpShine{
  0%, 58% { transform: translateX(-120%); }
  88%, 100% { transform: translateX(120%); }
}
.dp-btnDisabled{
  background: rgba(15,23,42,0.06);
  border: 1px solid rgba(15,23,42,0.10);
  color: rgba(15,23,42,0.62);
  box-shadow: none;
  cursor: default;
}

/* States */
.dp-alert{
  margin-top: 14px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(239,68,68,0.22);
  background: rgba(239,68,68,0.08);
}
.dp-alertTitle{ font-weight: 1000; color: rgba(15,23,42,0.90); }
.dp-alertText{ margin-top: 6px; font-weight: 850; color: rgba(15,23,42,0.76); }

.dp-empty{
  margin-top: 14px;
  padding: 22px;
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.78);
  text-align:center;
}
.dp-emptyTitle{ font-weight: 1000; font-size: 18px; }
.dp-emptyText{ margin-top: 6px; font-weight: 850; color: rgba(15,23,42,0.70); }
.dp-ghostBtn{
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(15,23,42,0.03);
  font-weight: 1000;
  cursor:pointer;
}

/* Skeletons */
.dp-skel{
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.76);
  padding: 14px;
  overflow:hidden;
}
.dp-sTop{
  height: 16px;
  width: 70%;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(15,23,42,0.06), rgba(15,23,42,0.02), rgba(15,23,42,0.06));
  animation: dpSk 1.2s ease-in-out infinite;
}
.dp-sLine{
  margin-top: 10px;
  height: 12px;
  width: 88%;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(15,23,42,0.06), rgba(15,23,42,0.02), rgba(15,23,42,0.06));
  animation: dpSk 1.2s ease-in-out infinite;
}
.dp-sLine2{ width: 62%; }
.dp-sTags{
  margin-top: 12px;
  height: 12px;
  width: 55%;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(15,23,42,0.06), rgba(15,23,42,0.02), rgba(15,23,42,0.06));
  animation: dpSk 1.2s ease-in-out infinite;
}
@keyframes dpSk{
  0%{ filter: brightness(1); }
  50%{ filter: brightness(1.06); }
  100%{ filter: brightness(1); }
}

/* MODAL */
.dp-modalBackdrop{
  position: fixed;
  inset: 0;
  background: rgba(2,6,23,0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display:grid;
  place-items: center;
  padding: 18px;
  z-index: 999;
}
.dp-modal{
  width: min(720px, 100%);
  border-radius: 22px;
  border: 1px solid rgba(255,255,255,0.18);
  background:
    radial-gradient(900px 260px at 12% -25%, rgba(34,197,94,0.14), transparent 60%),
    radial-gradient(900px 260px at 70% -30%, rgba(56,189,248,0.14), transparent 55%),
    rgba(255,255,255,0.92);
  box-shadow: 0 30px 90px rgba(2,6,23,0.40);
  padding: 18px;
  position: relative;
  animation: dpPop .14s ease-out;
}
@keyframes dpPop{
  from{ transform: translateY(8px); opacity: .85; }
  to{ transform: translateY(0); opacity: 1; }
}
.dp-modalClose{
  position:absolute;
  top: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  border-radius: 14px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.70);
  cursor:pointer;
  font-weight: 1000;
  color: rgba(15,23,42,0.70);
}
.dp-modalHead{ padding-right: 54px; }
.dp-modalTitle{
  font-weight: 1000;
  font-size: 18px;
  letter-spacing: -0.01em;
  color: rgba(15,23,42,0.92);
}
.dp-modalMeta{
  margin-top: 8px;
  display:flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items:center;
}
.dp-modalDesc{
  margin-top: 12px;
  font-weight: 800;
  color: rgba(15,23,42,0.76);
  line-height: 1.45;
}
.dp-muted{ opacity: .85; }
.dp-modalActions{
  margin-top: 14px;
  display:flex;
  justify-content:flex-end;
}
`;