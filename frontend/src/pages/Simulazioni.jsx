import { useNavigate } from "react-router-dom";
import heroImg from "../assets/photos/typing.jpg";

export default function Simulazioni() {
  const nav = useNavigate();

  return (
    <main className="sx">
      <style>{css}</style>

      <section className="sx-hero">
        {/* Kicker */}
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
          {/* LEFT */}
          <div className="sx-left">
            <h1 className="sx-title">
              Allenati <span className="sx-grad">come all’esame</span>.
            </h1>

            <p className="sx-lead">In modo semplice.</p>

            <p className="sx-sub">
              Simulazioni pensate per farti concentrare solo su ciò che conta,
              senza perdere tempo in configurazioni inutili.
            </p>

            {/* COME FUNZIONA — flow line */}
            <div className="sx-flow" aria-label="Come funziona">
              <div className="sx-flowItem">
                <span className="sx-flowNum">1</span>
                <span className="sx-flowTxt">Configura</span>
              </div>
              <div className="sx-flowSep" />
              <div className="sx-flowItem">
                <span className="sx-flowNum">2</span>
                <span className="sx-flowTxt">Rispondi</span>
              </div>
              <div className="sx-flowSep" />
              <div className="sx-flowItem">
                <span className="sx-flowNum">3</span>
                <span className="sx-flowTxt">Correggi</span>
              </div>
            </div>

            <div className="sx-actions">
              <button className="sx-btn sx-primary" onClick={() => nav("/simulazioni/config")}>
                Inizia una simulazione <span aria-hidden="true">→</span>
                <span className="sx-shine" aria-hidden="true" />
              </button>

              {/* SOSTITUTO “utile” delle pills */}
              <div className="sx-mini">
                <div className="sx-miniCard">
                  <div className="sx-miniTop">
                    <span className="sx-miniIco" aria-hidden="true">
                      <IconTip />
                    </span>
                    Consiglio rapido
                  </div>
                  <div className="sx-miniText">
                    Se sei in ripasso: fai <b>15 domande</b> e ordina per <b>argomento</b>.
                    Se sei vicino all’esame: fai <b>30 domande</b> con <b>timer</b>.
                  </div>
                </div>

                <div className="sx-miniCard">
                  <div className="sx-miniTop">
                    <span className="sx-miniIco isBlue" aria-hidden="true">
                      <IconList />
                    </span>
                    Cosa ottieni
                  </div>

                  <div className="sx-miniList" role="list">
                    <div className="sx-miniItem" role="listitem">
                      <span className="sx-miniDot" aria-hidden="true" />
                      Correzione immediata, senza giri.
                    </div>
                    <div className="sx-miniItem" role="listitem">
                      <span className="sx-miniDot" aria-hidden="true" />
                      Spiegazione breve per fissare il concetto.
                    </div>
                    <div className="sx-miniItem" role="listitem">
                      <span className="sx-miniDot" aria-hidden="true" />
                      Allenamento “da esame”: ritmo e focus.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="sx-right" aria-hidden="true">
            <div className="sx-visual">
              <div className="sx-visualGlow" />
              <img className="sx-img" src={heroImg} alt="" />
              <div className="sx-overlay" />

              <div className="sx-float">
                <div className="sx-floatTitle">Modalità simulazione</div>
                <div className="sx-floatSub">Entra, scegli e parti.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ================= Icons ================= */

function IconTip() {
  return (
    <span className="sx-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M9 18h6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M10 22h4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M8.5 14.5c-1.5-1.2-2.5-3-2.5-5a6 6 0 1 1 12 0c0 2-1 3.8-2.5 5-.7.6-1.2 1.3-1.5 2.1H10c-.3-.8-.8-1.5-1.5-2.1Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function IconList() {
  return (
    <span className="sx-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M9 6h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M9 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M9 18h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4 6h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M4 12h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M4 18h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/* ================= CSS ================= */

const css = `
:root{
  --dino2:#16a34a;
  --med2:#0ea5e9;
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

/* HERO */
.sx-hero{
  position: relative;
  border-radius: 28px;
  border: 1px solid var(--bd);
  background:
    radial-gradient(800px 280px at 15% -25%, rgba(34,197,94,0.16), transparent 60%),
    radial-gradient(800px 280px at 75% -30%, rgba(56,189,248,0.16), transparent 55%),
    rgba(255,255,255,0.92);
  backdrop-filter: blur(14px);
  box-shadow: var(--shadow);
  padding: 30px;
}

/* KICKER */
.sx-kicker{
  position:absolute;
  top:14px;
  left:14px;
  display:flex;
  align-items:center;
  gap:10px;
  padding:10px 14px;
  border-radius:999px;
  border:1px solid var(--bd);
  background:rgba(255,255,255,0.75);
  font-weight:900;
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
}
@media (max-width: 980px){
  .sx-kicker{ position: static; margin-bottom: 10px; }
}

.sx-dot{
  width:10px;height:10px;border-radius:999px;
  background:linear-gradient(90deg,var(--dino2),var(--med2));
}
.sx-brand{display:flex}
.sx-dino{color:var(--dino2);font-weight:1000}
.sx-med{color:var(--med2);font-weight:1000}
.sx-sep{opacity:.5}

/* GRID */
.sx-grid{
  display:grid;
  grid-template-columns:1.05fr .95fr;
  gap:28px;
  padding-top:40px;
  align-items:center;
}
@media(max-width:900px){
  .sx-grid{grid-template-columns:1fr; padding-top: 0;}
}

/* TEXT */
.sx-title{
  font-size:44px;
  font-weight:1000;
  letter-spacing:-0.035em;
  margin:0;
  color:var(--ink);
  line-height: 1.05;
}
@media (max-width: 520px){
  .sx-title{ font-size: 34px; }
}
.sx-grad{
  background:linear-gradient(90deg,var(--dino2),var(--med2));
  -webkit-background-clip:text;
  color:transparent;
}
.sx-lead{
  margin:8px 0 6px;
  font-weight:950;
  color:rgba(15,23,42,0.80);
}
.sx-sub{
  margin:0;
  max-width:70ch;
  color:var(--ink2);
  font-weight:850;
}

/* FLOW */
.sx-flow{
  margin-top:18px;
  display:flex;
  align-items:center;
  gap:14px;
  flex-wrap:wrap;
}
.sx-flowItem{
  display:flex;
  align-items:center;
  gap:8px;
  font-weight:950;
  color: rgba(15,23,42,0.82);
}
.sx-flowNum{
  width:28px;height:28px;
  border-radius:999px;
  display:grid;place-items:center;
  background:linear-gradient(90deg,var(--dino2),var(--med2));
  color:white;
  font-size:14px;
}
.sx-flowSep{
  width:22px;
  height:1px;
  background:rgba(15,23,42,0.2);
}

/* ACTIONS */
.sx-actions{
  margin-top:22px;
  display:flex;
  gap:14px;
  align-items:flex-start;
  flex-wrap:wrap;
}

/* CTA */
.sx-btn{
  position:relative;
  border-radius:999px;
  padding:13px 18px;
  font-weight:1000;
  border:1px solid var(--bd);
  cursor:pointer;
  box-shadow: 0 14px 30px rgba(2,6,23,0.10);
  transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
}
.sx-btn:hover{
  transform: translateY(-1px);
  box-shadow: 0 18px 40px rgba(2,6,23,0.14);
  filter: saturate(1.03);
}
.sx-primary{
  background:linear-gradient(90deg,var(--dino2),var(--med2));
  color:white;
  border: 1px solid rgba(255,255,255,0.22);
}
.sx-shine{
  position:absolute;inset:0;
  background:linear-gradient(115deg,transparent,rgba(255,255,255,.25),transparent);
  transform:translateX(-120%);
  animation:sxShine 4s infinite;
  pointer-events:none;
}
@keyframes sxShine{
  0%,60%{transform:translateX(-120%)}
  100%{transform:translateX(120%)}
}

/* MINI (sostituto delle pills) */
.sx-mini{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  align-items: stretch;
  flex: 1;
  min-width: 280px;
}
@media (max-width: 900px){
  .sx-mini{ grid-template-columns: 1fr; min-width: 100%; }
}

.sx-miniCard{
  border-radius: 18px;
  border: 1px solid var(--bd);
  background: rgba(255,255,255,0.74);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
  padding: 12px;
}

.sx-miniTop{
  display:flex;
  align-items:center;
  gap: 8px;
  font-weight: 1000;
  color: rgba(15,23,42,0.88);
  margin-bottom: 8px;
}
.sx-miniIco{
  width: 34px; height: 34px;
  border-radius: 14px;
  display:grid; place-items:center;
  border: 1px solid rgba(15,23,42,0.08);
  background: linear-gradient(135deg, rgba(34,197,94,0.14), rgba(34,197,94,0.06));
  color: rgba(22,163,74,0.95);
}
.sx-miniIco.isBlue{
  background: linear-gradient(135deg, rgba(56,189,248,0.16), rgba(56,189,248,0.06));
  color: rgba(14,165,233,0.95);
}

.sx-miniText{
  font-weight: 850;
  color: rgba(15,23,42,0.72);
  line-height: 1.35;
}
.sx-miniText b{ color: rgba(15,23,42,0.92); }

.sx-miniList{ display:grid; gap: 8px; }
.sx-miniItem{
  display:flex;
  gap: 10px;
  align-items:flex-start;
  font-weight: 850;
  color: rgba(15,23,42,0.72);
  line-height: 1.28;
}
.sx-miniDot{
  width: 10px; height: 10px;
  border-radius: 999px;
  margin-top: 4px;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  flex: 0 0 auto;
}

/* VISUAL */
.sx-visual{
  position:relative;
  height:420px;
  border-radius:24px;
  overflow:hidden;
  border:1px solid var(--bd);
  box-shadow:var(--shadow);
  background: rgba(255,255,255,0.92);
}
@media (max-width: 900px){
  .sx-visual{ height: 300px; }
}

.sx-visualGlow{
  position:absolute;
  inset:-60px;
  background:
    radial-gradient(420px 240px at 30% 20%, rgba(34,197,94,0.25), transparent),
    radial-gradient(420px 240px at 70% 20%, rgba(56,189,248,0.25), transparent);
  filter:blur(30px);
  opacity: .55;
  pointer-events:none;
  z-index:0;
}
.sx-img{
  width:100%;height:100%;
  object-fit:cover;
  position:relative;
  z-index:1;
  transform: scale(1.02);
  filter: saturate(0.96) contrast(1.06);
}
.sx-overlay{
  position:absolute;inset:0;
  z-index:2;
  background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.85));
}
.sx-float{
  position:absolute;
  bottom:14px;left:14px;right:14px;
  padding:12px;
  border-radius:18px;
  background:rgba(255,255,255,0.80);
  backdrop-filter:blur(12px);
  z-index:3;
  border: 1px solid rgba(255,255,255,0.40);
  box-shadow: 0 18px 55px rgba(2,6,23,0.10);
}
.sx-floatTitle{font-weight:1000;color: rgba(15,23,42,0.90);}
.sx-floatSub{margin-top:6px;font-weight:850;color:var(--ink2);}

/* ICON BASE */
.sx-ico{ width: 18px; height: 18px; display:inline-grid; place-items:center; }
.sx-ico svg{ width: 18px; height: 18px; }
`;