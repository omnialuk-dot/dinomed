import { useNavigate } from "react-router-dom";
import heroImg from "../assets/photos/coding.jpg";

export default function Simulazioni() {
  const nav = useNavigate();

  return (
    <main className="smx">
      <style>{css}</style>

      <section className="smx-hero">
        {/* Kicker “appiccicato” all’angolo */}
        <div className="smx-kicker">
          <span className="smx-dot" aria-hidden="true" />
          <span className="smx-brand">
            <span className="smx-dino">Dino</span>
            <span className="smx-med">Med</span>
          </span>
          <span className="smx-sep">•</span>
          <span className="smx-tagline">Simulazioni</span>
        </div>

        <div className="smx-grid">
          <div className="smx-left">
            <h1 className="smx-title">
              <span className="smx-titleTop">Allenati</span>
              <span className="smx-titleBottom">come all’esame</span>
            </h1>

            <p className="smx-sub">
              Pochi click, zero confusione. Entri, scegli la simulazione e parti.
            </p>

            <div className="smx-actions">
              <button className="smx-btn smx-primary" onClick={() => nav("/simulazioni/config")}>
                Continua <span aria-hidden="true">→</span>
                <span className="smx-shine" aria-hidden="true" />
              </button>

              <div className="smx-pills" aria-hidden="true">
                <span className="smx-pill"><IconBolt /> Veloce</span>
                <span className="smx-pill"><IconTarget /> Focus</span>
                <span className="smx-pill"><IconCheck /> Chiaro</span>
              </div>
            </div>
          </div>

          <div className="smx-right" aria-hidden="true">
            <div className="smx-visual">
              <div className="smx-visualGlow" />
              <img className="smx-img" src={heroImg} alt="" />
              <div className="smx-overlay" />

              <div className="smx-float">
                <div className="smx-floatTitle">Modalità simulazione</div>
                <div className="smx-floatSub">Scegli e vai dritto al punto.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* --- icons --- */
function IconCheck() {
  return (
    <span className="smx-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
function IconBolt() {
  return (
    <span className="smx-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
function IconTarget() {
  return (
    <span className="smx-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 16a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 12h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </span>
  );
}

const css = `
:root{
  --dino:#22c55e; --dino2:#16a34a;
  --med:#38bdf8;  --med2:#0ea5e9;

  --ink: rgba(15,23,42,0.92);
  --ink2: rgba(15,23,42,0.72);
  --bd: rgba(15,23,42,0.10);
  --shadow: 0 16px 60px rgba(2,6,23,0.10);
}

/* pagina coerente col resto */
.smx{
  max-width: 1120px;
  margin: 0 auto;
  padding: 22px;
}

/* rettangolone “glass” coerente Home/Contatti/ChiSiamo */
.smx-hero{
  position: relative;
  border-radius: 28px;
  border: 1px solid var(--bd);
  background:
    radial-gradient(900px 320px at 12% -25%, rgba(34,197,94,0.16), transparent 60%),
    radial-gradient(900px 320px at 78% -30%, rgba(56,189,248,0.16), transparent 55%),
    rgba(255,255,255,0.88);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: var(--shadow);
  overflow:hidden;
  padding: 30px;
  min-height: 520px; /* più grande */
}
@media (max-width: 980px){
  .smx-hero{ padding: 18px; min-height: auto; }
}

/* kicker all’angolo alto-sinistra */
.smx-kicker{
  position:absolute;
  top: 14px;
  left: 14px;
  display:inline-flex;
  align-items:center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.70);
  font-weight: 950;
  color: rgba(15,23,42,0.82);
}
@media (max-width: 980px){
  .smx-kicker{ position: static; margin-bottom: 10px; }
}

.smx-dot{
  width: 10px; height: 10px; border-radius: 999px;
  background: linear-gradient(90deg, var(--dino), var(--med));
  box-shadow: 0 10px 20px rgba(2,6,23,0.10);
}
.smx-brand{ display:inline-flex; gap:0; }
.smx-dino{ color: var(--dino2); font-weight: 1000; }
.smx-med{ color: var(--med2); font-weight: 1000; }
.smx-sep{ opacity:.55; }

/* layout interno: spazio sopra al kicker */
.smx-grid{
  display:grid;
  grid-template-columns: 1.05fr .95fr;
  gap: 26px;
  align-items:center;
  padding-top: 34px; /* lascia aria al kicker in alto */
}
@media (max-width: 980px){
  .smx-grid{ grid-template-columns: 1fr; padding-top: 0; }
}

/* titolo “slide” grosso e bold */
.smx-title{
  margin: 6px 0 10px;
  line-height: 1.02;
  letter-spacing: -0.04em;
}
.smx-titleTop{
  display:block;
  font-size: 52px;
  font-weight: 1100;
  color: rgba(15,23,42,0.92);
}
.smx-titleBottom{
  display:block;
  font-size: 52px;
  font-weight: 1100;
  padding-right: 2px; /* evita tagli lettera finale */
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  -webkit-background-clip:text;
  background-clip:text;
  color: transparent;
}
@media (max-width: 520px){
  .smx-titleTop, .smx-titleBottom{ font-size: 40px; }
}

.smx-sub{
  margin: 0;
  color: rgba(15,23,42,0.72);
  font-weight: 850;
  max-width: 70ch;
}

/* CTA */
.smx-actions{
  margin-top: 18px;
  display:flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items:center;
}

.smx-btn{
  position: relative;
  overflow:hidden;
  display:inline-flex;
  align-items:center;
  gap: 10px;
  padding: 13px 16px;
  border-radius: 999px;
  font-weight: 1000;
  border: 1px solid rgba(15,23,42,0.10);
  box-shadow: 0 14px 30px rgba(2,6,23,0.10);
  transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
  cursor:pointer;
}
.smx-btn:hover{ transform: translateY(-1px); box-shadow: 0 18px 40px rgba(2,6,23,0.14); filter: saturate(1.03); }

.smx-primary{
  color: white;
  border: 1px solid rgba(255,255,255,0.22);
  background: linear-gradient(90deg, var(--dino2), var(--med2));
}
.smx-shine{
  position:absolute; inset:0;
  background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.26) 25%, transparent 50%);
  transform: translateX(-120%);
  animation: smxShine 4.2s ease-in-out infinite;
  pointer-events: none;
}
@keyframes smxShine{
  0%, 58% { transform: translateX(-120%); }
  88%, 100% { transform: translateX(120%); }
}

.smx-pills{ display:flex; gap: 10px; flex-wrap: wrap; }
.smx-pill{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.62);
  font-weight: 900;
  color: rgba(15,23,42,0.78);
}

/* immagine */
.smx-visual{
  position: relative;
  border-radius: 24px;
  overflow:hidden;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.92);
  box-shadow: 0 18px 60px rgba(2,6,23,0.10);
  height: 420px; /* più grande e premium */
}
@media (max-width: 980px){ .smx-visual{ height: 300px; } }

.smx-visualGlow{
  position:absolute;
  inset:-60px;
  background:
    radial-gradient(420px 240px at 22% 18%, rgba(34,197,94,0.22), transparent 58%),
    radial-gradient(420px 240px at 78% 18%, rgba(56,189,248,0.22), transparent 58%);
  filter: blur(26px);
  opacity: .55;
  pointer-events:none;
  z-index: 0;
}

.smx-img{
  position: relative;
  z-index: 1;
  width:100%; height:100%;
  object-fit: cover;
  display:block;
  transform: scale(1.02);
  filter: saturate(0.96) contrast(1.06);
}
.smx-overlay{
  position:absolute; inset:0;
  z-index: 2;
  background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.20) 55%, rgba(255,255,255,0.86) 100%);
}

.smx-float{
  position:absolute;
  left: 14px; right: 14px;
  bottom: 14px;
  z-index: 3;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.40);
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 18px 55px rgba(2,6,23,0.10);
  padding: 12px;
}
.smx-floatTitle{ font-weight: 1000; color: rgba(15,23,42,0.90); }
.smx-floatSub{ margin-top: 6px; font-weight: 850; color: rgba(15,23,42,0.70); }

/* icons */
.smx-ico{ width: 18px; height: 18px; display:inline-grid; place-items:center; }
.smx-ico svg{ width: 18px; height: 18px; }
`;