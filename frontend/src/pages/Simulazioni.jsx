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

            {/* STORY ANIMATION (una sola, loop) */}
            <div className="sx-story" aria-hidden="true">
              <div className="sx-storyGlow" />

              {/* track */}
              <div className="sx-track">
                <span className="sx-node n1" />
                <span className="sx-node n2" />
                <span className="sx-node n3" />
                <span className="sx-finish" />
                <span className="sx-spark s1" />
                <span className="sx-spark s2" />
                <span className="sx-spark s3" />
              </div>

              {/* little dude */}
              <div className="sx-dude">
                <span className="sx-head" />
                <span className="sx-body" />
                <span className="sx-leg l1" />
                <span className="sx-leg l2" />
                <span className="sx-arm a1" />
                <span className="sx-arm a2" />
                <span className="sx-pack" />
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
@media (max-width: 980px){ .sx-kicker{ position: static; margin-bottom: 10px; } }
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
@media(max-width:900px){ .sx-grid{grid-template-columns:1fr; padding-top: 0;} }

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
.sx-grad{ background:linear-gradient(90deg,var(--dino2),var(--med2)); -webkit-background-clip:text; color:transparent; }
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
  position:absolute;inset:0;
  background:linear-gradient(115deg,transparent,rgba(255,255,255,.25),transparent);
  transform:translateX(-120%);
  animation:sxShine 4s infinite;
  pointer-events:none;
}
@keyframes sxShine{ 0%,60%{transform:translateX(-120%)} 100%{transform:translateX(120%)} }

/* ========= STORY (ONE animation) ========= */
.sx-story{
  margin-top: 22px; /* più giù rispetto a prima */
  max-width: 520px;
  height: 74px;
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
    radial-gradient(320px 160px at 18% 60%, rgba(34,197,94,0.20), transparent 60%),
    radial-gradient(320px 160px at 82% 45%, rgba(56,189,248,0.20), transparent 60%);
  filter: blur(24px);
  opacity: .90;
  pointer-events:none;
}

/* track line */
.sx-track{
  position:absolute;
  left: 14px;
  right: 14px;
  top: 38px;
  height: 2px;
  border-radius: 999px;
  background: rgba(15,23,42,0.08);
  z-index: 1;
}
.sx-node{
  position:absolute;
  top: -6px;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.72);
  box-shadow: 0 10px 22px rgba(2,6,23,0.06);
}
.sx-node.n1{ left: 18%; }
.sx-node.n2{ left: 50%; }
.sx-node.n3{ left: 82%; }

/* nodes light up in sequence */
.sx-node::after{
  content:"";
  position:absolute; inset:2px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  opacity: .10;
}
.sx-node.n1::after{ animation: sxNode 3.2s ease-in-out infinite; }
.sx-node.n2::after{ animation: sxNode 3.2s ease-in-out infinite .35s; }
.sx-node.n3::after{ animation: sxNode 3.2s ease-in-out infinite .70s; }
@keyframes sxNode{
  0%,65%,100%{ opacity: .10; transform: scale(1); }
  25%{ opacity: .90; transform: scale(1.08); }
}

.sx-finish{
  position:absolute;
  right: -2px;
  top: -10px;
  width: 28px;
  height: 28px;
  border-radius: 14px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.68);
  box-shadow: 0 18px 40px rgba(2,6,23,0.08);
}

/* sparks at finish */
.sx-spark{
  position:absolute;
  right: 10px;
  top: -2px;
  width: 8px; height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  opacity: 0;
}
.sx-spark.s1{ transform: rotate(20deg) translateY(0); }
.sx-spark.s2{ transform: rotate(-20deg) translateY(6px); }
.sx-spark.s3{ transform: rotate(80deg) translateY(2px); }
.sx-spark{ animation: sxSpark 3.2s ease-in-out infinite; }
@keyframes sxSpark{
  0%,72%,100%{ opacity:0; transform: translateX(0) scaleX(1) rotate(20deg); }
  80%{ opacity:.95; transform: translateX(4px) scaleX(1.25) rotate(20deg); }
  90%{ opacity:0; transform: translateX(10px) scaleX(.9) rotate(20deg); }
}

/* The dude walks across */
.sx-dude{
  position:absolute;
  left: 14px;
  top: 14px;
  width: 26px;
  height: 40px;
  z-index: 2;
  animation: sxWalk 3.2s linear infinite;
  will-change: transform;
}
@keyframes sxWalk{
  0%{ transform: translateX(0); opacity: 0; }
  6%{ opacity: 1; }
  92%{ opacity: 1; }
  100%{ transform: translateX(calc(520px - 120px)); opacity: 0; } /* ok su max-width */
}

/* body parts */
.sx-head{
  position:absolute;
  left: 8px; top: 0px;
  width: 10px; height: 10px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.12);
  background: rgba(255,255,255,0.86);
}
.sx-body{
  position:absolute;
  left: 10px; top: 11px;
  width: 6px; height: 14px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(22,163,74,0.75), rgba(14,165,233,0.55));
  box-shadow: 0 10px 22px rgba(2,6,23,0.06);
}
.sx-pack{
  position:absolute;
  left: 2px; top: 13px;
  width: 7px; height: 10px;
  border-radius: 4px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.70);
}
.sx-leg{
  position:absolute;
  top: 24px;
  width: 10px; height: 2px;
  border-radius: 999px;
  background: rgba(15,23,42,0.22);
  transform-origin: 2px 1px;
  animation: sxLeg 0.42s ease-in-out infinite;
}
.sx-leg.l1{ left: 7px; }
.sx-leg.l2{ left: 10px; animation-delay: .21s; opacity: .9; }
@keyframes sxLeg{
  0%,100%{ transform: rotate(16deg) translateX(0); }
  50%{ transform: rotate(-16deg) translateX(1px); }
}

.sx-arm{
  position:absolute;
  top: 16px;
  width: 10px; height: 2px;
  border-radius: 999px;
  background: rgba(15,23,42,0.18);
  transform-origin: 2px 1px;
  animation: sxArm 0.42s ease-in-out infinite;
}
.sx-arm.a1{ left: 9px; }
.sx-arm.a2{ left: 9px; animation-delay: .21s; opacity:.85; }
@keyframes sxArm{
  0%,100%{ transform: rotate(-18deg) translateX(0); }
  50%{ transform: rotate(18deg) translateX(1px); }
}

/* ====== RIGHT visual ====== */
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
`;