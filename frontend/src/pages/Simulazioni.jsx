import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "../assets/photos/typing.jpg";

export default function Simulazioni() {
  const nav = useNavigate();

  const storyRef = useRef(null);
  const moverRef = useRef(null);

  useEffect(() => {
    const storyEl = storyRef.current;
    const moverEl = moverRef.current;
    if (!storyEl || !moverEl) return;

    let raf = 0;

    // tempi lenti + soste chiare
    const T = {
      fadeIn: 350,
      move1: 2200,
      stop1: 1700, // READ
      move2: 2200,
      stop2: 1700, // WRITE
      move3: 2200,
      stop3: 1700, // GRAD
      exit: 850,
    };
    const total = Object.values(T).reduce((a, b) => a + b, 0);

    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const layout = () => {
      const pad = 14;
      const w = storyEl.clientWidth;

      // un pelo più compatto (non troppo)
      const dW = 100; // prima 110
      const inner = Math.max(0, w - pad * 2 - dW);

      return {
        x0: 0,
        x1: inner * 0.18,
        x2: inner * 0.5,
        x3: inner * 0.82,
        xEnd: inner,
      };
    };

    const setPhase = (p) => (storyEl.dataset.phase = p);

    const start = performance.now();
    const tick = (now) => {
      const { x0, x1, x2, x3, xEnd } = layout();
      let t = (now - start) % total;

      const s1 = T.fadeIn;
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

      moverEl.style.transform = `translateX(${x}px)`;
      moverEl.style.opacity = String(opacity);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <main className="smx">
      <style>{css}</style>

      <section className="smx-hero">
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
              Allenati <span className="smx-grad">come all’esame</span>.
            </h1>

            <p className="smx-lead">In modo semplice.</p>

            <p className="smx-sub">
              Pochi click, zero confusione. Scegli la simulazione, rispondi e ottieni una correzione chiara.
            </p>

            <div className="smx-flow" aria-label="Come funziona">
              <div className="smx-flowItem">
                <span className="smx-flowNum">1</span>
                <span className="smx-flowTxt">Configura</span>
              </div>
              <div className="smx-flowSep" />
              <div className="smx-flowItem">
                <span className="smx-flowNum">2</span>
                <span className="smx-flowTxt">Rispondi</span>
              </div>
              <div className="smx-flowSep" />
              <div className="smx-flowItem">
                <span className="smx-flowNum">3</span>
                <span className="smx-flowTxt">Correggi</span>
              </div>
            </div>

            <div className="smx-actions">
              <button className="smx-btn smx-primary" onClick={() => nav("/simulazioni/config")}>
                Inizia una simulazione <span aria-hidden="true">→</span>
                <span className="smx-shine" aria-hidden="true" />
              </button>
            </div>

            {/* STRIP ANIMAZIONE */}
            <div className="smx-story" ref={storyRef} data-phase="walk" aria-hidden="true">
              <div className="smx-storyGlow" />

              <div className="smx-track">
                <span className="smx-node n1" />
                <span className="smx-node n2" />
                <span className="smx-node n3" />
              </div>

              <div className="smx-mover" ref={moverRef}>
                <svg className="smx-scene" viewBox="0 0 110 70" aria-hidden="true">
                  {/* shadow */}
                  <ellipse cx="28" cy="62" rx="18" ry="4" fill="rgba(15,23,42,0.10)" />

                  {/* ===== STICKMAN ===== */}
                  <g className="man" transform="translate(6,8)">
                    <circle cx="20" cy="12" r="6" className="mFill" />

                    {/* faccia: sorrisono (visibile solo in GRAD) */}
                    <path className="mSmile" d="M17.6 13.4c1.4 1.8 3.4 1.8 4.8 0" />

                    <path d="M20 18v18" className="mStroke" />

                    {/* braccia (animate in READ/WRITE/GRAD) */}
                    <path d="M20 24L12 32" className="mStroke arm armBack" />
                    <path d="M20 24L28 32" className="mStroke arm armFront" />

                    {/* gambe */}
                    <path className="mStroke leg leg1" d="M20 36L14 52" />
                    <path className="mStroke leg leg2" d="M20 36L26 52" />
                    <path d="M12 52h8" className="mFoot" />
                    <path d="M22 52h8" className="mFoot" />
                  </g>

                  {/* ===== READ (libro migliore + presa) ===== */}
                  <g className="scene scene-read">
                    {/* libro: copertina + dorso + pagine */}
                    <path
                      d="M33.8 35.2l9.4-3.2c1.7-.6 3.3.5 3.3 2.2v11.8c0 1.7-1.6 2.8-3.3 2.2l-9.4-3.2V35.2z"
                      fill="#ef4444"
                    />
                    <path
                      d="M33.8 35.2c.95-.6 1.85-.9 2.6-.9v16.9c-.75 0-1.65-.3-2.6-.9V35.2z"
                      fill="#dc2626"
                      opacity="0.98"
                    />
                    <path d="M36.6 33.6l6.6-2.2" stroke="#fde68a" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M36.6 48.4l6.6 2.2" stroke="#fde68a" strokeWidth="2.2" strokeLinecap="round" />
                    <path
                      d="M39 37.8h4.2M39 40.6h3.6M39 43.4h3.2"
                      stroke="rgba(255,255,255,0.78)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                    {/* micro “legame” con la mano */}
                    <path d="M30.6 38.6L33.8 36.8" stroke="rgba(15,23,42,0.14)" strokeWidth="2" strokeLinecap="round" />
                  </g>

                  {/* ===== WRITE (scrive davvero) ===== */}
                  <g className="scene scene-write">
                    {/* tavolino leggero */}
                    <path
                      d="M54 44h34c1.6 0 2.8 1.2 2.8 2.8v4.4H51.2v-4.4c0-1.6 1.2-2.8 2.8-2.8Z"
                      fill="#f97316"
                    />
                    <path d="M51.2 48h39.6" stroke="rgba(255,255,255,0.40)" strokeWidth="2" strokeLinecap="round" />

                    {/* gambette */}
                    <path d="M56.5 51.2v10.8" stroke="#ea580c" strokeWidth="4.2" strokeLinecap="round" />
                    <path d="M85.5 51.2v10.8" stroke="#ea580c" strokeWidth="4.2" strokeLinecap="round" />
                    <path d="M52 62h9.5" stroke="rgba(15,23,42,0.16)" strokeWidth="3.2" strokeLinecap="round" />
                    <path d="M80.5 62h9.5" stroke="rgba(15,23,42,0.16)" strokeWidth="3.2" strokeLinecap="round" />

                    {/* foglio */}
                    <path d="M64 44.6h10.5v6.8H64z" fill="#fde68a" stroke="rgba(15,23,42,0.12)" strokeWidth="1.2" />
                    <path
                      d="M65.3 46.5h7.7M65.3 48.3h6.5M65.3 50.1h4.8"
                      stroke="rgba(15,23,42,0.22)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />

                    {/* penna (ora proporzionata + animata) */}
                    <g className="pen">
                      <path className="penBlue" d="M40 40L56.4 45.2" />
                      <path className="penGreen" d="M55.6 45l3.6 1.1" />
                      <path className="penTip" d="M59.2 46.1l1.2.4" />
                    </g>

                    {/* mini segnetto sul foglio (appare mentre scrive) */}
                    <path className="scribble" d="M66 49.6c1.2.7 2.2-.7 3.4 0 1.2.7 2.2-.7 3.4 0" />
                  </g>

                  {/* ===== GRAD (felice) ===== */}
                  <g className="scene scene-grad">
                    {/* cap */}
                    <path d="M20 2l18 6-18 6-18-6 18-6Z" fill="#0f172a" opacity=".9" transform="translate(6,6)" />
                    <path d="M20 10h12v4H20z" fill="#0f172a" opacity=".86" transform="translate(6,6)" />
                    <path d="M38 8v14" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" transform="translate(6,6)" />
                    <circle cx="44" cy="28" r="3" fill="#fbbf24" />

                    {/* diploma */}
                    <path
                      d="M50 44h22c3 0 6 3 6 6v10c0 3-3 6-6 6H50c-3 0-6-3-6-6V50c0-3 3-6 6-6Z"
                      fill="#fde68a"
                      stroke="rgba(15,23,42,0.14)"
                      strokeWidth="1.6"
                    />
                    <path d="M54 50h14M54 54h12" stroke="rgba(15,23,42,0.22)" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="72" cy="60" r="3" fill="#ef4444" />

                    {/* link */}
                    <path d="M34 40L50 50" stroke="rgba(15,23,42,0.14)" strokeWidth="2" strokeLinecap="round" />

                    {/* stars */}
                    <path className="st s1" d="M92 18h10" stroke="#22c55e" strokeWidth="3.2" strokeLinecap="round" />
                    <path className="st s2" d="M90 26h10" stroke="#0ea5e9" strokeWidth="3.2" strokeLinecap="round" />
                    <path className="st s3" d="M88 12h10" stroke="#22c55e" strokeWidth="3.2" strokeLinecap="round" />
                  </g>
                </svg>
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
                <div className="smx-floatSub">Entra, scegli e parti.</div>
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
  --dino:#22c55e; --dino2:#16a34a;
  --med:#38bdf8;  --med2:#0ea5e9;

  --stick:#16a34a;

  --ink: rgba(15,23,42,0.92);
  --ink2: rgba(15,23,42,0.72);
  --bd: rgba(15,23,42,0.10);
  --shadow: 0 16px 60px rgba(2,6,23,0.10);
}

.smx{ max-width:1120px; margin:0 auto; padding:22px; }

.smx-hero{
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
}

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

.smx-grid{
  display:grid;
  grid-template-columns: 1.05fr .95fr;
  gap: 26px;
  align-items:center;
  padding-top: 34px;
}
@media (max-width: 980px){
  .smx-grid{ grid-template-columns: 1fr; padding-top: 0; }
}

.smx-title{
  margin: 0;
  font-size: 46px;
  line-height: 1.02;
  letter-spacing: -0.035em;
  color: var(--ink);
  font-weight: 1000;
}
@media (max-width: 520px){ .smx-title{ font-size: 36px; } }
.smx-grad{
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  -webkit-background-clip:text;
  background-clip:text;
  color: transparent;
}

.smx-lead{ margin: 10px 0 6px; font-weight: 950; color: rgba(15,23,42,0.80); }
.smx-sub{ margin: 0; color: var(--ink2); font-weight: 850; max-width: 70ch; }

.smx-flow{ margin-top:18px; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
.smx-flowItem{ display:flex; align-items:center; gap:8px; font-weight:950; color: rgba(15,23,42,0.82); }
.smx-flowNum{
  width:28px;height:28px;border-radius:999px;
  display:grid;place-items:center;
  background:linear-gradient(90deg,var(--dino2),var(--med2));
  color:white;font-size:14px;
}
.smx-flowSep{ width:22px; height:1px; background:rgba(15,23,42,0.2); }

.smx-actions{ margin-top: 20px; display:flex; gap: 12px; align-items:center; flex-wrap:wrap; }
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

/* visual */
.smx-visual{
  position: relative;
  border-radius: 24px;
  overflow:hidden;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.92);
  box-shadow: var(--shadow);
  height: 420px;
}
@media (max-width: 980px){ .smx-visual{ height: 300px; } }
.smx-visualGlow{
  position:absolute; inset:-60px;
  background:
    radial-gradient(420px 240px at 22% 18%, rgba(34,197,94,0.22), transparent 58%),
    radial-gradient(420px 240px at 78% 18%, rgba(56,189,248,0.22), transparent 58%);
  filter: blur(26px);
  opacity: .55;
  pointer-events:none;
  z-index:0;
}
.smx-img{
  position:relative; z-index:1;
  width:100%; height:100%;
  object-fit: cover;
  display:block;
  transform: scale(1.02);
  filter: saturate(0.96) contrast(1.06);
}
.smx-overlay{
  position:absolute; inset:0; z-index:2;
  background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.20) 55%, rgba(255,255,255,0.86) 100%);
}
.smx-float{
  position:absolute;
  left: 14px; right: 14px; bottom: 14px;
  z-index:3;
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

/* strip */
.smx-story{
  margin-top: 22px;
  max-width: 560px;
  height: 92px;
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.72);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
  position: relative;
  overflow: hidden;
}
.smx-storyGlow{
  position:absolute; inset:-50px;
  background:
    radial-gradient(320px 160px at 18% 70%, rgba(34,197,94,0.18), transparent 60%),
    radial-gradient(320px 160px at 82% 40%, rgba(56,189,248,0.18), transparent 60%);
  filter: blur(24px);
  opacity: .95;
  pointer-events:none;
}

.smx-track{
  position:absolute;
  left: 14px; right: 14px;
  top: 60px;
  height: 2px;
  border-radius: 999px;
  background: rgba(15,23,42,0.10);
  z-index: 1;
}
.smx-node{
  position:absolute;
  top: -6px;
  width: 14px; height: 14px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.82);
  box-shadow: 0 10px 22px rgba(2,6,23,0.06);
}
.smx-node.n1{ left: 18%; }
.smx-node.n2{ left: 50%; }
.smx-node.n3{ left: 82%; }
.smx-node::after{
  content:"";
  position:absolute; inset:2px;
  border-radius:999px;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  opacity:.14;
}
.smx-story[data-phase="read"]  .smx-node.n1::after{ opacity:.95; }
.smx-story[data-phase="write"] .smx-node.n2::after{ opacity:.95; }
.smx-story[data-phase="grad"]  .smx-node.n3::after{ opacity:.95; }

