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

    // lento + pause chiare (leggibili)
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
      const dW = 120; // scena più piccola (prima era gigante)
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

            {/* STRIP: 3 scene CHIARE e CENTRATE */}
            <div className="smx-story" ref={storyRef} data-phase="walk" aria-hidden="true">
              <div className="smx-storyGlow" />

              <div className="smx-track">
                <span className="smx-node n1" />
                <span className="smx-node n2" />
                <span className="smx-node n3" />
              </div>

              <div className="smx-mover" ref={moverRef}>
                <svg className="smx-scene" viewBox="0 0 120 72" aria-hidden="true">
                  {/* soft shadow */}
                  <ellipse cx="44" cy="64" rx="28" ry="6" fill="rgba(15,23,42,0.12)" />

                  {/* ===== DINO (pulito, piccolo, riconoscibile) ===== */}
                  <g className="d" transform="translate(6,8)">
                    {/* tail */}
                    <path d="M8 38c-10 3-12 12 2 12 7 0 12-3 16-8" fill="#16a34a" opacity="0.95" />

                    {/* body */}
                    <path
                      d="M22 26c4-9 20-12 30-4 10 8 7 26-8 30-14 4-30-6-22-26Z"
                      fill="#22c55e"
                    />
                    <path
                      d="M30 30c10-5 18 2 18 11 0 9-8 15-17 11-8-3-10-16-1-22Z"
                      fill="rgba(0,0,0,0.10)"
                    />

                    {/* neck */}
                    <path d="M36 16c2-5 8-8 14-7l-2 9c-5-1-9 0-12 3Z" fill="#16a34a" />

                    {/* head */}
                    <path
                      d="M34 10c10-8 34-2 34 14 0 14-16 20-28 16-12-4-18-18-6-30Z"
                      fill="#22c55e"
                    />
                    <path d="M42 16c10-6 20-3 20 6 0 8-10 11-18 8" fill="rgba(255,255,255,0.10)" />

                    {/* spines ATTACCATE (dorso) */}
                    <path d="M46 8l4-7 6 8" fill="#15803d" />
                    <path d="M54 8l4-7 6 8" fill="#15803d" />
                    <path d="M62 12l3-6 6 7" fill="#15803d" />
                    <path d="M66 18l6-4 4 8" fill="#15803d" />

                    {/* eye */}
                    <circle cx="58" cy="22" r="2.4" fill="#0f172a" opacity="0.92" />

                    {/* smile lines (bianco, stile reference) */}
                    <path d="M40 28c8 6 18 6 26 2" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" opacity=".9" />
                    <path d="M38 36c7 6 15 7 22 4" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" opacity=".9" />

                    {/* arm */}
                    <path className="arm" d="M50 40c8 0 12 4 16 8" stroke="#15803d" strokeWidth="7" strokeLinecap="round" fill="none" />

                    {/* legs */}
                    <path className="leg1" d="M26 50c-8 3-10 10 6 9 8-1 10-4 14-7" fill="#15803d" />
                    <path className="leg2" d="M40 50c-8 3-10 10 6 9 8-1 10-4 14-7" fill="#15803d" opacity=".95" />
                  </g>

                  {/* ===== SCENE READ (LIBRO ROSSO GRANDE, centrato sulle “mani”) ===== */}
                  <g className="scene scene-read">
                    <path d="M74 46c14-6 30 2 30 16v4H66v-4c0-7 3-12 8-16Z" fill="#b91c1c" />
                    <path d="M74 46c10-4 22 1 22 12v8h-8v-7c0-5-6-8-14-6Z" fill="#ef4444" />
                    <path d="M70 52c10-6 22-1 24 10" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" opacity=".9" />
                    <path d="M70 58c10-6 22-1 24 10" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" opacity=".9" />
                  </g>

                  {/* ===== SCENE WRITE (BANCO + FOGLIO + PENNA, centrati) ===== */}
                  <g className="scene scene-write">
                    <path d="M66 44h52v14H66z" fill="#f97316" />
                    <path d="M70 58h8v10h-8zM106 58h8v10h-8z" fill="#ea580c" />
                    <path d="M78 46h22v12H78z" fill="#fde68a" stroke="rgba(15,23,42,0.14)" strokeWidth="1.6" />
                    <path d="M82 50h14" stroke="rgba(15,23,42,0.35)" strokeWidth="2" strokeLinecap="round" />
                    <path d="M82 54h12" stroke="rgba(15,23,42,0.28)" strokeWidth="2" strokeLinecap="round" />
                    <path d="M100 48l14 10" stroke="#0ea5e9" strokeWidth="5.4" strokeLinecap="round" />
                    <path d="M112 56l6 4" stroke="#16a34a" strokeWidth="5.4" strokeLinecap="round" />
                  </g>

                  {/* ===== SCENE GRAD (CAP + DIPLOMA GRANDI) ===== */}
                  <g className="scene scene-grad">
                    <path d="M78 6l26 8-26 8-26-8 26-8Z" fill="#0f172a" opacity=".92" />
                    <path d="M70 18h16v5H70z" fill="#0f172a" opacity=".88" />
                    <path d="M104 14v16" stroke="#fbbf24" strokeWidth="3.2" strokeLinecap="round" />
                    <circle cx="104" cy="32" r="3.2" fill="#fbbf24" />

                    <path d="M86 40c10 0 18 8 18 18v8H58v-8c0-10 8-18 18-18h10Z" fill="#fbbf24" />
                    <path d="M66 48c12-5 26-5 38 0" stroke="rgba(15,23,42,0.25)" strokeWidth="2.6" strokeLinecap="round" />
                    <circle cx="96" cy="62" r="3.2" fill="#ef4444" />

                    <path className="st s1" d="M108 24h10" stroke="#22c55e" strokeWidth="3.2" strokeLinecap="round" />
                    <path className="st s2" d="M106 32h10" stroke="#0ea5e9" strokeWidth="3.2" strokeLinecap="round" />
                    <path className="st s3" d="M104 18h10" stroke="#22c55e" strokeWidth="3.2" strokeLinecap="round" />
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

/* mover piccolo e centrato */
.smx-mover{
  position:absolute;
  left: 14px;
  top: 8px;
  width: 120px;
  height: 72px;
  z-index: 2;
  transform: translateX(0);
  opacity: 1;
  will-change: transform, opacity;
}
.smx-scene{ width:120px; height:72px; display:block; }

/* walk bob */
.smx-story[data-phase="walk"] .d{ animation: bob .55s ease-in-out infinite; transform-origin: 50px 50px; }
@keyframes bob{ 0%,100%{ transform: translate(6px,8px) translateY(0); } 50%{ transform: translate(6px,8px) translateY(-1.6px); } }

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