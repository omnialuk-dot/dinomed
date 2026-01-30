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

    // timeline: lento + pause chiare
    const T = {
      fadeIn: 450,
      move1: 2200,
      stop1: 1900, // READ
      move2: 2200,
      stop2: 1900, // WRITE
      move3: 2200,
      stop3: 1700, // GRAD
      exit: 900,
    };
    const total = Object.values(T).reduce((a, b) => a + b, 0);

    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const layout = () => {
      const pad = 14;
      const w = storyEl.clientWidth;
      const dW = 64; // mascotte + scena (dimensione giusta per capirci)
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

            {/* STRIP “STORIA” — 3 scene leggibili */}
            <div className="smx-story" ref={storyRef} data-phase="walk" aria-hidden="true">
              <div className="smx-storyGlow" />

              <div className="smx-track">
                <span className="smx-node n1" />
                <span className="smx-node n2" />
                <span className="smx-node n3" />
              </div>

              <div className="smx-mover" ref={moverRef}>
                <svg className="smx-scene" viewBox="0 0 160 84" aria-hidden="true">
                  {/* shadow */}
                  <ellipse cx="54" cy="74" rx="38" ry="8" fill="rgba(15,23,42,0.10)" />

                  {/* ===== DINO BASE (stile “tua immagine”: verde pieno + linee bianche) ===== */}
                  <g className="dino">
                    {/* tail */}
                    <path
                      d="M22 50c-18 6-18 20 8 16 10-2 18-8 24-14"
                      fill="#16a34a"
                      opacity="0.95"
                    />
                    {/* body */}
                    <path
                      d="M40 36c6-10 28-14 40-4 12 10 8 32-10 36-18 4-40-8-30-32Z"
                      fill="#22c55e"
                    />
                    {/* belly shading */}
                    <path
                      d="M56 40c14-6 26 2 26 14 0 10-10 18-24 14-12-4-14-20-2-28Z"
                      fill="rgba(0,0,0,0.10)"
                    />

                    {/* head */}
                    <path
                      d="M58 14c18-12 56-4 56 20 0 18-24 26-44 22-20-4-30-26-12-42Z"
                      fill="#22c55e"
                    />
                    {/* head highlight */}
                    <path
                      d="M74 22c14-8 34-4 34 10 0 12-18 16-32 12"
                      fill="rgba(255,255,255,0.10)"
                    />

                    {/* spines (ATTACCATI) */}
                    <path d="M84 12l8-12 10 14" fill="#15803d" opacity="0.95" />
                    <path d="M98 12l8-12 10 14" fill="#15803d" opacity="0.95" />
                    <path d="M112 18l7-10 8 12" fill="#15803d" opacity="0.95" />
                    <path d="M118 30l10-8 6 14" fill="#15803d" opacity="0.95" />

                    {/* eye */}
                    <circle cx="104" cy="30" r="4" fill="#0f172a" opacity="0.92" />

                    {/* mouth white stroke (come tua reference) */}
                    <path
                      d="M78 38c12 8 30 8 44 2"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="5"
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                    <path
                      d="M70 48c10 8 26 10 40 6"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="5"
                      strokeLinecap="round"
                      opacity="0.9"
                    />

                    {/* arm base */}
                    <path
                      className="arm"
                      d="M84 56c10 0 18 6 22 10"
                      fill="none"
                      stroke="#15803d"
                      strokeWidth="10"
                      strokeLinecap="round"
                    />

                    {/* legs */}
                    <path
                      className="leg1"
                      d="M54 66c-12 4-16 14 8 12 12-2 14-6 20-10"
                      fill="#15803d"
                    />
                    <path
                      className="leg2"
                      d="M72 66c-12 4-16 14 8 12 12-2 14-6 20-10"
                      fill="#15803d"
                      opacity="0.95"
                    />
                  </g>

                  {/* ===== READ SCENE (LIBRO ROSSO GRANDE) ===== */}
                  <g className="scene scene-read">
                    {/* book */}
                    <path d="M110 58c20-8 38 2 38 16v6H98v-6c0-6 4-12 12-16Z" fill="#b91c1c" />
                    <path d="M110 58c16-6 30 2 30 14v8h-10v-8c0-6-8-10-20-8Z" fill="#ef4444" />
                    <path d="M106 62c14-8 30-2 32 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".85" />
                    <path d="M106 70c14-8 30-2 32 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".85" />
                  </g>

                  {/* ===== WRITE SCENE (BANCO ARANCIONE + FOGLIO + PENNA) ===== */}
                  <g className="scene scene-write">
                    {/* desk */}
                    <path d="M96 54h58v16H96z" fill="#f97316" />
                    <path d="M100 70h10v12h-10zM140 70h10v12h-10z" fill="#ea580c" />
                    {/* paper */}
                    <path d="M110 56h26v14h-26z" fill="#fde68a" stroke="rgba(15,23,42,0.12)" strokeWidth="2" />
                    <path d="M114 60h18" stroke="rgba(15,23,42,0.35)" strokeWidth="2" strokeLinecap="round" />
                    <path d="M114 64h16" stroke="rgba(15,23,42,0.30)" strokeWidth="2" strokeLinecap="round" />
                    <path d="M114 68h12" stroke="rgba(15,23,42,0.28)" strokeWidth="2" strokeLinecap="round" />
                    {/* pen */}
                    <path d="M136 58l14 10" stroke="#0ea5e9" strokeWidth="6" strokeLinecap="round" />
                    <path d="M148 66l6 4" stroke="#16a34a" strokeWidth="6" strokeLinecap="round" />
                  </g>

                  {/* ===== GRAD SCENE (TOCCO + DIPLOMA) ===== */}
                  <g className="scene scene-grad">
                    {/* cap */}
                    <path d="M102 6l32 10-32 10-32-10 32-10Z" fill="#0f172a" opacity=".92" />
                    <path d="M92 22h20v6H92z" fill="#0f172a" opacity=".88" />
                    <path d="M132 18v18" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="132" cy="38" r="4" fill="#fbbf24" />

                    {/* diploma */}
                    <path
                      d="M120 44c12 0 22 10 22 22v8h-52v-8c0-12 10-22 22-22h8Z"
                      fill="#fbbf24"
                    />
                    <path d="M96 52c14-6 32-6 46 0" stroke="rgba(15,23,42,0.25)" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="132" cy="70" r="4" fill="#ef4444" />
                    {/* stars */}
                    <path className="st s1" d="M148 28h10" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
                    <path className="st s2" d="M146 36h10" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" />
                    <path className="st s3" d="M144 22h10" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
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
  height: 96px;
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

.smx-mover{
  position:absolute;
  left: 14px;
  top: 6px;
  width: 160px;
  height: 84px;
  z-index: 2;
  transform: translateX(0);
  opacity: 1;
  will-change: transform, opacity;
}

.smx-scene{
  width: 160px;
  height: 84px;
  display:block;
}

/* micro-walk only in walk */
.smx-story[data-phase="walk"] .dino{
  animation: bob .55s ease-in-out infinite;
  transform-origin: 60px 60px;
}
@keyframes bob{
  0%,100%{ transform: translateY(0); }
  50%{ transform: translateY(-2px); }
}
.smx-story[data-phase="walk"] .leg1{ transform: translateX(0); }
.smx-story[data-phase="walk"] .leg2{ transform: translateX(1px); }

/* scenes visibility */
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
  50%{ transform: translateX(4px) scaleX(1.25); opacity:1; }
}
`;