/* mover (un filo più piccolo) */
.smx-mover{
  position:absolute;
  left: 14px;
  top: 12px;
  width: 100px;
  height: 64px;
  z-index: 2;
  transform: translateX(0);
  opacity: 1;
  will-change: transform, opacity;
}
.smx-scene{ width:100px; height:64px; display:block; }

/* stickman */
.mStroke{ stroke: var(--stick); stroke-width: 3.1; stroke-linecap: round; fill: none; }
.mFill{ fill: var(--stick); }
.mFoot{ stroke: rgba(15,23,42,0.18); stroke-width: 3.2; stroke-linecap: round; fill:none; }

/* sorriso: visibile solo quando felice */
.mSmile{
  stroke: rgba(15,23,42,0.35);
  stroke-width: 1.8;
  stroke-linecap: round;
  fill: none;
  opacity: 0;
}
.smx-story[data-phase="grad"] .mSmile{ opacity: 1; }

/* camminata */
.smx-story[data-phase="walk"] .man{
  animation: bob .58s ease-in-out infinite;
  transform-origin: 20px 40px;
}
.smx-story[data-phase="walk"] .leg1{ animation: legA .58s ease-in-out infinite; transform-origin: 20px 36px; }
.smx-story[data-phase="walk"] .leg2{ animation: legB .58s ease-in-out infinite; transform-origin: 20px 36px; }

