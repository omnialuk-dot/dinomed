import { useEffect, useMemo, useState } from "react";
import heroImg from "../assets/photos/bookheart.jpg";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");

export default function Dispense() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/dispense`);
        if (!res.ok) throw new Error("Impossibile caricare le dispense");
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e?.message || "Errore");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const featured = useMemo(() => items.slice(0, 3), [items]);
  const all = useMemo(() => items, [items]);

  return (
    <main className="dmDispPage">
      <style>{css}</style>

      {/* HERO */}
      <section className="dmHero">
        {/* Kicker */}
        <div className="dmKicker">
          <span className="dmDot" aria-hidden="true" />
          <span className="dmBrand">
            <span className="dmDino">Dino</span>
            <span className="dmMed">Med</span>
          </span>
          <span className="dmSep">•</span>
          <span className="dmTagline">Dispense</span>
        </div>

        <div className="dmHeroGrid">
          <div className="dmHeroLeft">
            {/* TITOLO: più in basso rispetto al kicker */}
            <h1 className="dmTitle">
              Ripassa con <span className="dmGrad">chiarezza</span>. <br className="dmBr" />
              Un PDF alla volta.
            </h1>

            <p className="dmSub">
              Le dispense sono riassunti e schemi pensati per studiare più veloce: trovi l’argomento, apri il PDF e vai
              dritto al punto.
            </p>

            <div className="dmHeroActions">
              <button className="dmBtn dmBtnInfo" onClick={() => setInfoOpen(true)}>
                Cos’è una dispensa?
                <span className="dmBtnIco" aria-hidden="true">i</span>
              </button>

              <span className="dmHint" aria-hidden="true">
                {loading ? "Carico…" : `${items.length} disponibili`}
              </span>
            </div>
          </div>

          <div className="dmHeroRight" aria-hidden="true">
            <div className="dmVisual">
              <img className="dmImg" src={heroImg} alt="" />
              <div className="dmOverlay" />
              <div className="dmMicro">
                <div className="dmMicroRow">
                  <span className="dmChip">📚 Ordinate</span>
                  <span className="dmChip">🔎 Trovabili</span>
                  <span className="dmChip">⚡ Veloci</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL INFO */}
      {infoOpen && (
        <div className="dmModalWrap" role="dialog" aria-modal="true" onClick={() => setInfoOpen(false)}>
          <div className="dmModal" onClick={(e) => e.stopPropagation()}>
            <div className="dmModalTop">
              <div className="dmModalTitle">Cos’è una dispensa?</div>
              <button className="dmModalClose" onClick={() => setInfoOpen(false)} aria-label="Chiudi">
                ✕
              </button>
            </div>

            <div className="dmModalBody">
              <p className="dmModalText">
                Una <b>dispensa</b> è un materiale di studio (schemi, riassunti, appunti) che ti aiuta a{" "}
                <b>capire</b> e <b>ripassare</b> più in fretta rispetto al libro.
              </p>
              <div className="dmModalBullets">
                <div className="dmBullet">• Vai all’argomento che ti serve</div>
                <div className="dmBullet">• Apri il PDF e ripassi in 10 minuti</div>
                <div className="dmBullet">• Perfetto prima di esami e test</div>
              </div>
            </div>

            <div className="dmModalActions">
              <button className="dmBtn dmBtnPrimary" onClick={() => setInfoOpen(false)}>
                Ok, capito
              </button>
            </div>
          </div>
        </div>
      )}

      {err && <div className="dmError">⚠️ {err}</div>}

      {loading ? (
        <div className="dmLoading">Caricamento dispense…</div>
      ) : (
        <>
          {/* IN EVIDENZA */}
          {featured.length > 0 && (
            <section className="dmSection">
              <h2 className="dmH2">In evidenza</h2>
              <div className="dmGrid">
                {featured.map((d) => (
                  <Card key={d.id} d={d} />
                ))}
              </div>
            </section>
          )}

          {/* TUTTE */}
          <section className="dmSection">
            <h2 className="dmH2">Tutte le dispense</h2>
            {all.length === 0 ? (
              <div className="dmEmpty">Nessuna dispensa disponibile.</div>
            ) : (
              <div className="dmGrid">
                {all.map((d) => (
                  <Card key={d.id} d={d} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

/* =====================
   CARD
   ===================== */
function Card({ d }) {
  const hasPdf = Boolean(d.file_url || d.link);
  const pdfUrl = d.file_url
    ? d.file_url.startsWith("http")
      ? d.file_url
      : `${API_BASE}${d.file_url}`
    : d.link;

  return (
    <article className="dmCard">
      <div className="dmCardTop">
        <span className="dmBadge">{d.materia || "Dispensa"}</span>
        <span className="dmPages">{d.pagine || 0} pag.</span>
      </div>

      <h3 className="dmCardTitle">{d.titolo}</h3>

      {d.descrizione && <p className="dmDesc">{d.descrizione}</p>}

      <div className="dmCardActions">
        {hasPdf ? (
          <a href={pdfUrl} target="_blank" rel="noreferrer" className="dmBtn dmBtnPrimary">
            Apri PDF <span aria-hidden="true">→</span>
          </a>
        ) : (
          <span className="dmBtn dmBtnGhost">PDF non disponibile</span>
        )}
      </div>
    </article>
  );
}

/* =====================
   CSS
   ===================== */
const css = `
:root{
  --dino:#22c55e; --dino2:#16a34a;
  --med:#38bdf8;  --med2:#0ea5e9;

  --ink: rgba(15,23,42,0.92);
  --ink2: rgba(15,23,42,0.72);
  --bd: rgba(15,23,42,0.10);
  --shadow2: 0 16px 60px rgba(2,6,23,0.10);
}

