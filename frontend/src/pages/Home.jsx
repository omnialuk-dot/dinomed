import { Link } from "react-router-dom";
import heroImg from "../assets/photos/graduation.jpg";

export default function Home() {
  return (
    <main className="h4">
      <style>{css}</style>

      {/* HERO */}
      <section className="h4-hero">
        <div className="h4-heroGrid">
          <div className="h4-left">
            <div className="h4-kicker">
              <span className="h4-dot" aria-hidden="true" />
              <span className="h4-brand">
                <span className="h4-dino">Dino</span>
                <span className="h4-med">Med</span>
              </span>
              <span className="h4-sep">•</span>
              <span className="h4-tagline">Studenti per studenti</span>
            </div>

            <h1 className="h4-title">
              Studia <span className="h4-grad">meglio</span>. <br className="h4-br" />
              Senza perdere tempo.
            </h1>

            <p className="h4-sub">
              Simulazioni e dispense ordinate per il semestre filtro. Pulito, veloce, dritto al punto.
            </p>

            <div className="h4-ctaRow">
              <Link className="h4-btn h4-primary" to="/simulazioni">
                Fai una simulazione <span aria-hidden="true">→</span>
                <span className="h4-shine" aria-hidden="true" />
              </Link>
              <Link className="h4-btn h4-soft" to="/dispense">
                Vai alle dispense <span aria-hidden="true">→</span>
              </Link>
            </div>

            
          </div>

          <div className="h4-right" aria-hidden="true">
            <div className="h4-visual">
              <img className="h4-img" src={heroImg} alt="" />
              <div className="h4-overlay" />

              {/* micro cards “wow” */}
              <div className="h4-float h4-floatTop">
                <span className="h4-badge">
                  <IconCheck /> Correzione chiara
                </span>
                <span className="h4-badge">
                  <IconClock /> Timer opzionale
                </span>
              </div>

              <div className="h4-float h4-floatBottom">
                <div className="h4-miniTitle">Dentro trovi</div>
                <div className="h4-miniGrid">
                  <div className="h4-miniItem">
                    <span className="h4-miniDot" /> Simulazioni pronte
                  </div>
                  <div className="h4-miniItem">
                    <span className="h4-miniDot" /> PDF ordinati
                  </div>
                  <div className="h4-miniItem">
                    <span className="h4-miniDot" /> Ripasso guidato
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 CARDS (sezione super pulita) */}
      <section className="h4-section">
        <div className="h4-sectionHead">
          <h2 className="h4-h2">Cosa vuoi fare oggi?</h2>
          <p className="h4-h2Sub">Scegli una strada. Il resto è già pronto.</p>
        </div>

        <div className="h4-cards">
          <Link className="h4-card" to="/simulazioni">
            <div className="h4-cardIcon isSim" aria-hidden="true">
              <IconBoltBig />
            </div>
            <div className="h4-cardTitle">Simulazioni</div>
            <div className="h4-cardText">Allenati come all’esame. Inizia in 10 secondi.</div>
            <div className="h4-cardCta">
              Apri <span aria-hidden="true">→</span>
            </div>
          </Link>

          <Link className="h4-card" to="/dispense">
            <div className="h4-cardIcon isPdf" aria-hidden="true">
              <IconBookBig />
            </div>
            <div className="h4-cardTitle">Dispense</div>
            <div className="h4-cardText">PDF ordinati e trovabili. Niente caos.</div>
            <div className="h4-cardCta">
              Apri <span aria-hidden="true">→</span>
            </div>
          </Link>

          <Link className="h4-card" to="/chi-siamo">
            <div className="h4-cardIcon isWho" aria-hidden="true">
              <IconUsersBig />
            </div>
            <div className="h4-cardTitle">Chi siamo</div>
            <div className="h4-cardText">Studenti come te. Cresce semestre dopo semestre.</div>
            <div className="h4-cardCta">
              Apri <span aria-hidden="true">→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* MINI WHY (1 riga, non papiro) */}
      <section className="h4-why">
        <div className="h4-whyInner">
          <div className="h4-whyLeft">
            <div className="h4-whyTitle">Perché DinoMed?</div>
            <div className="h4-whyText">
              Perché nel semestre filtro la differenza la fa una cosa: trovare il materiale giusto subito.
            </div>
          </div>

          <Link className="h4-btn h4-soft" to="/ChiSiamo">
            Conoscici <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