@keyframes bob{
  0%,100%{ transform: translate(6px,8px) translateY(0); }
  50%{ transform: translate(6px,8px) translateY(-1.6px); }
}
@keyframes legA{ 0%,100%{ transform: rotate(10deg);} 50%{ transform: rotate(-10deg);} }
@keyframes legB{ 0%,100%{ transform: rotate(-10deg);} 50%{ transform: rotate(10deg);} }

/* scene switching */
.scene{ opacity:0; transform: translateY(2px); transition: opacity .18s ease, transform .18s ease; }
.smx-story[data-phase="read"]  .scene-read{ opacity:1; transform: translateY(0); }
.smx-story[data-phase="write"] .scene-write{ opacity:1; transform: translateY(0); }
.smx-story[data-phase="grad"]  .scene-grad{ opacity:1; transform: translateY(0); }

/* ===== READ: prende il libro (side view) ===== */
.smx-story[data-phase="read"] .man{
  transform: translate(6px,8px) rotate(-7deg) translateY(-1px);
  transform-origin: 20px 36px;
}
.smx-story[data-phase="read"] .armFront{
  animation: armReadFront .62s ease-in-out infinite alternate;
  transform-origin: 20px 24px;
}
.smx-story[data-phase="read"] .armBack{
  animation: armReadBack .62s ease-in-out infinite alternate;
  transform-origin: 20px 24px;
}
@keyframes armReadFront{
  from { transform: rotate(-6deg); }
  to   { transform: rotate(-26deg) translateY(-1px); }
}
@keyframes armReadBack{
  from { transform: rotate(6deg); }
  to   { transform: rotate(14deg); }
}

