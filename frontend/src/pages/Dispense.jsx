import { useEffect, useState } from "react";

export default function Dispense() {
  const [dispense, setDispense] = useState([]);
  const [filtro, setFiltro] = useState("Tutte");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE}/dispense`)
      .then((r) => r.json())
      .then(setDispense);
  }, []);

  const semestri = ["Tutte", ...new Set(dispense.map((d) => d.semestre))];

  const filtrate =
    filtro === "Tutte" ? dispense : dispense.filter((d) => d.semestre === filtro);

  return (
    <main className="dsp">
      <style>{css}</style>

      {/* HERO */}
      <section className="dsp-hero">
        <div className="dsp-heroInner">
          <div className="dsp-kicker">
            <span className="dsp-dot" />
            <span>Dispense DinoMed</span>
          </div>

          <h1 className="dsp-title">
            Tutto il materiale.<br />
            <span className="dsp-grad">Senza caos.</span>
          </h1>

          <p className="dsp-sub">
            PDF ordinati per semestre e materia. Apri, studi, vai avanti.
          </p>
        </div>
      </section>

      {/* FILTRO */}
      <section className="dsp-filter">
        {semestri.map((s) => (
          <button
            key={s}
            className={`dsp-pill ${filtro === s ? "isActive" : ""}`}
            onClick={() => setFiltro(s)}
          >
            {s}
          </button>
        ))}
      </section>

      {/* GRID */}
      <section className="dsp-grid">
        {filtrate.map((d) => (
    <a
  key={d.id}
  href={d.url}
  target="_blank"
  rel="noopener noreferrer"
  className="dsp-card"
>
            <div className="dsp-cardTop">
              <div className="dsp-icon">PDF</div>
              <div className="dsp-meta">
                <div className="dsp-titleSm">{d.titolo}</div>
                <div className="dsp-subSm">{d.materia}</div>
              </div>
            </div>

            <div className="dsp-footer">
              <span className="dsp-sem">{d.semestre}</span>
              <span className="dsp-open">
                Apri <span aria-hidden>→</span>
              </span>
            </div>
          </a>
        ))}
      </section>
    </main>
  );
}

/* ---------------- CSS ---------------- */
const css = `
:root{
  --dino:#22c55e;
  --med:#38bdf8;
  --ink: rgba(15,23,42,.92);
  --ink2: rgba(15,23,42,.70);
  --bd: rgba(15,23,42,.10);
}

.dsp{
  max-width: 1120px;
  margin: 0 auto;
  padding: 22px;
}

/* HERO */
.dsp-hero{
  border-radius: 28px;
  padding: 32px;
  border: 1px solid var(--bd);
  background:
    radial-gradient(700px 260px at 15% -30%, rgba(34,197,94,.18), transparent 60%),
    radial-gradient(700px 260px at 80% -30%, rgba(56,189,248,.18), transparent 55%),
    rgba(255,255,255,.9);
}

.dsp-kicker{
  display:inline-flex;
  gap:10px;
  align-items:center;
  padding:10px 14px;
  border-radius:999px;
  border:1px solid var(--bd);
  background:rgba(255,255,255,.7);
  font-weight:900;
}

.dsp-dot{
  width:10px;height:10px;border-radius:50%;
  background:linear-gradient(90deg,var(--dino),var(--med));
}

.dsp-title{
  margin:16px 0 8px;
  font-size:42px;
  font-weight:1000;
  letter-spacing:-.03em;
  color:var(--ink);
}

.dsp-grad{
  background:linear-gradient(90deg,var(--dino),var(--med));
  -webkit-background-clip:text;
  color:transparent;
}

.dsp-sub{
  margin:0;
  color:var(--ink2);
  font-weight:850;
}

/* FILTER */
.dsp-filter{
  margin:22px 4px;
  display:flex;
  gap:10px;
  flex-wrap:wrap;
}

.dsp-pill{
  padding:10px 14px;
  border-radius:999px;
  border:1px solid var(--bd);
  background:rgba(255,255,255,.7);
  font-weight:900;
  cursor:pointer;
}

.dsp-pill.isActive{
  background:linear-gradient(90deg,var(--dino),var(--med));
  color:white;
  border-color:transparent;
}

/* GRID */
.dsp-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:16px;
}

@media(max-width:900px){
  .dsp-grid{ grid-template-columns:1fr; }
}

.dsp-card{
  text-decoration:none;
  color:inherit;
  border-radius:22px;
  padding:18px;
  border:1px solid var(--bd);
  background:rgba(255,255,255,.92);
  box-shadow:0 14px 40px rgba(2,6,23,.08);
  display:flex;
  flex-direction:column;
  justify-content:space-between;
  transition:transform .18s ease, box-shadow .18s ease;
}

.dsp-card:hover{
  transform:translateY(-2px);
  box-shadow:0 18px 60px rgba(2,6,23,.12);
}

.dsp-cardTop{
  display:flex;
  gap:14px;
}

.dsp-icon{
  width:46px;height:46px;
  border-radius:14px;
  display:grid;place-items:center;
  font-weight:1000;
  background:linear-gradient(135deg,rgba(34,197,94,.16),rgba(56,189,248,.16));
}

.dsp-titleSm{
  font-weight:1000;
  color:var(--ink);
}

.dsp-subSm{
  font-weight:850;
  color:var(--ink2);
}

.dsp-footer{
  margin-top:18px;
  display:flex;
  justify-content:space-between;
  align-items:center;
}

.dsp-sem{
  font-weight:900;
  color:var(--ink2);
}

.dsp-open{
  font-weight:1000;
}
`;