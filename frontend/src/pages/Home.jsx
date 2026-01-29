import { Link } from "react-router-dom";
import hero from "../assets/photos/hero-desk.jpg";

export default function Home() {
  return (
    <main className="dm-root">
      <style>{css}</style>

      {/* HERO */}
      <section className="dm-hero">
        <div className="dm-hero-bg" style={{ backgroundImage: `url(${hero})` }} />
        <div className="dm-hero-overlay" />

        <div className="dm-hero-inner">
          <div className="dm-pill dm-anim-in">
            <SparkIcon />
            <span>Premium mode • DinoMed</span>
          </div>

          <h1 className="dm-title dm-anim-in delay-1">
            Meno caos. <br />
            <span className="dm-grad">Più risultati.</span>
          </h1>

          <p className="dm-sub dm-anim-in delay-2">
            Simulazioni realistiche, dispense chiare e metodo. Un’esperienza
            ordinata, veloce, e fatta per studenti veri.
          </p>

          <div className="dm-actions dm-anim-in delay-3">
            <Link to="/simulazioni" className="dm-btn dm-btn-primary">
              Inizia dalle simulazioni →
            </Link>
            <Link to="/dispense" className="dm-btn dm-btn-ghost">
              Esplora le dispense
            </Link>
          </div>

          <div className="dm-metrics dm-anim-in delay-4">
            <Metric label="Struttura" value="Chiara" icon={<GridIcon />} tone="blue" />
<Metric label="Studio" value="Concentrato" icon={<BookIcon />} tone="yellow" />
<Metric label="Tempo" value="Ottimizzato" icon={<BoltIcon />} tone="cyan" />
          </div>
        </div>
      </section>

      {/* VALUE GRID */}
      <section className="dm-section">
        <div className="dm-sectionHead">
          <h2 className="dm-h2">Perché DinoMed funziona</h2>
          <p className="dm-p">
            Non è un blog: è un sistema. Se sai cosa fare oggi, passi prima.
          </p>
        </div>

        <div className="dm-grid">
          <Feature
            icon={<BrainIcon />}
            title="Simulazioni che sembrano l’esame"
            text="Allenati come in sessione vera: ritmo, difficoltà e feedback pulito."
            to="/simulazioni"
            cta="Vai alle simulazioni →"
          />
          <Feature
            icon={<BookIcon />}
            title="Dispense davvero filtrabili"
            text="Tag, livello, pagine e a chi serve. Trovi quello che ti serve in 10 secondi."
            to="/dispense"
            cta="Vai alle dispense →"
          />
          <Feature
            icon={<TargetIcon />}
            title="Metodo: studio → prova → ripasso"
            text="Capisci dove sbagli, cosa ripassare e quando. Niente “ripasso infinito”."
            to="/dispense"
            cta="Imposta il ripasso →"
          />
        </div>
      </section>

      {/* TRUST + CTA */}
      <section className="dm-cta">
        <div className="dm-ctaCard">
          <div className="dm-ctaLeft">
            <div className="dm-badge">
              <ShieldIcon />
              <span>Affidabile, ordinato, veloce</span>
            </div>
            <h3 className="dm-h3">Fai una simulazione, poi apri la dispensa giusta.</h3>
            <p className="dm-p2">
              DinoMed ti accompagna: fai → controlla → ripassa. Così migliori davvero.
            </p>
          </div>

          <div className="dm-ctaRight">
            <Link to="/simulazioni" className="dm-btn dm-btn-primary dm-btn-wide">
              Inizia ora →
            </Link>
            <Link to="/dispense" className="dm-btn dm-btn-ghost dm-btn-wide">
              Vedi dispense
            </Link>
          </div>
        </div>
      </section>

      {/* ADMIN */}
      <section className="dm-admin">
        <div className="dm-adminLeft">
          <div className="dm-lock">
            <LockIcon />
          </div>
          <div>
            <div className="dm-adminTitle">Area riservata</div>
            <div className="dm-adminText">
              Gestione contenuti: aggiungi/modifica dispense e simulazioni.
            </div>
          </div>
        </div>

        <Link to="/admin" className="dm-btn dm-btn-primary">
          Accedi →
        </Link>
      </section>
    </main>
  );
}

function Metric({ label, value, icon, tone }) {
  return (
    <div className={`dm-metric dm-${tone}`}>
      <div className="dm-metricIcon">{icon}</div>
      <div>
        <div className="dm-metricLabel">{label}</div>
        <div className="dm-metricValue">{value}</div>
      </div>
    </div>
  );
}

function Feature({ icon, title, text, to, cta }) {
  return (
    <article className="dm-card">
      <div className="dm-cardTop">
        <div className="dm-icon">{icon}</div>
        <h3 className="dm-cardTitle">{title}</h3>
      </div>
      <p className="dm-cardText">{text}</p>
      <Link to={to} className="dm-cardLink">
        {cta}
      </Link>
    </article>
  );
}