/* ===== WRITE: scrive davvero (braccio + penna + segno) ===== */
.smx-story[data-phase="write"] .armFront{
  animation: armWriteFront .32s ease-in-out infinite;
  transform-origin: 20px 24px;
}
.smx-story[data-phase="write"] .armBack{
  animation: armWriteBack .32s ease-in-out infinite;
  transform-origin: 20px 24px;
}
@keyframes armWriteFront{
  0%,100%{ transform: rotate(-8deg); }
  50%{ transform: rotate(-18deg) translateY(0.6px); }
}
@keyframes armWriteBack{
  0%,100%{ transform: rotate(8deg); }
  50%{ transform: rotate(12deg); }
}

.pen .penBlue{
  stroke: #0ea5e9;
  stroke-width: 1.9;
  stroke-linecap: round;
  fill: none;
}
.pen .penGreen{
  stroke: #16a34a;
  stroke-width: 1.9;
  stroke-linecap: round;
  fill: none;
}
.pen .penTip{
  stroke: rgba(15,23,42,0.18);
  stroke-width: 1.6;
  stroke-linecap: round;
  fill: none;
}
.smx-story[data-phase="write"] .pen{
  animation: penTap .32s ease-in-out infinite;
  transform-origin: 56px 45px;
}
@keyframes penTap{
  0%,100%{ transform: translateY(0) rotate(0deg); }
  50%{ transform: translateY(0.8px) rotate(1.6deg); }
}

