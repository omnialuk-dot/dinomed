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
              Simulazioni pensate per farti concentrare su ciò che conta, con un’interfaccia pulita e una correzione
              immediata.
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

            {/* STORY STRIP (dino + pause + props) */}
            <div className="sx-story" aria-hidden="true">
              <div className="sx-storyGlow" />

              <div className="sx-track">
                <span className="sx-node n1" />
                <span className="sx-node n2" />
                <span className="sx-node n3" />
                <span className="sx-finish" />
              </div>

              {/* Dino wrapper moves by % (responsive) */}
              <div className="sx-dinoWrap">
                <div className="sx-dinoChar">
                  {/* base */}
                  <span className="d-body" />
                  <span className="d-belly" />
                  <span className="d-head" />
                  <span className="d-eye" />
                  <span className="d-mouth" />
                  <span className="d-arm" />
                  <span className="d-leg l1" />
                  <span className="d-leg l2" />
                  <span className="d-tail" />

                  {/* props (appear by phase) */}
                  <span className="p-book" />
                  <span className="p-desk" />
                  <span className="p-pen" />
                  <span className="p-cap" />
                  <span className="p-star s1" />
                  <span className="p-star s2" />
                  <span className="p-star s3" />
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

const css = `
:root{
  --dino2:#16a34a;
  --med2:#0ea5e9;
  --ink: rgba(15,23,42,0.92);
  --ink2: rgba(15,23,42,0.72);
  --bd: rgba(15,23,42,0.10);
  --shadow: 0 16px 60px rgba(2,6,23,0.10);
}

.sx{ max-width: 1120px; margin: 0 auto; padding: 22px; }

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
  position:absolute; top:14px; left:14px;
  display:flex; align-items:center; gap:10px;
  padding:10px 14px; border-radius:999px;
  border:1px solid var(--bd);
  background:rgba(255,255,255,0.75);
  font-weight:900;
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
}
@media (max-width: 980px){
  .sx-kicker{ position: static; margin-bottom: 10px; }
}
.sx-dot{ width:10px;height:10px;border-radius:999px; background:linear-gradient(90deg,var(--dino2),var(--med2)); }
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
@media (max-width: 520px){ .sx-title{ font-size: 34px; } }
.sx-grad{ background:linear-gradient(90deg,var(--dino2),var(--med2)); -webkit-background-clip:text; background-clip:text; color:transparent; }
.sx-lead{ margin:8px 0 6px; font-weight:950; color:rgba(15,23,42,0.80); }
.sx-sub{ margin:0; max-width:70ch; color:var(--ink2); font-weight:850; }

/* FLOW */
.sx-flow{ margin-top:18px; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
.sx-flowItem{ display:flex; align-items:center; gap:8px; font-weight:950; color: rgba(15,23,42,0.82); }
.sx-flowNum{
  width:28px;height:28px;border-radius:999px;
  display:grid;place-items:center;
  background:linear-gradient(90deg,var(--dino2),var(--med2));
  color:white;font-size:14px;
}
.sx-flowSep{ width:22px; height:1px; background:rgba(15,23,42,0.2); }

/* CTA */
.sx-actions{ margin-top:22px; display:flex; gap:14px; align-items:flex-start; flex-wrap:wrap; }
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
.sx-btn:hover{ transform: translateY(-1px); box-shadow: 0 18px 40px rgba(2,6,23,0.14); filter: saturate(1.03); }
.sx-primary{ background:linear-gradient(90deg,var(--dino2),var(--med2)); color:white; border: 1px solid rgba(255,255,255,0.22); }
.sx-shine{
  position:absolute; inset:0;
  background:linear-gradient(115deg,transparent,rgba(255,255,255,.25),transparent);
  transform:translateX(-120%);
  animation:sxShine 4s infinite;
  pointer-events:none;
}
@keyframes sxShine{ 0%,60%{transform:translateX(-120%)} 100%{transform:translateX(120%)} }

/* ===== STORY STRIP ===== */
.sx-story{
  margin-top: 22px;
  max-width: 520px;
  height: 84px;
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.70);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
  position: relative;
  overflow: hidden;
}
.sx-storyGlow{
  position:absolute;
  inset:-50px;
  background:
    radial-gradient(320px 160px at 18% 70%, rgba(34,197,94,0.18), transparent 60%),
    radial-gradient(320px 160px at 82% 40%, rgba(56,189,248,0.18), transparent 60%);
  filter: blur(24px);
  opacity: .95;
  pointer-events:none;
}

/* track */
.sx-track{
  position:absolute;
  left: 14px;
  right: 14px;
  top: 48px;
  height: 2px;
  border-radius: 999px;
  background: rgba(15,23,42,0.08);
  z-index: 1;
}
.sx-node{
  position:absolute; top: -6px;
  width: 14px; height: 14px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.72);
  box-shadow: 0 10px 22px rgba(2,6,23,0.06);
}
.sx-node.n1{ left: 18%; }
.sx-node.n2{ left: 50%; }
.sx-node.n3{ left: 82%; }

.sx-node::after{
  content:"";
  position:absolute; inset:2px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  opacity: .10;
}
.sx-node.n1::after{ animation: sxNode 10.5s ease-in-out infinite; }
.sx-node.n2::after{ animation: sxNode 10.5s ease-in-out infinite; animation-delay: 2.3s; }
.sx-node.n3::after{ animation: sxNode 10.5s ease-in-out infinite; animation-delay: 4.6s; }
@keyframes sxNode{
  0%,70%,100%{ opacity: .10; transform: scale(1); }
  25%{ opacity: .95; transform: scale(1.10); }
}

.sx-finish{
  position:absolute;
  right: -2px;
  top: -10px;
  width: 30px;
  height: 30px;
  border-radius: 14px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.68);
  box-shadow: 0 18px 40px rgba(2,6,23,0.08);
}

/* Dino moves with % (responsive) + pause */
.sx-dinoWrap{
  position:absolute;
  top: 14px;
  left: 14px;
  width: 46px;
  height: 56px;
  z-index: 2;
  animation: sxTravel 10.5s ease-in-out infinite;
  will-change: left, opacity;
}

/* pause on 18% / 50% / 82% */
@keyframes sxTravel{
  0%   { left: 14px; opacity: 0; }
  6%   { opacity: 1; }

  20%  { left: calc(18% - 23px); }
  34%  { left: calc(18% - 23px); } /* read */

  52%  { left: calc(50% - 23px); }
  66%  { left: calc(50% - 23px); } /* write */

  84%  { left: calc(82% - 23px); }
  94%  { left: calc(82% - 23px); opacity: 1; } /* graduate */

  100% { left: calc(100% - 46px - 14px); opacity: 0; }
}

.sx-dinoChar{ position: relative; width: 46px; height: 56px; }

/* Dino base */
.d-body{
  position:absolute; left: 10px; top: 18px;
  width: 24px; height: 22px;
  border-radius: 14px 14px 12px 12px;
  background: linear-gradient(135deg, rgba(22,163,74,0.85), rgba(14,165,233,0.70));
  box-shadow: 0 14px 26px rgba(2,6,23,0.08);
}
.d-belly{
  position:absolute; left: 16px; top: 26px;
  width: 12px; height: 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.75);
  opacity: .9;
}
.d-head{
  position:absolute; left: 22px; top: 10px;
  width: 18px; height: 16px;
  border-radius: 14px 14px 12px 12px;
  background: rgba(255,255,255,0.84);
  border: 1px solid rgba(15,23,42,0.10);
}
.d-eye{
  position:absolute; left: 33px; top: 16px;
  width: 3px; height: 3px;
  border-radius: 999px;
  background: rgba(15,23,42,0.55);
}
.d-mouth{
  position:absolute; left: 31px; top: 20px;
  width: 7px; height: 2px;
  border-radius: 999px;
  background: rgba(15,23,42,0.18);
}
.d-tail{
  position:absolute; left: 4px; top: 26px;
  width: 14px; height: 8px;
  border-radius: 999px;
  background: rgba(15,23,42,0.10);
  transform: rotate(-18deg);
  transform-origin: right center;
  animation: sxTail 0.9s ease-in-out infinite;
}
@keyframes sxTail{
  0%,100%{ transform: rotate(-14deg); }
  50%{ transform: rotate(-26deg); }
}
.d-leg{
  position:absolute; top: 40px;
  width: 12px; height: 3px;
  border-radius: 999px;
  background: rgba(15,23,42,0.22);
  transform-origin: 2px 2px;
  animation: sxLeg 0.46s ease-in-out infinite;
}
.d-leg.l1{ left: 14px; }
.d-leg.l2{ left: 20px; animation-delay: .23s; opacity: .9; }
@keyframes sxLeg{
  0%,100%{ transform: rotate(14deg) translateX(0); }
  50%{ transform: rotate(-14deg) translateX(1px); }
}
.d-arm{
  position:absolute; left: 26px; top: 28px;
  width: 10px; height: 3px;
  border-radius: 999px;
  background: rgba(15,23,42,0.18);
  transform-origin: 2px 2px;
  animation: sxArm 0.46s ease-in-out infinite;
}
@keyframes sxArm{
  0%,100%{ transform: rotate(-14deg); }
  50%{ transform: rotate(14deg); }
}

/* PROPS */
.p-book,.p-desk,.p-pen,.p-cap,.p-star{ opacity:0; pointer-events:none; }

/* read phase */
.p-book{
  position:absolute; left: 30px; top: 30px;
  width: 14px; height: 10px;
  border-radius: 3px;
  border: 1px solid rgba(15,23,42,0.12);
  background: rgba(255,255,255,0.82);
  animation: sxBook 10.5s ease-in-out infinite;
}
.p-book::after{
  content:"";
  position:absolute; left: 6px; top: 1px; bottom: 1px;
  width: 1px; background: rgba(15,23,42,0.10);
}
@keyframes sxBook{
  0%,18%{ opacity:0; transform: translateY(2px) rotate(0deg); }
  22%,32%{ opacity:1; transform: translateY(0) rotate(-4deg); }
  36%,100%{ opacity:0; transform: translateY(2px) rotate(0deg); }
}

/* write phase */
.p-desk{
  position:absolute; left: 2px; top: 44px;
  width: 42px; height: 6px;
  border-radius: 999px;
  background: rgba(15,23,42,0.10);
  animation: sxDesk 10.5s ease-in-out infinite;
}
.p-pen{
  position:absolute; left: 30px; top: 36px;
  width: 10px; height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  animation: sxPen 10.5s ease-in-out infinite;
}
@keyframes sxDesk{
  0%,50%{ opacity:0; transform: translateY(2px); }
  56%,64%{ opacity:1; transform: translateY(0); }
  70%,100%{ opacity:0; transform: translateY(2px); }
}
@keyframes sxPen{
  0%,50%{ opacity:0; transform: translateY(2px) rotate(0deg); }
  56%,64%{ opacity:1; transform: translateY(0) rotate(-10deg); }
  70%,100%{ opacity:0; transform: translateY(2px) rotate(0deg); }
}

/* graduate phase */
.p-cap{
  position:absolute; left: 24px; top: 6px;
  width: 16px; height: 6px;
  border-radius: 4px 4px 2px 2px;
  background: rgba(15,23,42,0.28);
  animation: sxCap 10.5s ease-in-out infinite;
}
.p-cap::after{
  content:"";
  position:absolute; left: 7px; top: 5px;
  width: 2px; height: 8px;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--dino2), var(--med2));
  opacity: .9;
}
.p-star{
  position:absolute;
  width: 6px; height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  animation: sxStars 10.5s ease-in-out infinite;
}
.p-star.s1{ left: 44px; top: 10px; transform: rotate(22deg); }
.p-star.s2{ left: 42px; top: 18px; transform: rotate(-18deg); }
.p-star.s3{ left: 38px; top: 6px; transform: rotate(78deg); }

@keyframes sxCap{
  0%,80%{ opacity:0; transform: translateY(2px); }
  86%,96%{ opacity:1; transform: translateY(0); }
  100%{ opacity:0; transform: translateY(2px); }
}
@keyframes sxStars{
  0%,82%{ opacity:0; transform: translateX(0) scaleX(1); }
  90%{ opacity:.95; transform: translateX(4px) scaleX(1.25); }
  96%{ opacity:0; transform: translateX(10px) scaleX(.9); }
  100%{ opacity:0; transform: translateX(0) scaleX(1); }
}

/* ===== RIGHT VISUAL ===== */
.sx-visual{
  position:relative;
  height:420px;
  border-radius:24px;
  overflow:hidden;
  border:1px solid var(--bd);
  box-shadow:var(--shadow);
  background: rgba(255,255,255,0.92);
}
@media (max-width: 900px){ .sx-visual{ height: 300px; } }
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

/* If reduced motion: hide strip to avoid “stuck” pieces */
@media (prefers-reduced-motion: reduce){
  .sx-story{ display:none !important; }
  .sx-shine{ animation: none !important; }
}
`;