.dmDispPage{
  padding:18px;
  max-width:1100px;
  margin:0 auto;
}

/* HERO */
.dmHero{
  position:relative;
  border-radius:26px;
  padding:22px;
  border:1px solid rgba(15,23,42,.08);
  background:
    radial-gradient(900px 280px at 12% -25%, rgba(34,197,94,0.16), transparent 60%),
    radial-gradient(900px 280px at 78% -30%, rgba(56,189,248,0.16), transparent 55%),
    rgba(255,255,255,0.90);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: var(--shadow2);
  overflow:hidden;
}

.dmKicker{
  display:inline-flex;
  align-items:center;
  gap:10px;
  font-weight:950;
  padding:8px 12px;
  border-radius:999px;
  background: rgba(255,255,255,0.72);
  border:1px solid rgba(15,23,42,.12);
  color: rgba(15,23,42,.82);
}

.dmDot{
  width:10px;height:10px;border-radius:999px;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  box-shadow: 0 10px 20px rgba(2,6,23,0.10);
}
.dmBrand{ display:inline-flex; gap:0; }
.dmDino{ color: var(--dino2); font-weight:1000; }
.dmMed{ color: var(--med2); font-weight:1000; }
.dmSep{ opacity:.55; }

.dmHeroGrid{
  display:grid;
  grid-template-columns: 1.1fr .9fr;
  gap:18px;
  align-items:center;
  /* qui “abbasso” il blocco testo rispetto al kicker */
  padding-top: 16px;
}
@media(max-width:980px){
  .dmHeroGrid{ grid-template-columns: 1fr; }
}

.dmTitle{
  margin: 10px 0 8px;
  font-size: 40px;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--ink);
  font-weight: 1000;
}
.dmBr{ display:none; }
@media(max-width:520px){
  .dmTitle{ font-size: 32px; }
  .dmBr{ display:block; }
}

.dmGrad{
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  -webkit-background-clip:text;
  background-clip:text;
  color: transparent;
}

.dmSub{
  margin:0;
  font-weight:800;
  color: rgba(15,23,42,.68);
  max-width:70ch;
}

.dmHeroActions{
  margin-top:14px;
  display:flex;
  gap:12px;
  align-items:center;
  flex-wrap:wrap;
}

.dmHint{
  font-weight:900;
  color: rgba(15,23,42,.60);
  padding:8px 10px;
  border-radius:999px;
  background: rgba(255,255,255,0.55);
  border:1px solid rgba(15,23,42,.10);
}

/* VISUAL */
.dmVisual{
  position:relative;
  border-radius:22px;
  overflow:hidden;
  border:1px solid rgba(15,23,42,.10);
  box-shadow: 0 14px 52px rgba(2,6,23,0.08);
  height: 220px;
  background: rgba(255,255,255,0.92);
}
@media(max-width:980px){ .dmVisual{ height: 200px; } }

.dmImg{
  width:100%;height:100%;
  object-fit:cover;
  display:block;
  filter: saturate(.95) contrast(1.06);
  transform: scale(1.02);
}

.dmOverlay{
  position:absolute; inset:0;
  background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.22) 55%, rgba(255,255,255,0.88) 100%);
}

.dmMicro{
  position:absolute;
  left:12px; right:12px; bottom:12px;
  display:flex;
  justify-content:flex-start;
}
.dmMicroRow{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
}
.dmChip{
  display:inline-flex;
  align-items:center;
  gap:8px;
  padding:8px 10px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,0.45);
  background: rgba(255,255,255,0.72);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-weight:950;
  color: rgba(15,23,42,0.78);
}

/* SEZIONI */
.dmSection{ margin-top:26px; }
.dmH2{ margin-bottom:12px; font-size:20px; letter-spacing:-0.01em; }

