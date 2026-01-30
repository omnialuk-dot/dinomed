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

    // lento + pause chiare
    const T = {
      fadeIn: 450,
      move1: 2000,
      stop1: 1900, // READ
      move2: 2000,
      stop2: 1900, // WRITE
      move3: 2000,
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

      // scena PIÙ PICCOLA (prima era troppo grande)
      const dW = 104;
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
              Simulazioni pensate per farti concentrare su ciò che conta, con un’interfaccia pulita e una correzione immediata.
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

            {/* STRIP: stickman + scene leggibili */}
            <div className="smx-story" ref={storyRef} data-phase="walk" aria-hidden="true">
              <div className="smx-storyGlow" />

              <div className="smx-track">
                <span className="smx-node n1" />
                <span className="smx-node n2" />
                <span className="smx-node n3" />
              </div>

              <div className="smx-mover" ref={moverRef}>
                <svg className="smx-scene" viewBox="0 0 104 64" aria-hidden="true">
                  {/* shadow */}
                  <ellipse cx="28" cy="58" rx="18" ry="4" fill="rgba(15,23,42,0.12)" />

                  {/* ===== STICKMAN BASE (sempre uguale, piccolo) ===== */}
                  <g className="man" transform="translate(6,6)">
                    {/* head */}
                    <circle cx="20" cy="12" r="6" fill="rgba(15,23,42,0.82)" />
                    {/* body */}
                    <path d="M20 18v16" stroke="rgba(15,23,42,0.82)" strokeWidth="3.2" strokeLinecap="round" />
                    {/* arms: mani fissate a (12,28) e (28,28) */}
                    <path className="arm" d="M20 22L12 28" stroke="rgba(15,23,42,0.82)" strokeWidth="3" strokeLinecap="round" />
                    <path className="arm" d="M20 22L28 28" stroke="rgba(15,23,42,0.82)" strokeWidth="3" strokeLinecap="round" />
                    {/* legs */}
                    <path className="leg" d="M20 34L14 46" stroke="rgba(15,23,42,0.82)" strokeWidth="3" strokeLinecap="round" />
                    <path className="leg" d="M20 34L26 46" stroke="rgba(15,23,42,0.82)" strokeWidth="3" strokeLinecap="round" />
                    {/* feet */}
                    <path d="M12 46h8" stroke="rgba(15,23,42,0.55)" strokeWidth="3" strokeLinecap="round" />
                    <path d="M22 46h8" stroke="rgba(15,23,42,0.55)" strokeWidth="3" strokeLinecap="round" />
                  </g>

                  {/* ===== READ: libro VERO, aperto e attaccato alle mani ===== */}
                  <g className="scene scene-read">
                    {/* book shadow */}
                    <ellipse cx="46" cy="40" rx="16" ry="4" fill="rgba(15,23,42,0.08)" />
                    {/* left cover */}
                    <path d="M30 26c10-6 16-6 24 0v22c-8-6-14-6-24 0V26z" fill="#ef4444" />
                    {/* right cover */}
                    <path d="M54 26c10-6 16-6 24 0v22c-8-6-14-6-24 0V26z" fill="#b91c1c" />
                    {/* pages */}
                    <path d="M32 28c8-4 14-4 20 0v18c-6-3-12-3-20 0V28z" fill="#fde68a" />
                    <path d="M56 28c8-4 14-4 20 0v18c-6-3-12-3-20 0V28z" fill="#fde68a" />
                    {/* spine */}
                    <path d="M52 26v22" stroke="rgba(15,23,42,0.22)" strokeWidth="2" strokeLinecap="round" />
                    {/* page lines */}
                    <path d="M36 34h12M36 38h10M36 42h8" stroke="rgba(15,23,42,0.22)" strokeWidth="2" strokeLinecap="round" />
                    <path d="M60 34h12M60 38h10M60 42h8" stroke="rgba(15,23,42,0.22)" strokeWidth="2" strokeLinecap="round" />

                    {/* “aggancio” visivo alle mani (12,28) e (28,28) della base) */}
                    <circle cx="18" cy="34" r="2.6" fill="#0ea5e9" opacity=".95" />
                    <circle cx="34" cy="34" r="2.6" fill="#22c55e" opacity=".95" />
                    <path d="M18 34L32 30" stroke="rgba(15,23,42,0.16)" strokeWidth="2" strokeLinecap="round" />
                    <path d="M34 34L52 30" stroke="rgba(15,23,42,0.16)" strokeWidth="2" strokeLinecap="round" />
                  </g>

                  {/* ===== WRITE: scrivania + foglio + penna in mano ===== */}
                  <g className="scene scene-write">
                    {/* desk */}
                    <path d="M44 30h56v12H44z" fill="#f97316" />
                    <path d="M48 42h8v16h-8zM88 42h8v16h-8z" fill="#ea580c" />
                    {/* paper */}
                    <path d="M58 32h18v10H58z" fill="#fde68a" stroke="rgba(15,23,42,0.14)" strokeWidth="1.6" />
                    <path d="M60 35h14M60 38h12M60 41h9" stroke="rgba(15,23,42,0.25)" strokeWidth="1.8" strokeLinecap="round" />
                    {/* pen attached to right hand */}
                    <path d="M28 34L58 40" stroke="#0ea5e9" strokeWidth="4.6" strokeLinecap="round" />
                    <path d="M56 39l10 2" stroke="#16a34a" strokeWidth="4.6" strokeLinecap="round" />
                    {/* small hand dots */}
                    <circle cx="18" cy="34" r="2.6" fill="#0ea5e9" opacity=".95" />
                    <circle cx="34" cy="34" r="2.6" fill="#22c55e" opacity=".95" />
                  </g>

                  {/* ===== GRAD: tocco + diploma in mano + stelline ===== */}
                  <g className="scene scene-grad">
                    {/* cap on head area */}
                    <path d="M18 2l18 6-18 6-18-6 18-6Z" fill="#0f172a" opacity=".92" transform="translate(8,4)" />
                    <path d="M18 10h12v4H18z" fill="#0f172a" opacity=".88" transform="translate(8,4)" />
                    <path d="M36 8v12" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" transform="translate(8,4)" />
                    <circle cx="44" cy="24" r="3" fill="#fbbf24" />

                    {/* diploma attached to right hand (28,28 -> area 52,36) */}
                    <path d="M58 34c10 0 18 8 18 18v6H42v-6c0-10 8-18 18-18h-2Z" fill="#fbbf24" />
                    <circle cx="70" cy="52" r="3" fill="#ef4444" />
                    <path d="M50 42c10-4 20-4 28 0" stroke="rgba(15,23,42,0.22)" strokeWidth="2.6" strokeLinecap="round" />

                    {/* link from hand to diploma */}
                    <circle cx="34" cy="34" r="2.6" fill="#22c55e" opacity=".95" />
                    <path d="M34 34L50 38" stroke="rgba(15,23,42,0.16)" strokeWidth="2" strokeLinecap="round" />

                    {/* stars */}
                    <path className="st s1" d="M86 20h10" stroke="#22c55e" strokeWidth="3.2" strokeLinecap="round" />
                    <path className="st s2" d="M84 28h10" stroke="#0ea5e9" strokeWidth="3.2" strokeLinecap="round" />
                    <path className="st s3" d="M82 14h10" stroke="#22c55e" strokeWidth="3.2" strokeLinecap="round" />
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
  --dino2:#16a34a;
  --med2:#0ea5e9;
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
  background: linear-gradient(90deg, var(--dino2), var(--med2));
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
@media (max-width: 520px){
  .smx-title{ font-size: 36px; }
}
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

/* VISUAL */
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

/* STRIP */
.smx-story{
  margin-top: 22px;
  max-width: 560px;
  height: 90px;
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

/* mover: PIÙ PICCOLO */
.smx-mover{
  position:absolute;
  left: 14px;
  top: 12px;
  width: 104px;
  height: 64px;
  z-index: 2;
  transform: translateX(0);
  opacity: 1;
  will-change: transform, opacity;
}
.smx-scene{ width:104px; height:64px; display:block; }

/* walk bob */
.smx-story[data-phase="walk"] .man{
  animation: bob .55s ease-in-out infinite;
  transform-origin: 16px 40px;
}
@keyframes bob{
  0%,100%{ transform: translate(6px,6px) translateY(0); }
  50%{ transform: translate(6px,6px) translateY(-1.4px); }
}

/* scene switching */
.scene{ opacity:0; transform: translateY(2px); transition: opacity .18s ease, transform .18s ease; }
.smx-story[data-phase="read"]  .scene-read{ opacity:1; transform: translateY(0); }
.smx-story[data-phase="write"] .scene-write{ opacity:1; transform: translateY(0); }
.smx-story[data-phase="grad"]  .scene-grad{ opacity:1; transform: translateY(0); }

/* stars pop */
.smx-story[data-phase="grad"] .st{ animation: pop .9s ease-in-out infinite; opacity:1; }
.smx-story[data-phase="grad"] .st.s2{ animation-delay:.12s; }
.smx-story[data-phase="grad"] .st.s3{ animation-delay:.24s; }
@keyframes pop{
  0%,100%{ transform: translateX(0) scaleX(1); opacity:.75; }
  50%{ transform: translateX(3px) scaleX(1.2); opacity:1; }
}
`;