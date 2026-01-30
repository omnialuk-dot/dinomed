import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "../assets/photos/typing.jpg";

export default function Simulazioni() {
  const nav = useNavigate();

  const storyRef = useRef(null);
  const mascotWrapRef = useRef(null);

  useEffect(() => {
    const storyEl = storyRef.current;
    const mascotEl = mascotWrapRef.current;
    if (!storyEl || !mascotEl) return;

    let rafId = 0;

    // timeline (ms) — lento + pause (come volevi)
    const T = {
      fadeIn: 450,
      move1: 2200,
      stop1: 1700, // read
      move2: 2200,
      stop2: 1700, // write
      move3: 2200,
      stop3: 1600, // graduate
      exit: 900,
    };
    const total = Object.values(T).reduce((a, b) => a + b, 0);

    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const layout = () => {
      const pad = 14;
      const w = storyEl.clientWidth;
      const dW = 64; // width mascot wrap
      const inner = Math.max(0, w - pad * 2 - dW);

      const x0 = 0;
      const x1 = inner * 0.18;
      const x2 = inner * 0.50;
      const x3 = inner * 0.82;
      const xEnd = inner;

      return { x0, x1, x2, x3, xEnd };
    };

    const setPhase = (p) => {
      storyEl.dataset.phase = p;
    };

    const start = performance.now();

    const tick = (now) => {
      const { x0, x1, x2, x3, xEnd } = layout();
      let t = (now - start) % total;

      // segment borders
      const s0 = 0;
      const s1 = s0 + T.fadeIn;
      const s2 = s1 + T.move1;
      const s3 = s2 + T.stop1;
      const s4 = s3 + T.move2;
      const s5 = s4 + T.stop2;
      const s6 = s5 + T.move3;
      const s7 = s6 + T.stop3;
      const s8 = s7 + T.exit;

      let x = x0;
      let opacity = 1;

      if (t < s1) {
        setPhase("walk");
        opacity = clamp01(t / T.fadeIn);
        x = x0;
      } else if (t < s2) {
        setPhase("walk");
        x = lerp(x0, x1, ease(clamp01((t - s1) / T.move1)));
      } else if (t < s3) {
        setPhase("read");
        x = x1;
      } else if (t < s4) {
        setPhase("walk");
        x = lerp(x1, x2, ease(clamp01((t - s3) / T.move2)));
      } else if (t < s5) {
        setPhase("write");
        x = x2;
      } else if (t < s6) {
        setPhase("walk");
        x = lerp(x2, x3, ease(clamp01((t - s5) / T.move3)));
      } else if (t < s7) {
        setPhase("grad");
        x = x3;
      } else if (t < s8) {
        setPhase("exit");
        const k = clamp01((t - s7) / T.exit);
        x = lerp(x3, xEnd, ease(k));
        opacity = 1 - k;
      } else {
        setPhase("walk");
      }

      mascotEl.style.transform = `translateX(${x}px)`;
      mascotEl.style.opacity = String(opacity);

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <main className="sx">
      <style>{css}</style>

      <section className="sx-hero">
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
            </h1>

            <p className="sx-lead">In modo semplice.</p>

            <p className="sx-sub">
              Simulazioni pensate per farti concentrare su ciò che conta, con un’interfaccia pulita e una correzione
              immediata.
            </p>

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

            {/* STRIP ANIMATA */}
            <div className="sx-story" ref={storyRef} data-phase="walk" aria-hidden="true">
              <div className="sx-storyGlow" />

              <div className="sx-track">
                <span className="sx-node n1" />
                <span className="sx-node n2" />
                <span className="sx-node n3" />
                <span className="sx-finish" />
              </div>

              <div className="sx-mascotWrap" ref={mascotWrapRef}>
                <div className="sx-mascot">
                  {/* “SIMILE” al tuo (testa grande, spine, mascherina) */}
                  <span className="m-spines" />
                  <span className="m-head" />
                  <span className="m-face" />
                  <span className="m-eye" />
                  <span className="m-mask" />
                  <span className="m-neck" />
                  <span className="m-body" />
                  <span className="m-tail" />
                  <span className="m-arm" />
                  <span className="m-leg l1" />
                  <span className="m-leg l2" />

                  {/* props per fasi */}
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
  --dino:#22c55e;
  --dino2:#16a34a;
  --med:#38bdf8;
  --med2:#0ea5e9;
  --ink: rgba(15,23,42,0.92);
  --ink2: rgba(15,23,42,0.72);
  --bd: rgba(15,23,42,0.10);
  --shadow: 0 16px 60px rgba(2,6,23,0.10);
}

.sx{ max-width:1120px; margin:0 auto; padding:22px; }

.sx-hero{
  position:relative;
  border-radius:28px;
  border:1px solid var(--bd);
  background:
    radial-gradient(900px 320px at 15% -25%, rgba(34,197,94,.18), transparent 60%),
    radial-gradient(900px 320px at 80% -30%, rgba(56,189,248,.18), transparent 55%),
    rgba(255,255,255,.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: var(--shadow);
  padding:30px;
  overflow:hidden;
}

.sx-kicker{
  position:absolute;
  top:14px; left:14px;
  display:flex; align-items:center; gap:10px;
  padding:10px 14px;
  border-radius:999px;
  border:1px solid var(--bd);
  background:rgba(255,255,255,.76);
  font-weight:950;
  color: rgba(15,23,42,.82);
}
@media (max-width: 980px){
  .sx-kicker{ position: static; margin-bottom: 10px; display:inline-flex; }
}
.sx-dot{ width:10px; height:10px; border-radius:999px; background:linear-gradient(90deg,var(--dino),var(--med)); box-shadow:0 10px 20px rgba(2,6,23,.08); }
.sx-brand{ display:flex; }
.sx-dino{ color:var(--dino2); font-weight:1000; }
.sx-med{ color:var(--med2); font-weight:1000; }
.sx-sep{ opacity:.55; }

.sx-grid{
  display:grid;
  grid-template-columns:1.05fr .95fr;
  gap:28px;
  padding-top:40px;
  align-items:center;
}
@media(max-width:900px){
  .sx-grid{ grid-template-columns:1fr; padding-top:0; }
}

.sx-title{
  margin:0;
  font-size:44px;
  font-weight:1000;
  letter-spacing:-0.035em;
  color: var(--ink);
  line-height:1.05;
}
@media (max-width:520px){ .sx-title{ font-size:34px; } }

.sx-grad{
  background:linear-gradient(90deg,var(--dino2),var(--med2));
  -webkit-background-clip:text;
  background-clip:text;
  color:transparent;
}

.sx-lead{
  margin:8px 0 6px;
  font-weight:950;
  color: rgba(15,23,42,.80);
}

.sx-sub{
  margin:0;
  max-width:70ch;
  color: var(--ink2);
  font-weight:850;
}

/* Flow */
.sx-flow{ margin-top:18px; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
.sx-flowItem{ display:flex; align-items:center; gap:8px; font-weight:950; color: rgba(15,23,42,.82); }
.sx-flowNum{
  width:28px;height:28px;border-radius:999px;
  display:grid;place-items:center;
  background:linear-gradient(90deg,var(--dino2),var(--med2));
  color:white;font-size:14px;
}
.sx-flowSep{ width:22px; height:1px; background: rgba(15,23,42,.20); }

/* CTA */
.sx-actions{ margin-top:22px; display:flex; gap:14px; align-items:center; flex-wrap:wrap; }
.sx-btn{
  position:relative;
  overflow:hidden;
  border-radius:999px;
  padding:13px 18px;
  font-weight:1000;
  border:1px solid var(--bd);
  cursor:pointer;
  box-shadow:0 14px 30px rgba(2,6,23,.10);
  transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
}
.sx-btn:hover{ transform: translateY(-1px); box-shadow:0 18px 40px rgba(2,6,23,.14); filter:saturate(1.03); }
.sx-primary{ background:linear-gradient(90deg,var(--dino2),var(--med2)); color:white; border:1px solid rgba(255,255,255,.22); }
.sx-shine{
  position:absolute; inset:0;
  background:linear-gradient(115deg,transparent,rgba(255,255,255,.25),transparent);
  transform:translateX(-120%);
  animation:sxShine 4s infinite;
  pointer-events:none;
}
@keyframes sxShine{ 0%,60%{transform:translateX(-120%)} 100%{transform:translateX(120%)} }

/* RIGHT VISUAL */
.sx-visual{
  position:relative;
  height:420px;
  border-radius:24px;
  overflow:hidden;
  border:1px solid var(--bd);
  box-shadow: var(--shadow);
  background: rgba(255,255,255,.92);
}
@media(max-width:900px){ .sx-visual{ height:300px; } }
.sx-visualGlow{
  position:absolute;
  inset:-60px;
  background:
    radial-gradient(420px 240px at 30% 20%, rgba(34,197,94,.25), transparent),
    radial-gradient(420px 240px at 70% 20%, rgba(56,189,248,.25), transparent);
  filter: blur(30px);
  opacity:.55;
  pointer-events:none;
  z-index:0;
}
.sx-img{
  position:relative; z-index:1;
  width:100%; height:100%;
  object-fit:cover;
  transform: scale(1.02);
  filter: saturate(.96) contrast(1.06);
}
.sx-overlay{
  position:absolute; inset:0; z-index:2;
  background: linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.86));
}
.sx-float{
  position:absolute;
  left:14px; right:14px; bottom:14px;
  z-index:3;
  border-radius:18px;
  border:1px solid rgba(255,255,255,.40);
  background: rgba(255,255,255,.80);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 18px 55px rgba(2,6,23,.10);
  padding:12px;
}
.sx-floatTitle{ font-weight:1000; color: rgba(15,23,42,.90); }
.sx-floatSub{ margin-top:6px; font-weight:850; color: rgba(15,23,42,.70); }

/* ===========================
   STORY STRIP (sotto al bottone)
   =========================== */
.sx-story{
  margin-top:22px;
  max-width:520px;
  height:84px;
  border-radius:18px;
  border:1px solid rgba(15,23,42,.10);
  background: rgba(255,255,255,.74);
  box-shadow: 0 14px 30px rgba(2,6,23,.06);
  position:relative;
  overflow:hidden;
}
.sx-storyGlow{
  position:absolute;
  inset:-50px;
  background:
    radial-gradient(320px 160px at 18% 70%, rgba(34,197,94,.18), transparent 60%),
    radial-gradient(320px 160px at 82% 40%, rgba(56,189,248,.18), transparent 60%);
  filter: blur(24px);
  opacity:.95;
  pointer-events:none;
}
.sx-track{
  position:absolute;
  left:14px; right:14px;
  top:48px;
  height:2px;
  border-radius:999px;
  background: rgba(15,23,42,.08);
  z-index:1;
}
.sx-node{
  position:absolute;
  top:-6px;
  width:14px; height:14px;
  border-radius:999px;
  border:1px solid rgba(15,23,42,.10);
  background: rgba(255,255,255,.72);
  box-shadow: 0 10px 22px rgba(2,6,23,.06);
}
.sx-node.n1{ left:18%; }
.sx-node.n2{ left:50%; }
.sx-node.n3{ left:82%; }
.sx-finish{
  position:absolute;
  right:-2px;
  top:-10px;
  width:30px; height:30px;
  border-radius:14px;
  border:1px solid rgba(15,23,42,.10);
  background: rgba(255,255,255,.68);
  box-shadow: 0 18px 40px rgba(2,6,23,.08);
}

/* ===========================
   MASCOT (SIMILE ALL'IMMAGINE)
   - rivolto a destra
   - corpo tutto verde
   =========================== */
.sx-mascotWrap{
  position:absolute;
  left:14px;
  top:10px;
  width:64px;
  height:64px;
  z-index:2;
  transform: translateX(0);
  opacity:1;
  will-change: transform, opacity;
}

.sx-mascot{ position:relative; width:64px; height:64px; }

/* spines */
.m-spines{
  position:absolute;
  left:22px;
  top:1px;
  width:38px;
  height:28px;
  background:
    radial-gradient(10px 10px at 8% 70%, rgba(22,163,74,.95) 0 60%, transparent 62%),
    radial-gradient(10px 10px at 30% 30%, rgba(22,163,74,.95) 0 60%, transparent 62%),
    radial-gradient(10px 10px at 55% 22%, rgba(22,163,74,.95) 0 60%, transparent 62%),
    radial-gradient(10px 10px at 78% 40%, rgba(22,163,74,.95) 0 60%, transparent 62%),
    radial-gradient(10px 10px at 92% 70%, rgba(22,163,74,.95) 0 60%, transparent 62%);
  opacity:.95;
}

/* head */
.m-head{
  position:absolute;
  left:16px;
  top:8px;
  width:40px;
  height:28px;
  border-radius:22px 26px 20px 18px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  box-shadow: 0 10px 22px rgba(2,6,23,.10);
}

/* face highlight */
.m-face{
  position:absolute;
  left:24px;
  top:14px;
  width:28px;
  height:18px;
  border-radius:18px;
  background: rgba(255,255,255,.14);
  transform: skewX(-10deg);
  opacity:.9;
}

/* eye */
.m-eye{
  position:absolute;
  left:44px;
  top:16px;
  width:6px;
  height:6px;
  border-radius:999px;
  background:#0f172a;
}

/* mask */
.m-mask{
  position:absolute;
  left:44px;
  top:22px;
  width:18px;
  height:12px;
  border-radius:7px;
  background: linear-gradient(180deg, #93c5fd, #38bdf8);
  box-shadow: inset 0 -2px 0 rgba(0,0,0,.10);
}

/* neck */
.m-neck{
  position:absolute;
  left:26px;
  top:30px;
  width:10px;
  height:10px;
  border-radius:999px;
  background: #16a34a;
}

/* body */
.m-body{
  position:absolute;
  left:18px;
  top:34px;
  width:30px;
  height:22px;
  border-radius:16px;
  background: linear-gradient(180deg, #22c55e, #16a34a);
}

/* tail */
.m-tail{
  position:absolute;
  left:2px;
  top:42px;
  width:22px;
  height:10px;
  border-radius:999px;
  background:#16a34a;
  transform-origin:right center;
  animation: mTail .9s ease-in-out infinite;
}
@keyframes mTail{
  0%,100%{ transform: rotate(10deg); }
  50%{ transform: rotate(-12deg); }
}

/* arm */
.m-arm{
  position:absolute;
  left:40px;
  top:42px;
  width:16px;
  height:7px;
  border-radius:999px;
  background:#15803d;
  transform-origin: 3px 3px;
  animation: mArm .55s ease-in-out infinite;
}
@keyframes mArm{
  0%,100%{ transform: rotate(-10deg); }
  50%{ transform: rotate(10deg); }
}

/* legs */
.m-leg{
  position:absolute;
  top:54px;
  width:18px;
  height:7px;
  border-radius:999px;
  background:#15803d;
  transform-origin: 3px 3px;
  animation: mLeg .55s ease-in-out infinite;
}
.m-leg.l1{ left:16px; }
.m-leg.l2{ left:32px; animation-delay:.275s; }
@keyframes mLeg{
  0%,100%{ transform: rotate(12deg); }
  50%{ transform: rotate(-12deg); }
}

/* pause legs/arm when not walking */
.sx-story[data-phase="walk"] .m-leg,
.sx-story[data-phase="walk"] .m-arm{ animation-play-state: running; }
.sx-story:not([data-phase="walk"]) .m-leg,
.sx-story:not([data-phase="walk"]) .m-arm{ animation-play-state: paused; }

/* ===========================
   PROPS (NON bianchi)
   =========================== */
.p-book,.p-desk,.p-pen,.p-cap,.p-star{
  opacity:0;
  pointer-events:none;
  transition: opacity .18s ease, transform .18s ease;
}

/* BOOK (azzurro, visibile) */
.p-book{
  position:absolute;
  left:52px;
  top:42px;
  width:12px;
  height:14px;
  border-radius:3px;
  background: linear-gradient(180deg, #60a5fa, #38bdf8);
  box-shadow: 0 10px 20px rgba(2,6,23,.10);
}
.p-book::after{
  content:"";
  position:absolute;
  left:5px; top:2px; bottom:2px;
  width:1px;
  background: rgba(255,255,255,.35);
}

/* DESK + PEN */
.p-desk{
  position:absolute;
  left:8px;
  top:60px;
  width:48px;
  height:6px;
  border-radius:999px;
  background: rgba(15,23,42,.10);
}
.p-pen{
  position:absolute;
  left:46px;
  top:54px;
  width:12px;
  height:3px;
  border-radius:999px;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  transform: rotate(-10deg);
}

/* GRAD CAP + STARS */
.p-cap{
  position:absolute;
  left:40px;
  top:8px;
  width:18px;
  height:6px;
  border-radius:4px 4px 2px 2px;
  background: rgba(15,23,42,.30);
}
.p-cap::after{
  content:"";
  position:absolute;
  left:8px;
  top:5px;
  width:2px;
  height:8px;
  border-radius:999px;
  background: linear-gradient(180deg, var(--dino2), var(--med2));
  opacity:.9;
}

.p-star{
  position:absolute;
  width:6px;
  height:2px;
  border-radius:999px;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
}
.p-star.s1{ left:62px; top:10px; transform: rotate(22deg); }
.p-star.s2{ left:60px; top:18px; transform: rotate(-18deg); }
.p-star.s3{ left:56px; top:6px;  transform: rotate(78deg); }

@keyframes starPop{
  0%,100%{ transform: translateX(0) scaleX(1); opacity:.70; }
  50%{ transform: translateX(4px) scaleX(1.25); opacity:1; }
}

/* phases */
.sx-story[data-phase="read"] .p-book{ opacity:1; transform: translateY(-1px); }
.sx-story[data-phase="write"] .p-desk,
.sx-story[data-phase="write"] .p-pen{ opacity:1; }
.sx-story[data-phase="grad"] .p-cap{ opacity:1; }
.sx-story[data-phase="grad"] .p-star{ opacity:1; animation: starPop .9s ease-in-out infinite; }
`;