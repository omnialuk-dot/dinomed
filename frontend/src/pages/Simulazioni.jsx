import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "../assets/photos/typing.jpg";

export default function Simulazioni() {
  const nav = useNavigate();
  const storyRef = useRef(null);
  const moverRef = useRef(null);

  useEffect(() => {
    const story = storyRef.current;
    const mover = moverRef.current;
    if (!story || !mover) return;

    const steps = ["read", "write", "grad"];
    let i = 0;

    const tick = () => {
      story.dataset.phase = steps[i % steps.length];
      i++;
    };

    tick();
    const id = setInterval(tick, 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="sim">
      <style>{css}</style>

      <section className="sim-hero">
        <div className="sim-kicker">
          <span className="dot" />
          <strong>DinoMed</strong>
          <span className="sep">•</span>
          <span>Simulazioni</span>
        </div>

        <div className="sim-grid">
          <div>
            <h1 className="sim-title">
              Allenati <span>come all’esame</span>.
            </h1>
            <p className="sim-lead">In modo semplice.</p>

            <p className="sim-sub">
              Simulazioni chiare, realistiche e senza distrazioni. Parti, rispondi,
              capisci dove sbagli.
            </p>

            <button className="sim-btn" onClick={() => nav("/simulazioni/config")}>
              Inizia una simulazione →
            </button>

            {/* ANIMAZIONE */}
            <div className="sim-story" ref={storyRef}>
              <div className="sim-track" />
              <div className="sim-mover" ref={moverRef}>
                <svg viewBox="0 0 120 80">
                  {/* stickman */}
                  <g className="man">
                    <circle cx="30" cy="16" r="6" />
                    <line x1="30" y1="22" x2="30" y2="42" />
                    <line x1="30" y1="26" x2="22" y2="34" />
                    <line x1="30" y1="26" x2="38" y2="34" />
                    <line x1="30" y1="42" x2="24" y2="56" />
                    <line x1="30" y1="42" x2="36" y2="56" />
                  </g>

                  {/* READ */}
                  <g className="scene read">
                    <rect x="40" y="26" width="16" height="22" rx="2" />
                    <line x1="42" y1="30" x2="52" y2="30" />
                    <line x1="42" y1="34" x2="52" y2="34" />
                  </g>

                  {/* WRITE */}
                  <g className="scene write">
                    <rect x="44" y="40" width="30" height="8" rx="2" />
                    <rect x="48" y="36" width="16" height="6" rx="1" />
                    <line x1="38" y1="34" x2="50" y2="38" />
                  </g>

                  {/* GRAD */}
                  <g className="scene grad">
                    <rect x="44" y="30" width="20" height="10" rx="2" />
                    <circle cx="54" cy="42" r="2" />
                    <polygon points="24,8 30,4 36,8 30,12" />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          <div className="sim-visual">
            <img src={heroImg} alt="" />
          </div>
        </div>
      </section>
    </main>
  );
}

const css = `
:root{
  --green:#16a34a;
  --green2:#22c55e;
  --ink:#0f172a;
}

.sim{max-width:1100px;margin:auto;padding:24px}
.sim-hero{background:#fff;border-radius:24px;padding:28px;box-shadow:0 20px 60px rgba(0,0,0,.08)}
.sim-kicker{display:flex;align-items:center;gap:8px;font-weight:700}
.dot{width:8px;height:8px;border-radius:50%;background:linear-gradient(90deg,var(--green),#38bdf8)}
.sep{opacity:.5}

.sim-grid{display:grid;grid-template-columns:1fr 1fr;gap:32px}
.sim-title{font-size:44px;margin:12px 0}
.sim-title span{background:linear-gradient(90deg,var(--green),#38bdf8);-webkit-background-clip:text;color:transparent}
.sim-lead{font-weight:700}
.sim-sub{color:#475569;max-width:60ch}

.sim-btn{
  margin-top:16px;
  background:linear-gradient(90deg,var(--green),var(--green2));
  color:#fff;border:0;padding:12px 18px;border-radius:999px;
  font-weight:700;cursor:pointer
}

.sim-story{margin-top:24px;height:90px;position:relative}
.sim-track{position:absolute;left:0;right:0;top:60px;height:2px;background:#e5e7eb}

.sim-mover{position:absolute;left:10px;top:6px}
svg{width:120px;height:80px}

.man *{stroke:var(--green);stroke-width:3;stroke-linecap:round;fill:none}
.man circle{fill:var(--green)}

.scene{opacity:0}
.sim-story[data-phase="read"] .read{opacity:1}
.sim-story[data-phase="write"] .write{opacity:1}
.sim-story[data-phase="grad"] .grad{opacity:1}

.read rect{fill:#ef4444}
.read line{stroke:#fff;stroke-width:2}

.write rect{fill:#f97316}
.write line{stroke:#0ea5e9;stroke-width:3}

.grad rect{fill:#fbbf24}
.grad polygon{fill:#0f172a}

.sim-visual img{width:100%;border-radius:20px;object-fit:cover}
`;