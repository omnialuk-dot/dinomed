import { useNavigate } from "react-router-dom";
import heroImg from "../assets/photos/typing.jpg";

export default function Simulazioni() {
  const nav = useNavigate();

  return (
    <main className="sx">
      <style>{css}</style>

      <section className="sx-hero">
        {/* Kicker “appiccicato” dentro al rettangolo */}
        <div className="sx-kicker">
          <span className="sx-dot" aria-hidden="true" />
          <span className="sx-brand">
            <span className="sx-dino">Dino</span>
            <span className="sx-med">Med</span>
          </span>
          <span className="sx-sep">•</span>
          <span className="sx-tagline">Simulazioni</span>
        </div>

        <div className="sx-grid">
          <div className="sx-left">
            <h1 className="sx-title">
              Allenati <span className="sx-grad">come all’esame</span>.
              <br className="sx-br" />
              In modo semplice.
            </h1>

            <p className="sx-sub">
              Parti in pochi click: scegli le impostazioni, fai il test e ottieni una correzione chiara.
            </p>

            {/* Gerarchia: 3 step (non “Home-like”, ma tool premium) */}
            <div className="sx-steps" aria-label="Come funziona">
              <div className="sx-step">
                <span className="sx-stepIco" aria-hidden="true"><IconSliders /></span>
                <div className="sx-stepTxt">
                  <div className="sx-stepTop">1) Configura</div>
                  <div className="sx-stepSub">Materie, difficoltà, numero domande</div>
                </div>
              </div>

              <div className="sx-step">
                <span className="sx-stepIco isBlue" aria-hidden="true"><IconPen /></span>
                <div className="sx-stepTxt">
                  <div className="sx-stepTop">2) Rispondi</div>
                  <div className="sx-stepSub">Timer opzionale, UI pulita</div>
                </div>
              </div>

              <div className="sx-step">
                <span className="sx-stepIco isGreen" aria-hidden="true"><IconCheck /></span>
                <div className="sx-stepTxt">
                  <div className="sx-stepTop">3) Correggi</div>
                  <div className="sx-stepSub">Soluzione + spiegazione breve</div>
                </div>
              </div>
            </div>

            <div className="sx-actions">
              <button className="sx-btn sx-primary" onClick={() => nav("/simulazioni/config")}>
                Inizia una simulazione <span aria-hidden="true">→</span>
                <span className="sx-shine" aria-hidden="true" />
              </button>

              <button className="sx-btn sx-soft" onClick={() => nav("/simulazioni/config")}>
                Configura <span aria-hidden="true">⚙️</span>
              </button>
            </div>

            {/* Micro-pills, ma sobrie */}
            <div className="sx-pills" aria-label="Caratteristiche">
              <span className="sx-pill"><IconBolt /> Veloce</span>
              <span className="sx-pill"><IconTarget /> Mirata</span>
              <span className="sx-pill"><IconEye /> Chiara</span>
            </div>
          </div>

          <div className="sx-right" aria-hidden="true">
            <div className="sx-visual">
              <div className="sx-visualGlow" />
              <img className="sx-img" src={heroImg} alt="" />
              <div className="sx-overlay" />

              {/* micro label elegante (non troppo “home”) */}
              <div className="sx-float">
                <div className="sx-floatTitle">Modalità simulazione</div>
                <div className="sx-floatSub">Imposta e vai dritto al punto.</div>
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
    <span className="sx-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