.scribble{
  stroke: rgba(15,23,42,0.26);
  stroke-width: 1.3;
  stroke-linecap: round;
  fill: none;
  opacity: 0;
}
.smx-story[data-phase="write"] .scribble{
  opacity: 1;
  animation: scribbleBlink .32s ease-in-out infinite;
}
@keyframes scribbleBlink{
  0%,100%{ opacity: .25; }
  50%{ opacity: .9; }
}

/* ===== GRAD: felice (saltellino + braccia su) ===== */
.smx-story[data-phase="grad"] .man{
  animation: happyBounce .55s ease-in-out infinite;
  transform-origin: 20px 40px;
}
@keyframes happyBounce{
  0%,100%{ transform: translate(6px,8px) translateY(0); }
  50%{ transform: translate(6px,8px) translateY(-2.3px); }
}
.smx-story[data-phase="grad"] .armFront{
  animation: armsUpFront .55s ease-in-out infinite;
  transform-origin: 20px 24px;
}
.smx-story[data-phase="grad"] .armBack{
  animation: armsUpBack .55s ease-in-out infinite;
  transform-origin: 20px 24px;
}
@keyframes armsUpFront{
  0%,100%{ transform: rotate(-10deg); }
  50%{ transform: rotate(-46deg) translateY(-1px); }
}
@keyframes armsUpBack{
  0%,100%{ transform: rotate(10deg); }
  50%{ transform: rotate(28deg); }
}

/* stars */
.smx-story[data-phase="grad"] .st{ animation: pop .9s ease-in-out infinite; opacity:1; }
.smx-story[data-phase="grad"] .st.s2{ animation-delay:.12s; }
.smx-story[data-phase="grad"] .st.s3{ animation-delay:.24s; }
@keyframes pop{
  0%,100%{ transform: translateX(0) scaleX(1); opacity:.75; }
  50%{ transform: translateX(3px) scaleX(1.2); opacity:1; }
}
`;