/* --- ICONS (SVG inline, no assets, no libs) --- */
function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M12 2l1.2 4.2L17 8l-3.8 1.8L12 14l-1.2-4.2L7 8l3.8-1.8L12 2z"
        fill="currentColor"
      />
      <path
        d="M5 14l.8 2.6L8 18l-2.2 1.4L5 22l-.8-2.6L2 18l2.2-1.4L5 14z"
        fill="currentColor"
        opacity="0.7"
      />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"
        fill="currentColor"
      />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M12 2a10 10 0 100 20 10 10 0 000-20zm2.7 6.3l-1.5 4-4 1.5 1.5-4 4-1.5z"
        fill="currentColor"
      />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"
        fill="currentColor"
      />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M9 3a4 4 0 00-4 4v1a3 3 0 000 6v1a4 4 0 004 4h1v-2H9a2 2 0 01-2-2v-1H6a1 1 0 010-2h1V10H6a1 1 0 010-2h1V7a2 2 0 012-2h1V3H9zm6 0h-1v2h1a2 2 0 012 2v1h1a1 1 0 010 2h-1v2h1a1 1 0 010 2h-1v1a2 2 0 01-2 2h-1v2h1a4 4 0 004-4v-1a3 3 0 000-6V7a4 4 0 00-4-4z"
        fill="currentColor"
      />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M4 4h10a2 2 0 012 2v14H6a2 2 0 01-2-2V4zm14 2h2v14h-2V6z"
        fill="currentColor"
      />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M12 2a10 10 0 1010 10h-2a8 8 0 11-8-8V2zm6 10a6 6 0 11-6-6v2a4 4 0 104 4h2zm-6-2a2 2 0 102 2h2a4 4 0 11-4-4v2z"
        fill="currentColor"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M12 2l8 4v6c0 5-3.5 9.4-8 10-4.5-.6-8-5-8-10V6l8-4z"
        fill="currentColor"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M17 10V8a5 5 0 00-10 0v2H5v12h14V10h-2zm-8 0V8a3 3 0 016 0v2H9z"
        fill="currentColor"
      />
    </svg>
  );
}