function IconBolt() {
  return (
    <span className="sx-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
function IconTarget() {
  return (
    <span className="sx-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 16a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 12h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </span>
  );
}
function IconEye() {
  return (
    <span className="sx-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M12 15a3 3 0 1 0-3-3 3 3 0 0 0 3 3Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    </span>
  );
}
function IconSliders() {
  return (
    <span className="sx-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 21V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4 10V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 21V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 8V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M20 21V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M20 12V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M2 14h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M10 8h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M18 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}
function IconPen() {
  return (
    <span className="sx-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 20h9"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/* ---------------- CSS (coerente DinoMed, non “font diverso”) ---------------- */
const css = `
:root{
  --dino:#22c55e; --dino2:#16a34a;
  --med:#38bdf8;  --med2:#0ea5e9;

  --ink: rgba(15,23,42,0.92);
  --ink2: rgba(15,23,42,0.72);
  --bd: rgba(15,23,42,0.10);
  --shadow: 0 16px 60px rgba(2,6,23,0.10);
}

.sx{
  max-width: 1120px;
  margin: 0 auto;
  padding: 22px;
}

/* rettangolone glass coerente */
.sx-hero{
  position: relative;
  border-radius: 28px;
  border: 1px solid var(--bd);
  background:
    radial-gradient(900px 320px at 12% -25%, rgba(34,197,94,0.16), transparent 60%),
    radial-gradient(900px 320px at 78% -30%, rgba(56,189,248,0.16), transparent 55%),
    rgba(255,255,255,0.90);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: var(--shadow);
  overflow:hidden;
  padding: 30px;
  min-height: 540px;
}
@media (max-width: 980px){
  .sx-hero{ padding: 18px; min-height: auto; }
}

/* kicker */
.sx-kicker{
  position:absolute;
  top: 14px;
  left: 14px;
  display:inline-flex;
  align-items:center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.72);
  font-weight: 950;
  color: rgba(15,23,42,0.82);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
}
@media (max-width: 980px){
  .sx-kicker{ position: static; margin-bottom: 10px; }
}

.sx-dot{
  width: 10px; height: 10px; border-radius: 999px;
  background: linear-gradient(90deg, var(--dino), var(--med));
  box-shadow: 0 10px 20px rgba(2,6,23,0.10);
}
.sx-brand{ display:inline-flex; gap:0; }
.sx-dino{ color: var(--dino2); font-weight: 1000; }
.sx-med{ color: var(--med2); font-weight: 1000; }
.sx-sep{ opacity:.55; }

/* layout */
.sx-grid{
  display:grid;
  grid-template-columns: 1.05fr .95fr;
  gap: 26px;
  align-items:center;
  padding-top: 34px;
}
@media (max-width: 980px){
  .sx-grid{ grid-template-columns: 1fr; padding-top: 0; }
}

/* titolo coerente (niente pesi strani) */
.sx-title{
  margin: 6px 0 10px;
  font-size: 44px;
  line-height: 1.04;
  letter-spacing: -0.035em;
  color: var(--ink);
  font-weight: 1000;
}
.sx-br{ display:none; }
@media (max-width: 520px){
  .sx-title{ font-size: 34px; }
  .sx-br{ display:block; }
}
.sx-grad{
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  -webkit-background-clip:text;
  background-clip:text;
  color: transparent;
}

.sx-sub{
  margin: 0;
  color: var(--ink2);
  font-weight: 850;
  max-width: 72ch;
}

/* steps */
.sx-steps{
  margin-top: 14px;
  display:grid;
  grid-template-columns: repeat(3, minmax(0,1fr));
  gap: 10px;
}
@media (max-width: 980px){
  .sx-steps{ grid-template-columns: 1fr; }
}
.sx-step{
  display:flex;
  gap: 10px;
  align-items:flex-start;
  padding: 12px 12px;
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.76);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
}
.sx-stepIco{
  width: 40px; height: 40px;
  border-radius: 14px;
  display:grid; place-items:center;
  border: 1px solid rgba(15,23,42,0.08);
  background: linear-gradient(135deg, rgba(56,189,248,0.16), rgba(56,189,248,0.06));
  color: rgba(14,165,233,0.95);
}
.sx-stepIco.isBlue{
  background: linear-gradient(135deg, rgba(99,102,241,0.14), rgba(99,102,241,0.06));
  color: rgba(79,70,229,0.95);
}
.sx-stepIco.isGreen{
  background: linear-gradient(135deg, rgba(34,197,94,0.14), rgba(34,197,94,0.06));
  color: rgba(22,163,74,0.95);
}
.sx-stepTop{ font-weight: 1000; color: rgba(15,23,42,0.90); }
.sx-stepSub{ margin-top: 4px; font-weight: 850; color: rgba(15,23,42,0.68); line-height: 1.25; }

/* CTA */
.sx-actions{
  margin-top: 16px;
  display:flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items:center;
}
.sx-btn{
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
  background: rgba(255,255,255,0.72);
  color: rgba(15,23,42,0.86);
}
.sx-btn:hover{ transform: translateY(-1px); box-shadow: 0 18px 40px rgba(2,6,23,0.14); filter: saturate(1.03); }

.sx-primary{
  color: white;
  border: 1px solid rgba(255,255,255,0.22);
  background: linear-gradient(90deg, var(--dino2), var(--med2));
}
.sx-soft{
  background: linear-gradient(135deg, rgba(34,197,94,0.10), rgba(56,189,248,0.10));
}

.sx-shine{
  position:absolute; inset:0;
  background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.26) 25%, transparent 50%);
  transform: translateX(-120%);
  animation: sxShine 4.2s ease-in-out infinite;
  pointer-events: none;
}
@keyframes sxShine{
  0%, 58% { transform: translateX(-120%); }
  88%, 100% { transform: translateX(120%); }
}

/* pills */
.sx-pills{
  margin-top: 12px;
  display:flex;
  gap: 10px;
  flex-wrap: wrap;
}
.sx-pill{
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

/* visual */
.sx-visual{
  position: relative;
  border-radius: 24px;
  overflow:hidden;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.92);
  box-shadow: 0 18px 60px rgba(2,6,23,0.10);
  height: 420px;
}
@media (max-width: 980px){ .sx-visual{ height: 300px; } }

.sx-visualGlow{
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
.sx-img{
  position: relative;
  z-index: 1;
  width:100%; height:100%;
  object-fit: cover;
  display:block;
  transform: scale(1.02);
  filter: saturate(0.96) contrast(1.06);
}
.sx-overlay{
  position:absolute; inset:0;
  z-index: 2;
  background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.22) 55%, rgba(255,255,255,0.86) 100%);
}
.sx-float{
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
.sx-floatTitle{ font-weight: 1000; color: rgba(15,23,42,0.90); }
.sx-floatSub{ margin-top: 6px; font-weight: 850; color: rgba(15,23,42,0.70); }

/* icons */
.sx-ico{ width: 18px; height: 18px; display:inline-grid; place-items:center; }
.sx-ico svg{ width: 18px; height: 18px; }
`;