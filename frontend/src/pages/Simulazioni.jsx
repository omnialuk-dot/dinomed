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

    // più lento + pause chiare
    const T = {
      fadeIn: 450,
      move1: 2200,
      stop1: 1700, // READ
      move2: 2200,
      stop2: 1700, // WRITE
      move3: 2200,
      stop3: 1600, // GRAD
      exit: 900,
    };
    const total = Object.values(T).reduce((a, b) => a + b, 0);

    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const getLayout = () => {
      const pad = 14;
      const w = storyEl.clientWidth;
      const dW = 48; // mascotte PIÙ PICCOLA (prima era enorme)
      const inner = Math.max(0, w - pad * 2 - dW);

      return {
        x0: 0,
        x1: inner * 0.18,
        x2: inner * 0.5,
        x3: inner * 0.82,
        xEnd: inner,
      };
    };

    const setPhase = (p) => {
      storyEl.dataset.phase = p;
    };

    const start = performance.now();

    const tick = (now) => {
      const { x0, x1, x2, x3, xEnd } = getLayout();
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
        {/* kicker */}
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

            {/* STRIP ANIMATA — chiara, leggibile */}
            <div className="smx-story" ref={storyRef} data-phase="walk" aria-hidden="true">
              <div className="smx-storyGlow" />

              <div className="smx-track">
                <span className="smx-node n1" />
                <span className="smx-node n2" />
                <span className="smx-node n3" />
              </div>

              <div className="smx-mover" ref={moverRef}>
                {/* Mascotte (piccola, dritta, senza faccia blu) */}
                <div className="smx-mascot">
                  <svg viewBox="0 0 64 64" className="m-svg" aria-hidden="true">
                    {/* tail */}
                    <path d="M10 38c-7 2-9 10 2 10 6 0 9-2 13-6" fill="#16a34a" opacity=".95" />
                    {/* body */}
                    <ellipse cx="30" cy="40" rx="16" ry="12" fill="#22c55e" />
                    <ellipse cx="33" cy="41" rx="9" ry="7" fill="#16a34a" opacity=".35" />
                    {/* legs (green, not white) */}
                    <path d="M22 50c-5 2-7 6 2 6 6 0 6-2 8-4" fill="#15803d" />
                    <path d="M33 50c-5 2-7 6 2 6 6 0 6-2 8-4" fill="#15803d" />
                    {/* neck */}
                    <rect x="33" y="26" width="10" height="10" rx="6" fill="#16a34a" />
                    {/* head */}
                    <path
                      d="M26 14c10-6 28-2 30 10 2 12-14 18-27 16-10-2-14-18-3-26z"
                      fill="#22c55e"
                    />
                    {/* spines */}
                    <path d="M39 13l4-6 4 7" fill="#15803d" opacity=".95" />
                    <path d="M48 14l4-6 4 7" fill="#15803d" opacity=".95" />
                    <path d="M55 18l3-5 3 6" fill="#15803d" opacity=".95" />
                    {/* eye */}
                    <circle cx="48" cy="22" r="2.6" fill="#0f172a" opacity=".9" />
                    {/* mask (small, not whole face) */}
                    <path
                      d="M49 28c6 0 10 1 10 4s-4 5-10 5-10-2-10-5 4-4 10-4z"
                      fill="#7dd3fc"
                      opacity=".95"
                    />
                    <path d="M40 31c3-3 15-3 18 0" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
                    {/* arm */}
                    <path d="M40 40c7 0 9 4 12 6" stroke="#15803d" strokeWidth="6" strokeLinecap="round" />
                  </svg>

                  {/* PROPS (tutti colorati, mai bianchi) */}
                  <div className="p-book" aria-hidden="true">
                    <span className="bk1" />
                    <span className="bk2" />
                  </div>

                  <div className="p-clip" aria-hidden="true">
                    <span className="clp" />
                    <span className="pen" />
                  </div>

                  <div className="p-grad" aria-hidden="true">
                    <span className="cap" />
                    <span className="dip" />
                    <span className="star s1" />
                    <span className="star s2" />
                    <span className="star s3" />
                  </div>
                </div>
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
  max-width: 520px;
  height: 86px;
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
  top: 52px;
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
  top: 12px;
  width: 48px;
  height: 48px;
  z-index: 2;
  transform: translateX(0);
  opacity: 1;
  will-change: transform, opacity;
}