/* ---------------- icons ---------------- */
function IconCheck() {
  return (
    <span className="h4-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
function IconClock() {
  return (
    <span className="h4-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function IconBoltBig() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function IconBookBig() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2V5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M8 7h8M8 10h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconUsersBig() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M16 11a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M19 8.5a2.2 2.2 0 1 0-1.8 4.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/* ---------------- CSS (molta aria + ordine) ---------------- */
const css = `
:root{
  --dino:#22c55e; --dino2:#16a34a;
  --med:#38bdf8;  --med2:#0ea5e9;

  --ink: rgba(15,23,42,0.92);
  --ink2: rgba(15,23,42,0.72);
  --bd: rgba(15,23,42,0.10);
  --shadow2: 0 12px 28px rgba(2,6,23,0.08);
}

.h4{ max-width: 1120px; margin: 0 auto; padding: 22px; }

/* HERO */
.h4-hero{
  border-radius: 28px;
  border: 1px solid var(--bd);
  background:
    radial-gradient(900px 280px at 12% -25%, rgba(34,197,94,0.16), transparent 60%),
    radial-gradient(900px 280px at 70% -30%, rgba(56,189,248,0.16), transparent 55%),
    rgba(255,255,255,0.90);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: var(--shadow2);
  overflow:hidden;
}

.h4-heroGrid{
  display:grid;
  grid-template-columns: 1.05fr .95fr;
  gap: 28px;
  padding: 28px;
  align-items: center;
}
@media (max-width: 980px){
  .h4-heroGrid{ grid-template-columns: 1fr; padding: 18px; gap: 18px; }
}

.h4-kicker{
  display:inline-flex;
  align-items:center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.68);
  font-weight: 950;
  color: rgba(15,23,42,0.82);
}
.h4-dot{
  width: 10px; height: 10px; border-radius: 999px;
  background: linear-gradient(90deg, var(--dino), var(--med));
  box-shadow: 0 10px 20px rgba(2,6,23,0.10);
}
.h4-brand{ display:inline-flex; gap: 0; }
.h4-dino{ color: var(--dino2); font-weight: 1000; }
.h4-med{ color: var(--med2); font-weight: 1000; }
.h4-sep{ opacity:.55; }

.h4-title{
  margin: 16px 0 10px;
  font-size: 46px;
  line-height: 1.02;
  letter-spacing: -0.035em;
  color: var(--ink);
  font-weight: 1000;
}
.h4-br{ display:none; }
@media (max-width: 520px){
  .h4-title{ font-size: 36px; }
  .h4-br{ display:block; }
}
.h4-grad{
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  -webkit-background-clip:text;
  background-clip:text;
  color: transparent;
}

.h4-sub{ margin: 0; color: var(--ink2); font-weight: 850; max-width: 70ch; }

.h4-ctaRow{ margin-top: 18px; display:flex; gap: 12px; flex-wrap: wrap; }
.h4-btn{
  position: relative;
  overflow: hidden;
  display:inline-flex;
  align-items:center;
  gap: 10px;
  padding: 13px 16px;
  border-radius: 999px;
  text-decoration:none;
  font-weight: 1000;
  border: 1px solid rgba(15,23,42,0.10);
  box-shadow: 0 14px 30px rgba(2,6,23,0.10);
  transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
  color: rgba(15,23,42,0.86);
  background: rgba(255,255,255,0.72);
}
.h4-btn:hover{ transform: translateY(-1px); box-shadow: 0 18px 40px rgba(2,6,23,0.14); filter: saturate(1.03); }

.h4-primary{
  color:white;
  border: 1px solid rgba(255,255,255,0.18);
  background: linear-gradient(90deg, var(--dino2), var(--med2));
}
.h4-soft{
  background: linear-gradient(135deg, rgba(34,197,94,0.10), rgba(56,189,248,0.10));
}

.h4-shine{
  position:absolute; inset:0;
  background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.26) 25%, transparent 50%);
  transform: translateX(-120%);
  animation: h4Shine 4.2s ease-in-out infinite;
  pointer-events: none;
}
@keyframes h4Shine{
  0%, 58% { transform: translateX(-120%); }
  88%, 100% { transform: translateX(120%); }
}

.h4-trust{ margin-top: 18px; display:flex; gap: 10px; flex-wrap: wrap; }
.h4-pill{
  display:inline-flex;
  padding: 9px 12px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.62);
  font-weight: 900;
  color: rgba(15,23,42,0.78);
}

/* VISUAL */
.h4-visual{
  position: relative;
  border-radius: 24px;
  overflow:hidden;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.92);
  box-shadow: var(--shadow2);
  height: 430px;
}
@media (max-width: 980px){ .h4-visual{ height: 320px; } }

.h4-img{
  width:100%; height:100%;
  object-fit: cover;
  display:block;
  transform: scale(1.02);
  filter: saturate(0.96) contrast(1.05);
}
.h4-overlay{
  position:absolute; inset:0;
  background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.30) 55%, rgba(255,255,255,0.88) 100%);
}

.h4-float{
  position:absolute;
  left: 14px; right: 14px;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.40);
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 18px 55px rgba(2,6,23,0.10);
  padding: 12px;
}
.h4-floatTop{ top: 14px; display:flex; gap: 8px; flex-wrap: wrap; }
.h4-floatBottom{ bottom: 14px; }

.h4-badge{
  display:inline-flex; align-items:center; gap: 8px;
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.70);
  font-weight: 950;
  color: rgba(15,23,42,0.78);
}

.h4-miniTitle{ font-weight: 1000; color: rgba(15,23,42,0.90); }
.h4-miniGrid{ margin-top: 10px; display:grid; gap: 8px; }
.h4-miniItem{ display:flex; gap: 8px; align-items:center; font-weight: 900; color: rgba(15,23,42,0.76); }
.h4-miniDot{
  width: 10px; height: 10px; border-radius: 999px;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
}

.h4-ico{ width: 18px; height: 18px; display:inline-grid; place-items:center; }
.h4-ico svg{ width: 18px; height: 18px; }

/* SECTION */
.h4-section{ margin-top: 28px; padding-top: 6px; }
.h4-sectionHead{ margin: 0 4px 14px; }
.h4-h2{ margin:0; font-size: 18px; font-weight: 1000; color: var(--ink); letter-spacing: -0.01em; }
.h4-h2Sub{ margin: 6px 0 0; color: rgba(15,23,42,0.66); font-weight: 850; }

.h4-cards{
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
@media (max-width: 980px){ .h4-cards{ grid-template-columns: 1fr; } }

.h4-card{
  border-radius: 24px;
  border: 1px solid rgba(15,23,42,0.10);
  background:
    radial-gradient(520px 220px at 30% -10%, rgba(34,197,94,0.10), transparent 60%),
    radial-gradient(520px 220px at 80% -10%, rgba(56,189,248,0.10), transparent 60%),
    rgba(255,255,255,0.90);
  box-shadow: 0 14px 52px rgba(2,6,23,0.08);
  padding: 18px;
  text-decoration:none;
  color: rgba(15,23,42,0.88);
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}
.h4-card:hover{
  transform: translateY(-2px);
  border-color: rgba(56,189,248,0.22);
  box-shadow: 0 18px 62px rgba(2,6,23,0.10);
}

.h4-cardIcon{
  width: 52px; height: 52px;
  border-radius: 18px;
  display:grid; place-items:center;
  border: 1px solid rgba(15,23,42,0.08);
  margin-bottom: 14px;
}
.h4-cardIcon svg{ width: 24px; height: 24px; }
.h4-cardIcon.isSim{
  background: linear-gradient(135deg, rgba(56,189,248,0.16), rgba(56,189,248,0.06));
  color: rgba(14,165,233,0.95);
  border-color: rgba(56,189,248,0.20);
}
.h4-cardIcon.isPdf{
  background: linear-gradient(135deg, rgba(34,197,94,0.14), rgba(34,197,94,0.06));
  color: rgba(22,163,74,0.95);
  border-color: rgba(34,197,94,0.18);
}
.h4-cardIcon.isWho{
  background: linear-gradient(135deg, rgba(16,185,129,0.14), rgba(16,185,129,0.06));
  color: rgba(5,150,105,0.95);
  border-color: rgba(16,185,129,0.18);
}

.h4-cardTitle{ font-weight: 1000; color: rgba(15,23,42,0.92); letter-spacing: -0.01em; }
.h4-cardText{ margin-top: 6px; font-weight: 850; color: rgba(15,23,42,0.72); line-height: 1.35; }
.h4-cardCta{ margin-top: 14px; font-weight: 1000; color: rgba(15,23,42,0.84); display:flex; gap: 8px; align-items:center; }

/* WHY */
.h4-why{
  margin-top: 28px;
  border-radius: 28px;
  border: 1px solid rgba(15,23,42,0.10);
  background:
    radial-gradient(700px 220px at 20% -20%, rgba(34,197,94,0.12), transparent 60%),
    radial-gradient(700px 220px at 85% -20%, rgba(56,189,248,0.12), transparent 55%),
    rgba(255,255,255,0.90);
  box-shadow: var(--shadow2);
  overflow:hidden;
}
.h4-whyInner{
  padding: 20px 22px;
  display:flex;
  justify-content: space-between;
  align-items:center;
  gap: 14px;
  flex-wrap: wrap;
}
.h4-whyTitle{ font-weight: 1000; color: rgba(15,23,42,0.92); }
.h4-whyText{ margin-top: 6px; font-weight: 850; color: rgba(15,23,42,0.70); max-width: 80ch; }
`;