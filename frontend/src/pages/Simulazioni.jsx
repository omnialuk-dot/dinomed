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
              Simulazioni pensate per farti concentrare su ciò che conta,
              con un’interfaccia pulita e una correzione immediata.
            </p>

            {/* FLOW LINE */}
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
            </div>

            {/* ANIMAZIONE PREMIUM (decorativa, ZERO testo) */}
            <div className="sx-hud" aria-hidden="true">
              <div className="sx-hudGlow" />
              <div className="sx-hudRow">
                <div className="sx-hudChip isA">
                  <span className="sx-hudShine" />
                  <div className="sx-hudBars">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </div>

                <div className="sx-hudChip isB">
                  <span className="sx-hudShine" />
                  <div className="sx-hudRing">
                    <span className="sx-hudDot" />
                  </div>
                </div>

                <div className="sx-hudChip isC">
                  <span className="sx-hudShine" />
                  <div className="sx-hudChecks">
                    <span className="sx-hudCheck" />
                    <span className="sx-hudCheck" />
                    <span className="sx-hudCheck" />
                  </div>
                </div>
              </div>

              <div className="sx-hudLine" />
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

/* ========= HUD ANIMATA (decorativa) ========= */
.sx-hud{
  margin-top: 14px;
  max-width: 520px;
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.70);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
  padding: 12px;
  position: relative;
  overflow: hidden;
}
.sx-hudGlow{
  position:absolute;
  inset:-50px;
  background:
    radial-gradient(320px 160px at 22% 40%, rgba(34,197,94,0.18), transparent 60%),
    radial-gradient(320px 160px at 78% 30%, rgba(56,189,248,0.18), transparent 60%);
  filter: blur(22px);
  opacity: .85;
  pointer-events:none;
}
.sx-hudRow{
  position: relative;
  z-index: 1;
  display:flex;
  gap: 10px;
  align-items:center;
}
.sx-hudChip{
  position: relative;
  flex: 1;
  height: 46px;
  border-radius: 16px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.72);
  box-shadow: 0 12px 26px rgba(2,6,23,0.06);
  overflow:hidden;
  transform: translateY(0);
  animation: sxFloat 3.6s ease-in-out infinite;
}
.sx-hudChip.isB{ animation-delay: .18s; }
.sx-hudChip.isC{ animation-delay: .36s; }

@keyframes sxFloat{
  0%,100%{ transform: translateY(0); }
  50%{ transform: translateY(-3px); }
}

/* shimmer */
.sx-hudShine{
  position:absolute;
  inset:0;
  background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.35) 25%, transparent 55%);
  transform: translateX(-140%);
  animation: sxHudShine 2.8s ease-in-out infinite;
  opacity: .9;
}
.sx-hudChip.isB .sx-hudShine{ animation-delay: .25s; }
.sx-hudChip.isC .sx-hudShine{ animation-delay: .50s; }
@keyframes sxHudShine{
  0%,55%{ transform: translateX(-140%); }
  100%{ transform: translateX(140%); }
}

/* chip A: bars pulse */
.sx-hudBars{
  height:100%;
  display:flex;
  align-items:flex-end;
  justify-content:center;
  gap: 6px;
  padding: 10px 0;
}
.sx-hudBars span{
  width: 6px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(22,163,74,0.75), rgba(14,165,233,0.55));
  height: 18px;
  animation: sxBars 1.6s ease-in-out infinite;
}
.sx-hudBars span:nth-child(2){ animation-delay: .12s; height: 24px; }
.sx-hudBars span:nth-child(3){ animation-delay: .24s; height: 16px; }
.sx-hudBars span:nth-child(4){ animation-delay: .36s; height: 22px; }
@keyframes sxBars{
  0%,100%{ transform: scaleY(0.75); opacity: .70; }
  50%{ transform: scaleY(1.15); opacity: .95; }
}

/* chip B: orbit dot */
.sx-hudRing{
  width: 30px;
  height: 30px;
  border-radius: 999px;
  margin: 8px auto;
  border: 1px solid rgba(15,23,42,0.12);
  position: relative;
  background: rgba(15,23,42,0.03);
}
.sx-hudDot{
  width: 8px; height: 8px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  position:absolute;
  top: 50%; left: 50%;
  transform-origin: -10px -10px;
  animation: sxOrbit 2.2s linear infinite;
}
@keyframes sxOrbit{
  0%{ transform: translate(-50%,-50%) rotate(0deg) translate(12px); }
  100%{ transform: translate(-50%,-50%) rotate(360deg) translate(12px); }
}

/* chip C: checks tick */
.sx-hudChecks{
  height:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  gap: 10px;
}
.sx-hudCheck{
  width: 10px; height: 10px;
  border-radius: 999px;
  border: 2px solid rgba(15,23,42,0.22);
  position: relative;
  background: rgba(255,255,255,0.65);
  animation: sxTick 1.9s ease-in-out infinite;
}
.sx-hudCheck:nth-child(2){ animation-delay: .18s; }
.sx-hudCheck:nth-child(3){ animation-delay: .36s; }
@keyframes sxTick{
  0%,60%,100%{
    border-color: rgba(15,23,42,0.20);
    box-shadow: none;
    transform: scale(1);
  }
  30%{
    border-color: rgba(14,165,233,0.55);
    box-shadow: 0 10px 18px rgba(14,165,233,0.16);
    transform: scale(1.08);
  }
}

/* underline line */
.sx-hudLine{
  position: relative;
  z-index: 1;
  margin-top: 10px;
  height: 2px;
  border-radius: 999px;
  background: rgba(15,23,42,0.08);
  overflow:hidden;
}
.sx-hudLine::after{
  content:"";
  position:absolute;
  inset:0;
  background: linear-gradient(90deg, transparent, rgba(22,163,74,0.35), rgba(14,165,233,0.35), transparent);
  transform: translateX(-120%);
  animation: sxLine 2.6s ease-in-out infinite;
}
@keyframes sxLine{
  0%,55%{ transform: translateX(-120%); opacity: .35; }
  100%{ transform: translateX(120%); opacity: .35; }
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
`;