/* --- CSS --- */
const css = `
.dm-root{
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 20px 48px;
}

/* HERO */
.dm-hero{
  position: relative;
  border-radius: 32px;
  overflow: hidden;
  border: 1px solid rgba(15,23,42,0.10);
  box-shadow: 0 30px 90px rgba(15,23,42,0.14);
}
.dm-hero-bg{
  position:absolute;
  inset:0;
  background-size: cover;
  background-position: center;
  filter: saturate(0.85) contrast(0.95);
  transform: scale(1.04);
}
.dm-hero-overlay{
  position:absolute;
  inset:0;
  background:
    radial-gradient(circle at 20% 20%, rgba(255,255,255,0.92), rgba(255,255,255,0.68) 45%, rgba(255,255,255,0.38) 70%),
    linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.78));
}
.dm-hero-inner{
  position: relative;
  padding: 38px 30px;
  max-width: 720px;
}

.dm-pill{
  display:inline-flex;
  align-items:center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid rgba(37,99,235,0.18);
  background: rgba(37,99,235,0.06);
  color: rgba(15,23,42,0.84);
  font-weight: 950;
}

.dm-title{
  margin: 14px 0 10px 0;
  font-size: 54px;
  line-height: 1.03;
  letter-spacing: -1px;
  color: rgba(15,23,42,0.94);
}
.dm-grad{
  background: linear-gradient(90deg, #10b981, #2563eb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.dm-sub{
  margin: 0;
  margin-top: 12px;
  font-size: 18px;
  line-height: 1.45;
  font-weight: 800;
  color: rgba(15,23,42,0.70);
  max-width: 60ch;
}

.dm-actions{
  margin-top: 22px;
  display:flex;
  gap: 12px;
  flex-wrap: wrap;
}

.dm-btn{
  text-decoration:none;
  padding: 14px 18px;
  border-radius: 16px;
  font-weight: 950;
  user-select:none;
  transition: transform .16s ease, box-shadow .16s ease, background .16s ease;
}
.dm-btn-primary{
  background: rgba(15,23,42,0.92);
  color: white;
  box-shadow: 0 20px 60px rgba(15,23,42,0.22);
}
.dm-btn-primary:hover{
  transform: translateY(-2px);
  box-shadow: 0 28px 90px rgba(15,23,42,0.30);
}
.dm-btn-ghost{
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(15,23,42,0.14);
  color: rgba(15,23,42,0.86);
}
.dm-btn-ghost:hover{
  transform: translateY(-2px);
}

.dm-metrics{
  margin-top: 22px;
  display:flex;
  gap: 12px;
  flex-wrap: wrap;
}
.dm-metric{
  display:flex;
  align-items:center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.76);
  box-shadow: 0 12px 40px rgba(15,23,42,0.08);
}
.dm-metricIcon{
  width: 38px;
  height: 38px;
  display:grid;
  place-items:center;
  border-radius: 14px;
  background: rgba(16,185,129,0.10);
  border: 1px solid rgba(16,185,129,0.16);
  color: rgba(15,23,42,0.85);
}
.dm-metricLabel{
  font-weight: 900;
  color: rgba(15,23,42,0.70);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: .08em;
}
.dm-metricValue{
  font-weight: 1000;
  color: rgba(15,23,42,0.92);
}

/* SECTION */
.dm-section{
  margin-top: 20px;
}
.dm-sectionHead{
  margin: 18px 0 12px 0;
  padding: 0 2px;
}
.dm-h2{
  margin: 0;
  font-size: 18px;
  font-weight: 1000;
  color: rgba(15,23,42,0.92);
}
.dm-p{
  margin: 8px 0 0 0;
  color: rgba(15,23,42,0.66);
  font-weight: 800;
  line-height: 1.4;
}

.dm-grid{
  margin-top: 12px;
  display:grid;
  grid-template-columns: repeat(3, minmax(0,1fr));
  gap: 14px;
}
@media (max-width: 980px){
  .dm-title{ font-size: 44px; }
  .dm-grid{ grid-template-columns: 1fr; }
}

.dm-card{
  border-radius: 22px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.92);
  box-shadow: 0 16px 55px rgba(15,23,42,0.06);
  padding: 16px;
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}
.dm-card:hover{
  transform: translateY(-3px);
  box-shadow: 0 24px 85px rgba(15,23,42,0.12);
  border-color: rgba(37,99,235,0.22);
}
.dm-cardTop{
  display:flex;
  align-items:center;
  gap: 10px;
}
.dm-icon{
  width: 42px;
  height: 42px;
  border-radius: 16px;
  display:grid;
  place-items:center;
  background: rgba(37,99,235,0.06);
  border: 1px solid rgba(37,99,235,0.16);
  color: rgba(15,23,42,0.86);
}
.dm-cardTitle{
  margin: 0;
  font-size: 15px;
  font-weight: 1000;
  color: rgba(15,23,42,0.92);
}
.dm-cardText{
  margin: 10px 0 0 0;
  color: rgba(15,23,42,0.68);
  font-weight: 800;
  line-height: 1.4;
}
.dm-cardLink{
  display:inline-block;
  margin-top: 10px;
  text-decoration:none;
  font-weight: 950;
  color: rgba(37,99,235,0.95);
}
.dm-cardLink:hover{ text-decoration: underline; }

/* CTA */
.dm-cta{
  margin-top: 14px;
}
.dm-ctaCard{
  border-radius: 26px;
  border: 1px solid rgba(15,23,42,0.10);
  background: linear-gradient(135deg, rgba(16,185,129,0.08), rgba(37,99,235,0.08));
  box-shadow: 0 16px 55px rgba(15,23,42,0.06);
  padding: 18px;
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.dm-badge{
  display:inline-flex;
  align-items:center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(16,185,129,0.35);
  background: rgba(16,185,129,0.14);
  font-weight: 950;
  color: rgba(15,23,42,0.9);
}
.dm-h3{
  margin: 12px 0 8px 0;
  font-size: 16px;
  font-weight: 1000;
}
.dm-p2{
  margin: 0;
  color: rgba(15,23,42,0.68);
  font-weight: 800;
  line-height: 1.4;
  max-width: 60ch;
}
.dm-ctaRight{
  display:grid;
  gap: 10px;
}
.dm-btn-wide{ justify-content:center; }

/* ADMIN */
.dm-admin{
  margin-top: 16px;
  padding: 14px;
  border-radius: 20px;
  border: 1px dashed rgba(15,23,42,0.22);
  background: rgba(15,23,42,0.03);
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.dm-adminLeft{
  display:flex;
  align-items:center;
  gap: 12px;
}
.dm-lock{
  width: 44px;
  height: 44px;
  border-radius: 16px;
  display:grid;
  place-items:center;
  background: rgba(15,23,42,0.06);
  border: 1px solid rgba(15,23,42,0.12);
  color: rgba(15,23,42,0.85);
}
.dm-adminTitle{
  font-weight: 1000;
  color: rgba(15,23,42,0.92);
}
.dm-adminText{
  font-weight: 800;
  color: rgba(15,23,42,0.65);
  font-size: 14px;
}

/* METRIC COLOR THEMES */
.dm-blue .dm-metricIcon{
  background: rgba(37,99,235,0.12);
  border-color: rgba(37,99,235,0.25);
}
.dm-yellow .dm-metricIcon{
  background: rgba(234,179,8,0.18);
  border-color: rgba(234,179,8,0.35);
}
.dm-cyan .dm-metricIcon{
  background: rgba(6,182,212,0.18);
  border-color: rgba(6,182,212,0.35);
}

/* ANIMATIONS */
.dm-anim-in{ animation: dmIn .7s ease-out both; }
.delay-1{ animation-delay: .06s; }
.delay-2{ animation-delay: .12s; }
.delay-3{ animation-delay: .18s; }
.delay-4{ animation-delay: .24s; }
@keyframes dmIn{
  from{ opacity:0; transform: translateY(12px) }
  to{ opacity:1; transform: translateY(0) }
}

/* mobile */
@media (max-width: 600px){
  .dm-hero-inner{ padding: 28px 20px; }
  .dm-title{ font-size: 40px; }
}
`;