/* mascotte */
.smx-mascot{
  position: relative;
  width: 48px;
  height: 48px;
}
.m-svg{
  width: 48px;
  height: 48px;
  display:block;
  filter: drop-shadow(0 10px 22px rgba(2,6,23,0.10));
}

/* PROPS — TUTTI COLORATI, VISIBILI */
.p-book, .p-clip, .p-grad{
  position:absolute;
  inset:0;
  opacity:0;
  transform: translateY(2px);
  transition: opacity .18s ease, transform .18s ease;
  pointer-events:none;
}
.smx-story[data-phase="read"]  .p-book{ opacity:1; transform: translateY(0); }
.smx-story[data-phase="write"] .p-clip{ opacity:1; transform: translateY(0); }
.smx-story[data-phase="grad"]  .p-grad{ opacity:1; transform: translateY(0); }

/* BOOK (blu, non bianco) */
.p-book .bk1{
  position:absolute; left: 34px; top: 30px;
  width: 12px; height: 14px;
  border-radius: 3px;
  background: linear-gradient(180deg, #60a5fa, #38bdf8);
  box-shadow: 0 10px 20px rgba(2,6,23,0.10);
}
.p-book .bk2{
  position:absolute; left: 37px; top: 32px;
  width: 2px; height: 10px;
  border-radius: 2px;
  background: rgba(255,255,255,0.35);
}

/* CLIPBOARD + PEN (tutto leggibile) */
.p-clip .clp{
  position:absolute; left: 30px; top: 28px;
  width: 16px; height: 18px;
  border-radius: 4px;
  background: linear-gradient(180deg, #fbbf24, #f59e0b);
  box-shadow: 0 10px 20px rgba(2,6,23,0.10);
  border: 1px solid rgba(15,23,42,0.10);
}
.p-clip .clp::after{
  content:"";
  position:absolute; left: 3px; top: 5px;
  width: 10px; height: 2px;
  border-radius: 999px;
  background: rgba(15,23,42,0.22);
  box-shadow: 0 5px 0 rgba(15,23,42,0.20);
}
.p-clip .pen{
  position:absolute; left: 22px; top: 40px;
  width: 16px; height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  transform: rotate(-18deg);
  box-shadow: 0 10px 18px rgba(2,6,23,0.10);
}

/* GRAD: cap + diploma + stelline */
.p-grad .cap{
  position:absolute; left: 30px; top: 10px;
  width: 16px; height: 6px;
  border-radius: 4px 4px 2px 2px;
  background: rgba(15,23,42,0.32);
}
.p-grad .cap::after{
  content:"";
  position:absolute; left: 7px; top: 5px;
  width: 2px; height: 10px;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--dino2), var(--med2));
}
.p-grad .dip{
  position:absolute; left: 28px; top: 30px;
  width: 18px; height: 10px;
  border-radius: 4px;
  background: linear-gradient(180deg, #fde68a, #fbbf24);
  box-shadow: 0 10px 18px rgba(2,6,23,0.10);
  border: 1px solid rgba(15,23,42,0.10);
}
.p-grad .dip::after{
  content:"";
  position:absolute; right: 3px; top: 3px;
  width: 6px; height: 4px;
  border-radius: 2px;
  background: rgba(15,23,42,0.12);
}
.p-grad .star{
  position:absolute;
  width: 8px; height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  opacity:.0;
  transform: translateX(0) scaleX(1);
  animation: starPop .9s ease-in-out infinite;
}
.p-grad .star.s1{ left: 44px; top: 10px; transform: rotate(22deg); }
.p-grad .star.s2{ left: 42px; top: 18px; transform: rotate(-18deg); animation-delay:.15s; }
.p-grad .star.s3{ left: 38px; top: 6px;  transform: rotate(78deg);  animation-delay:.30s; }
.smx-story[data-phase="grad"] .p-grad .star{ opacity:1; }

@keyframes starPop{
  0%,100%{ transform: translateX(0) scaleX(1); opacity:.70; }
  50%{ transform: translateX(4px) scaleX(1.25); opacity:1; }
}
`;