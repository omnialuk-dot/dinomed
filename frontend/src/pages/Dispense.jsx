import { useEffect, useMemo, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");

export default function Dispense() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/dispense`);
        if (!res.ok) throw new Error("Impossibile caricare le dispense");
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e.message || "Errore");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const featured = useMemo(() => items.slice(0, 3), [items]);
  const all = useMemo(() => items, [items]);

  return (
    <main className="dmDispPage">
      <style>{css}</style>

      {/* HERO */}
      <section className="dmHero">
        <div>
          <span className="dmKicker">DinoMed • Dispense</span>
          <h1 className="dmTitle">Studia con materiali chiari e mirati</h1>
          <p className="dmSub">
            Dispense ordinate per argomento, pensate per capire davvero.
          </p>
        </div>
      </section>

      {err && <div className="dmError">⚠️ {err}</div>}

      {loading ? (
        <div className="dmLoading">Caricamento dispense…</div>
      ) : (
        <>
          {/* IN EVIDENZA */}
          {featured.length > 0 && (
            <section className="dmSection">
              <h2 className="dmH2">In evidenza</h2>
              <div className="dmGrid">
                {featured.map((d) => (
                  <Card key={d.id} d={d} />
                ))}
              </div>
            </section>
          )}

          {/* TUTTE */}
          <section className="dmSection">
            <h2 className="dmH2">Tutte le dispense</h2>
            {all.length === 0 ? (
              <div className="dmEmpty">Nessuna dispensa disponibile.</div>
            ) : (
              <div className="dmGrid">
                {all.map((d) => (
                  <Card key={d.id} d={d} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

/* =====================
   CARD
   ===================== */
function Card({ d }) {
  const hasPdf = Boolean(d.file_url || d.link);
  const pdfUrl = d.file_url
    ? d.file_url.startsWith("http")
      ? d.file_url
      : `${API_BASE}${d.file_url}`
    : d.link;

  return (
    <article className="dmCard">
      <div className="dmCardTop">
        <span className="dmBadge">{d.materia || "Dispensa"}</span>
        <span className="dmPages">{d.pagine || 0} pag.</span>
      </div>

      <h3 className="dmCardTitle">{d.titolo}</h3>

      {d.descrizione && <p className="dmDesc">{d.descrizione}</p>}

      <div className="dmCardActions">
        {hasPdf ? (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="dmBtn dmBtnPrimary"
          >
            Apri PDF →
          </a>
        ) : (
          <span className="dmBtn dmBtnGhost">PDF non disponibile</span>
        )}
      </div>
    </article>
  );
}

/* =====================
   CSS
   ===================== */
const css = `
.dmDispPage{
  padding:18px;
  max-width:1100px;
  margin:0 auto;
}

.dmHero{
  border-radius:22px;
  padding:22px;
  background:linear-gradient(135deg, rgba(16,185,129,.12), rgba(37,99,235,.10));
  border:1px solid rgba(15,23,42,.08);
  box-shadow:0 18px 55px rgba(15,23,42,.06);
}

.dmKicker{
  display:inline-block;
  font-weight:900;
  padding:6px 10px;
  border-radius:999px;
  background:white;
  border:1px solid rgba(15,23,42,.12);
}

.dmTitle{
  margin:12px 0 6px;
  font-size:34px;
}

.dmSub{
  margin:0;
  font-weight:750;
  color:rgba(15,23,42,.65);
  max-width:70ch;
}

.dmSection{
  margin-top:26px;
}

.dmH2{
  margin-bottom:12px;
  font-size:20px;
}

.dmGrid{
  display:grid;
  grid-template-columns:repeat(3, minmax(0,1fr));
  gap:14px;
}

@media(max-width:900px){
  .dmGrid{ grid-template-columns:repeat(2,1fr); }
}
@media(max-width:560px){
  .dmGrid{ grid-template-columns:1fr; }
}

.dmCard{
  background:white;
  border-radius:18px;
  padding:14px;
  border:1px solid rgba(15,23,42,.10);
  box-shadow:0 14px 40px rgba(15,23,42,.06);
  display:flex;
  flex-direction:column;
}

.dmCardTop{
  display:flex;
  justify-content:space-between;
  align-items:center;
}

.dmBadge{
  font-size:12px;
  font-weight:900;
  padding:4px 8px;
  border-radius:999px;
  background:rgba(16,185,129,.12);
}

.dmPages{
  font-size:12px;
  font-weight:800;
  color:rgba(15,23,42,.55);
}

.dmCardTitle{
  margin:10px 0 6px;
  font-size:16px;
  font-weight:950;
}

.dmDesc{
  font-size:14px;
  font-weight:700;
  color:rgba(15,23,42,.70);
  line-height:1.35;
}

.dmCardActions{
  margin-top:auto;
  display:flex;
  justify-content:flex-end;
}

.dmBtn{
  padding:10px 12px;
  border-radius:14px;
  font-weight:900;
  text-decoration:none;
}

.dmBtnPrimary{
  background:rgba(15,23,42,.92);
  color:white;
}

.dmBtnGhost{
  border:1px dashed rgba(15,23,42,.20);
  color:rgba(15,23,42,.55);
}

.dmLoading,
.dmEmpty,
.dmError{
  margin-top:20px;
  font-weight:800;
  color:rgba(15,23,42,.65);
}
`;