.dmGrid{
  display:grid;
  grid-template-columns:repeat(3, minmax(0,1fr));
  gap:14px;
}
@media(max-width:900px){ .dmGrid{ grid-template-columns:repeat(2,1fr); } }
@media(max-width:560px){ .dmGrid{ grid-template-columns:1fr; } }

/* CARD */
.dmCard{
  background:white;
  border-radius:18px;
  padding:14px;
  border:1px solid rgba(15,23,42,.10);
  box-shadow:0 14px 40px rgba(15,23,42,.06);
  display:flex;
  flex-direction:column;
}

.dmCardTop{
  display:flex;
  justify-content:space-between;
  align-items:center;
}

.dmBadge{
  font-size:12px;
  font-weight:900;
  padding:4px 8px;
  border-radius:999px;
  background: rgba(34,197,94,.12);
  color: rgba(15,23,42,.78);
  border: 1px solid rgba(34,197,94,.18);
}

.dmPages{
  font-size:12px;
  font-weight:800;
  color:rgba(15,23,42,.55);
}

.dmCardTitle{
  margin:10px 0 6px;
  font-size:16px;
  font-weight:950;
  color: rgba(15,23,42,.92);
}

.dmDesc{
  font-size:14px;
  font-weight:750;
  color:rgba(15,23,42,.70);
  line-height:1.35;
}

.dmCardActions{
  margin-top:auto;
  display:flex;
  justify-content:flex-end;
}

/* BOTTONI */
.dmBtn{
  padding:10px 12px;
  border-radius:14px;
  font-weight:950;
  text-decoration:none;
  border:none;
  cursor:pointer;
}

.dmBtnPrimary{
  background: rgba(15,23,42,.92);
  color:white;
}

.dmBtnGhost{
  border:1px dashed rgba(15,23,42,.20);
  color:rgba(15,23,42,.55);
  background: transparent;
}

/* ✅ Bottone “Cos’è una dispensa?” COLORATO (non bianco su bianco) */
.dmBtnInfo{
  display:inline-flex;
  align-items:center;
  gap:10px;
  padding:10px 12px;
  border-radius:999px;
  color: rgba(15,23,42,.88);
  border:1px solid rgba(15,23,42,.10);
  background: linear-gradient(135deg, rgba(34,197,94,0.16), rgba(56,189,248,0.16));
  box-shadow: 0 14px 34px rgba(2,6,23,0.08);
  transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
}
.dmBtnInfo:hover{
  transform: translateY(-1px);
  box-shadow: 0 18px 44px rgba(2,6,23,0.12);
  filter: saturate(1.03);
}
.dmBtnIco{
  width:18px;height:18px;border-radius:999px;
  display:grid;place-items:center;
  font-size:12px;
  background: rgba(255,255,255,0.72);
  border:1px solid rgba(15,23,42,.10);
  font-weight:1000;
}

/* MODAL */
.dmModalWrap{
  position:fixed; inset:0;
  background: rgba(2,6,23,0.45);
  display:flex;
  align-items:center;
  justify-content:center;
  padding:18px;
  z-index: 999;
}

.dmModal{
  width: min(560px, 100%);
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.18);
  background:
    radial-gradient(700px 220px at 20% -20%, rgba(34,197,94,0.16), transparent 60%),
    radial-gradient(700px 220px at 85% -20%, rgba(56,189,248,0.16), transparent 55%),
    rgba(255,255,255,0.94);
  box-shadow: 0 26px 90px rgba(2,6,23,0.25);
  overflow:hidden;
}

.dmModalTop{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:14px 14px 10px;
  border-bottom:1px solid rgba(15,23,42,0.08);
}

.dmModalTitle{
  font-weight:1000;
  color: rgba(15,23,42,0.92);
  letter-spacing:-0.01em;
}

.dmModalClose{
  border:none;
  background: rgba(255,255,255,0.75);
  border:1px solid rgba(15,23,42,0.10);
  width:34px;height:34px;
  border-radius: 12px;
  cursor:pointer;
  font-weight:1000;
}

.dmModalBody{ padding: 12px 14px 6px; }
.dmModalText{
  margin:0;
  color: rgba(15,23,42,0.74);
  font-weight: 800;
  line-height:1.4;
}
.dmModalBullets{ margin-top:10px; display:grid; gap:6px; }
.dmBullet{
  font-weight: 850;
  color: rgba(15,23,42,0.70);
}

.dmModalActions{
  padding: 12px 14px 14px;
  display:flex;
  justify-content:flex-end;
}

/* stati */
.dmLoading,
.dmEmpty,
.dmError{
  margin-top:20px;
  font-weight:800;
  color:rgba(15,23,42,.65);
}
`;