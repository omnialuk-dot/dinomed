import { Link } from "react-router-dom";

export default function ChiSiamo() {
  return (
    <main className="cs">
      <style>{css}</style>

      {/* HERO (senza immagini) */}
      <section className="cs-hero">
        <div className="cs-kicker">
          <span className="cs-dot" aria-hidden="true" />
          <span className="cs-brand">
            <span className="cs-dino">Dino</span>
            <span className="cs-med">Med</span>
          </span>
          <span className="cs-sep">•</span>
          <span className="cs-kickerText">Chi siamo</span>
        </div>

        <h1 className="cs-title">
          Siamo studenti. <span className="cs-grad">Come te.</span>
        </h1>

        <p className="cs-sub">
          DinoMed è nato dopo aver affrontato il <b>primo semestre filtro</b>. Ci siamo detti una cosa semplice:
          chi arriva dopo di noi merita di sentirsi <b>meno perso</b>, non di dover ricominciare da zero.
        </p>

        <div className="cs-pills">
          <span className="cs-pill">Strutturato</span>
          <span className="cs-pill">Pulito</span>
          <span className="cs-pill">In crescita</span>
        </div>
      </section>

      {/* 3 cards */}
      <section className="cs-section">
        <div className="cs-grid">
          <Card
            tone="isGreen"
            icon={<IconCompass />}
            title="Perché lo facciamo"
            text="Perché sappiamo cosa significa studiare con l’ansia del filtro. Qui trovi una struttura chiara: simulazioni, dispense e ripasso—senza rumore."
          />
          <Card
            tone="isBlue"
            icon={<IconBolt />}
            title="Come lo costruiamo"
            text="Partiamo da ciò che serve davvero: materiali ordinati, simulazioni immediate, e una navigazione che ti fa arrivare al punto in pochi click."
          />
          <Card
            tone="isTeal"
            icon={<IconSeed />}
            title="Dove sta andando"
            text="Non è perfetto e non vuole esserlo: cresce insieme a chi lo usa, semestre dopo semestre. Se oggi aiuta qualcuno a sentirsi meno perso, sta facendo il suo lavoro."
          />
        </div>
      </section>

      {/* values (più “app”, poco testo) */}
      <section className="cs-section">
        <div className="cs-sectionHead">
          <h2 className="cs-h2">Tre promesse semplici</h2>
          <p className="cs-h2Sub">Piccole, ma importanti.</p>
        </div>

        <div className="cs-promises">
          <Promise icon={<IconCheck />} title="Niente fuffa" text="Solo ciò che serve." />
          <Promise icon={<IconGrid />} title="Ordine prima di tutto" text="Materiale trovabile al volo." />
          <Promise icon={<IconHeart />} title="Fatto da studenti" text="Con problemi reali in mente." />
        </div>
      </section>

      {/* CTA */}
      <section className="cs-cta">
        <div className="cs-ctaInner">
          <div>
            <div className="cs-ctaTitle">Hai un’idea o una segnalazione?</div>
            <div className="cs-ctaSub">Ci aiuta davvero a farlo crescere bene.</div>
          </div>

          <div className="cs-ctaBtns">
            <Link className="cs-btn cs-primary" to="/contatti">
              Scrivici <span aria-hidden="true">→</span>
              <span className="cs-shine" aria-hidden="true" />
            </Link>
            <Link className="cs-btn cs-soft" to="/simulazioni">
              Vai alle simulazioni <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------------- components ---------------- */
function Card({ tone, icon, title, text }) {
  return (
    <div className={`cs-card ${tone}`}>
      <div className="cs-cardIcon" aria-hidden="true">
        {icon}
      </div>
      <div className="cs-cardTitle">{title}</div>
      <div className="cs-cardText">{text}</div>
    </div>
  );
}

function Promise({ icon, title, text }) {
  return (
    <div className="cs-promise">
      <div className="cs-promiseIcon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <div className="cs-promiseTitle">{title}</div>
        <div className="cs-promiseText">{text}</div>
      </div>
    </div>
  );
}

/* ---------------- icons (SVG, no emoji) ---------------- */
function IconCheck() {
  return (
    <span className="cs-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
function IconGrid() {
  return (
    <span className="cs-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    </span>
  );
}
function IconHeart() {
  return (
    <span className="cs-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 21s-7-4.6-9.5-8.6C.3 8.9 2.4 5.8 5.8 5.5c1.8-.1 3.4.7 4.2 2 .8-1.3 2.4-2.1 4.2-2 3.4.3 5.5 3.4 3.3 6.9C19 16.4 12 21 12 21Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
function IconCompass() {
  return (
    <span className="cs-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M14.8 9.2 13 13l-3.8 1.8L11 11l3.8-1.8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
function IconBolt() {
  return (
    <span className="cs-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
function IconSeed() {
  return (
    <span className="cs-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M20 4c-6 1-9.5 4.5-10.5 10.5C15.5 13.5 19 10 20 4Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M4 20c1-6 4.5-9.5 10.5-10.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

/* ---------------- CSS (stesso mood, diversa struttura) ---------------- */
const css = `
:root{
  --dino:#22c55e; --dino2:#16a34a;
  --med:#38bdf8;  --med2:#0ea5e9;
  --ink: rgba(15,23,42,0.92);
  --ink2: rgba(15,23,42,0.72);
  --bd: rgba(15,23,42,0.10);
  --shadow2: 0 12px 28px rgba(2,6,23,0.08);
}

.cs{
  max-width: 1120px;
  margin: 0 auto;
  padding: 22px;
}

/* hero */
.cs-hero{
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
  padding: 28px;
}
@media (max-width: 520px){
  .cs-hero{ padding: 18px; }
}

.cs-kicker{
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
.cs-dot{
  width: 10px; height: 10px; border-radius: 999px;
  background: linear-gradient(90deg, var(--dino), var(--med));
  box-shadow: 0 10px 20px rgba(2,6,23,0.10);
}
.cs-brand{ display:inline-flex; gap: 0; }
.cs-dino{ color: var(--dino2); font-weight: 1000; }
.cs-med{ color: var(--med2); font-weight: 1000; }
.cs-sep{ opacity:.55; }

.cs-title{
  margin: 16px 0 10px;
  font-size: 46px;
  line-height: 1.02;
  letter-spacing: -0.035em;
  color: var(--ink);
  font-weight: 1000;
}
@media (max-width: 520px){ .cs-title{ font-size: 36px; } }

.cs-grad{
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  -webkit-background-clip:text;
  background-clip:text;
  color: transparent;
}

.cs-sub{
  margin: 0;
  color: var(--ink2);
  font-weight: 850;
  max-width: 85ch;
  line-height: 1.5;
}

.cs-pills{
  margin-top: 18px;
  display:flex;
  gap: 10px;
  flex-wrap: wrap;
}
.cs-pill{
  display:inline-flex;
  padding: 9px 12px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.62);
  font-weight: 900;
  color: rgba(15,23,42,0.78);
}

/* sections */
.cs-section{ margin-top: 28px; }
.cs-sectionHead{ margin: 0 4px 14px; }
.cs-h2{ margin:0; font-size: 18px; font-weight: 1000; color: var(--ink); letter-spacing: -0.01em; }
.cs-h2Sub{ margin: 6px 0 0; color: rgba(15,23,42,0.66); font-weight: 850; }

.cs-grid{
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
@media (max-width: 980px){ .cs-grid{ grid-template-columns: 1fr; } }

.cs-card{
  border-radius: 24px;
  border: 1px solid rgba(15,23,42,0.10);
  background:
    radial-gradient(520px 220px at 30% -10%, rgba(34,197,94,0.10), transparent 60%),
    radial-gradient(520px 220px at 80% -10%, rgba(56,189,248,0.10), transparent 60%),
    rgba(255,255,255,0.90);
  box-shadow: 0 14px 52px rgba(2,6,23,0.08);
  padding: 18px;
}

.cs-cardIcon{
  width: 52px; height: 52px;
  border-radius: 18px;
  display:grid;
  place-items:center;
  border: 1px solid rgba(15,23,42,0.08);
  margin-bottom: 14px;
}
.cs-cardIcon svg{ width: 24px; height: 24px; }

.cs-card.isGreen .cs-cardIcon{
  background: linear-gradient(135deg, rgba(34,197,94,0.14), rgba(34,197,94,0.06));
  color: rgba(22,163,74,0.95);
  border-color: rgba(34,197,94,0.18);
}
.cs-card.isBlue .cs-cardIcon{
  background: linear-gradient(135deg, rgba(56,189,248,0.16), rgba(56,189,248,0.06));
  color: rgba(14,165,233,0.95);
  border-color: rgba(56,189,248,0.20);
}
.cs-card.isTeal .cs-cardIcon{
  background: linear-gradient(135deg, rgba(16,185,129,0.14), rgba(16,185,129,0.06));
  color: rgba(5,150,105,0.95);
  border-color: rgba(16,185,129,0.18);
}

.cs-cardTitle{ font-weight: 1000; color: rgba(15,23,42,0.92); letter-spacing: -0.01em; }
.cs-cardText{ margin-top: 8px; font-weight: 850; color: rgba(15,23,42,0.72); line-height: 1.45; }

/* promises */
.cs-promises{
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
@media (max-width: 980px){ .cs-promises{ grid-template-columns: 1fr; } }

.cs-promise{
  border-radius: 24px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.88);
  box-shadow: 0 14px 40px rgba(2,6,23,0.07);
  padding: 18px;
  display:flex;
  gap: 12px;
  align-items:flex-start;
}
.cs-promiseIcon{
  width: 46px; height: 46px;
  border-radius: 18px;
  display:grid;
  place-items:center;
  background: linear-gradient(135deg, rgba(34,197,94,0.10), rgba(56,189,248,0.10));
  border: 1px solid rgba(15,23,42,0.08);
  color: rgba(15,23,42,0.78);
}
.cs-promiseTitle{ font-weight: 1000; color: rgba(15,23,42,0.92); }
.cs-promiseText{ margin-top: 6px; font-weight: 850; color: rgba(15,23,42,0.70); }

/* CTA */
.cs-cta{
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
.cs-ctaInner{
  padding: 20px 22px;
  display:flex;
  justify-content: space-between;
  align-items:center;
  gap: 14px;
  flex-wrap: wrap;
}
.cs-ctaTitle{ font-weight: 1000; color: rgba(15,23,42,0.92); }
.cs-ctaSub{ margin-top: 6px; font-weight: 850; color: rgba(15,23,42,0.70); }

.cs-ctaBtns{ display:flex; gap: 12px; flex-wrap: wrap; }

.cs-btn{
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
.cs-btn:hover{ transform: translateY(-1px); box-shadow: 0 18px 40px rgba(2,6,23,0.14); filter: saturate(1.03); }

.cs-primary{
  color:white;
  border: 1px solid rgba(255,255,255,0.18);
  background: linear-gradient(90deg, var(--dino2), var(--med2));
}
.cs-soft{
  background: linear-gradient(135deg, rgba(34,197,94,0.10), rgba(56,189,248,0.10));
}
.cs-shine{
  position:absolute; inset:0;
  background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.26) 25%, transparent 50%);
  transform: translateX(-120%);
  animation: csShine 4.2s ease-in-out infinite;
  pointer-events: none;
}
@keyframes csShine{
  0%, 58% { transform: translateX(-120%); }
  88%, 100% { transform: translateX(120%); }
}

/* icons */
.cs-ico{ width: 18px; height: 18px; display:inline-grid; place-items:center; }
.cs-ico svg{ width: 18px; height: 18px; }
`;