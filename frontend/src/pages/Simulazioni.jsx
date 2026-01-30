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

            {/* COME FUNZIONA — versione elegante */}
            <div className="sx-flow">
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

              <div className="sx-pills">
                <span className="sx-pill">⏱ Veloce</span>
                <span className="sx-pill">🎯 Mirata</span>
                <span className="sx-pill">✅ Chiara</span>
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
}
@media(max-width:900px){
  .sx-grid{grid-template-columns:1fr}
}

/* TEXT */
.sx-title{
  font-size:44px;
  font-weight:1000;
  letter-spacing:-0.035em;
  margin:0;
  color:var(--ink);
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
  align-items:center;
  flex-wrap:wrap;
}
.sx-btn{
  position:relative;
  border-radius:999px;
  padding:13px 18px;
  font-weight:1000;
  border:1px solid var(--bd);
  cursor:pointer;
}
.sx-primary{
  background:linear-gradient(90deg,var(--dino2),var(--med2));
  color:white;
}
.sx-shine{
  position:absolute;inset:0;
  background:linear-gradient(115deg,transparent,rgba(255,255,255,.25),transparent);
  transform:translateX(-120%);
  animation:sxShine 4s infinite;
}
@keyframes sxShine{
  0%,60%{transform:translateX(-120%)}
  100%{transform:translateX(120%)}
}

/* PILLS */
.sx-pills{display:flex;gap:10px}
.sx-pill{
  padding:10px 14px;
  border-radius:999px;
  background:rgba(255,255,255,0.65);
  border:1px solid var(--bd);
  font-weight:900;
}

/* VISUAL */
.sx-visual{
  position:relative;
  height:420px;
  border-radius:24px;
  overflow:hidden;
  border:1px solid var(--bd);
  box-shadow:var(--shadow);
}
.sx-visualGlow{
  position:absolute;
  inset:-60px;
  background:
    radial-gradient(420px 240px at 30% 20%, rgba(34,197,94,0.25), transparent),
    radial-gradient(420px 240px at 70% 20%, rgba(56,189,248,0.25), transparent);
  filter:blur(30px);
}
.sx-img{
  width:100%;height:100%;
  object-fit:cover;
  position:relative;
  z-index:1;
}
.sx-overlay{
  position:absolute;inset:0;
  background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.85));
}
.sx-float{
  position:absolute;
  bottom:14px;left:14px;right:14px;
  padding:12px;
  border-radius:18px;
  background:rgba(255,255,255,0.8);
  backdrop-filter:blur(12px);
  z-index:2;
}
.sx-floatTitle{font-weight:1000}
.sx-floatSub{font-weight:850;color:var(--ink2)}
`;