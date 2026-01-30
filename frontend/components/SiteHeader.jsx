import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");

const DURATIONS = [
  { label: "Senza timer", value: 0 },
  { label: "10 min", value: 10 },
  { label: "15 min", value: 15 },
  { label: "20 min", value: 20 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
];

function fmtDuration(min) {
  const m = Number(min) || 0;
  return m <= 0 ? "Senza timer" : `${m} min`;
}
function summarizeTopics(tags) {
  if (!tags || tags.length === 0) return "Tutti";
  if (tags.length <= 6) return tags.join(" • ");
  return `${tags.slice(0, 6).join(" • ")} • +${tags.length - 6}`;
}

export default function SimulazioniConfig() {
  const nav = useNavigate();
  const loc = useLocation();
  const incoming = loc.state?.preset;

  const [preset, setPreset] = useState(incoming || null);
  const [durationMin, setDurationMin] = useState(incoming?.duration_min ?? 20);

  const [err, setErr] = useState("");
  const [starting, setStarting] = useState(false);

  // guard: se arrivi qui senza stato
  useEffect(() => {
    if (!incoming) nav("/simulazioni", { replace: true });
  }, [incoming, nav]);

  const recap = useMemo(() => {
    if (!preset) return null;
    return {
      title: preset.title,
      duration: fmtDuration(durationMin),
      sections: (preset.sections || []).map((s) => ({
        materia: s.materia,
        scelta: s.scelta,
        completamento: s.completamento,
        topicsText: summarizeTopics(s.tag),
        topicsCount: (s.tag || []).length,
      })),
    };
  }, [preset, durationMin]);

  async function start() {
    if (!preset) return;

    setStarting(true);
    setErr("");

    try {
      // Payload coerente col backend /api/sim/start (come avete impostato)
      const payload = {
        duration_min: Number(durationMin) || 0,
        sections: (preset.sections || []).map((s) => ({
          materia: s.materia,
          scelta: Number(s.scelta) || 0,
          completamento: Number(s.completamento) || 0,
          tag: Array.isArray(s.tag) ? s.tag : [],
          difficolta: s.difficolta || "Base",
        })),
      };

      const res = await fetch(`${API_BASE}/api/sim/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Errore backend (${res.status})`);
      }

      const data = await res.json();

      // IMPORTANTISSIMO: forza la durata scelta anche se il backend restituisse altro
      const session = {
        ...data,
        duration_min: Number(durationMin) || 0,
      };

      nav("/simulazioni/run", { state: { session } });
    } catch (e) {
      setErr(e.message || "Errore avvio prova");
    } finally {
      setStarting(false);
    }
  }

  return (
    <main className="dmCfgPage">
      <style>{css}</style>

      <section className="dmCfgCard">
        <div className="dmTop">
          <div>
            <div className="dmKicker">DinoMed • Personalizza</div>
            <h1 className="dmTitle">{recap?.title || "Simulazione"}</h1>
            <div className="dmSub">
              Controlla argomenti e durata. Quando sei pronto, avvia.
            </div>
          </div>

          <div className="dmRight">
            <div className="dmLabel">Durata</div>
            <select
              className="dmSelect"
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
            >
              {DURATIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>

            <button className="dmBtn dmBtnPrimary" onClick={start} disabled={starting} type="button">
              {starting ? "Avvio..." : "Avvia prova →"}
            </button>

            <button className="dmBtn dmBtnGhost" onClick={() => nav("/simulazioni")} type="button">
              Indietro
            </button>
          </div>
        </div>

        {err ? <div className="dmAlert">⚠️ {err}</div> : null}

        {/* ✅ Recap argomenti selezionati (qui li vuoi vedere quando clicchi continua) */}
        <div className="dmRecap">
          <div className="dmRecapTitle">Recap</div>
          <div className="dmPills">
            <span className="dmPill">
              <b>Durata:</b> {fmtDuration(durationMin)}
            </span>
            <span className="dmPill dmPillSoft">
              <b>Materie:</b> {(recap?.sections || []).map((s) => s.materia).join(" • ")}
            </span>
          </div>

          <div className="dmGrid">
            {(recap?.sections || []).map((s) => (
              <div key={s.materia} className="dmBox">
                <div className="dmMateria">{s.materia}</div>
                <div className="dmMeta">
                  {s.scelta} crocette • {s.completamento} completamento
                </div>
                <div className="dmTopics">
                  <span className="dmTopicsLbl">Argomenti:</span> {s.topicsText}
                </div>
              </div>
            ))}
          </div>

          <div className="dmNote">
            Se “Argomenti: Tutti” significa che non hai filtrato (quindi pesca da tutto).
          </div>
        </div>
      </section>
    </main>
  );
}

const css = `
.dmCfgPage{ padding:18px; max-width:1100px; margin:0 auto; }
.dmCfgCard{
  border-radius:22px;
  border:1px solid rgba(15,23,42,0.10);
  background:rgba(255,255,255,0.92);
  box-shadow:0 18px 55px rgba(15,23,42,0.06);
  padding:16px;
}
.dmTop{
  display:flex;
  justify-content:space-between;
  gap:12px;
  flex-wrap:wrap;
  align-items:flex-end;
}
.dmKicker{
  display:inline-flex; font-weight:950;
  padding:6px 10px; border-radius:999px;
  background:rgba(16,185,129,0.08);
  border:1px solid rgba(16,185,129,0.18);
}
.dmTitle{ margin:10px 0 6px; font-size:30px; line-height:1.06; }
.dmSub{ color:rgba(15,23,42,0.65); font-weight:800; max-width:70ch; }

.dmRight{ display:grid; gap:8px; min-width: 260px; }
.dmLabel{ font-weight:950; }
.dmSelect{
  width:100%;
  padding:12px;
  border-radius:14px;
  border:1px solid rgba(15,23,42,0.14);
  background:white;
  font-weight:900;
  outline:none;
}
.dmBtn{
  padding:12px 14px; border-radius:14px;
  font-weight:950; border:none; cursor:pointer;
}
.dmBtnPrimary{
  background:rgba(15,23,42,0.92);
  color:white;
  box-shadow:0 12px 30px rgba(15,23,42,0.12);
  transition: transform .18s ease, box-shadow .18s ease;
}
.dmBtnPrimary:hover{ transform: translateY(-1px); box-shadow:0 18px 45px rgba(15,23,42,0.18); }
.dmBtnGhost{
  background:white;
  border:1px solid rgba(15,23,42,0.14);
}

.dmAlert{
  margin-top:12px;
  padding:12px;
  border-radius:16px;
  border:1px solid rgba(239,68,68,0.35);
  background:rgba(239,68,68,0.08);
  font-weight:800;
  white-space:pre-wrap;
}

.dmRecap{
  margin-top:14px;
  border-radius:20px;
  border:1px solid rgba(15,23,42,0.10);
  background:rgba(255,255,255,0.92);
  box-shadow:0 14px 40px rgba(15,23,42,0.05);
  padding:14px;
}
.dmRecapTitle{ font-weight:1000; font-size:16px; }
.dmPills{ margin-top:8px; display:flex; gap:8px; flex-wrap:wrap; }
.dmPill{
  display:inline-flex; gap:6px; align-items:center;
  padding:6px 10px; border-radius:999px;
  border:1px solid rgba(15,23,42,0.12);
  background: rgba(15,23,42,0.03);
  font-weight:900; color: rgba(15,23,42,0.82);
}
.dmPillSoft{ color: rgba(15,23,42,0.62); }

.dmGrid{
  margin-top:10px;
  display:grid;
  grid-template-columns: repeat(3, minmax(0,1fr));
  gap:10px;
}
@media(max-width:900px){ .dmGrid{ grid-template-columns: 1fr; } }
.dmBox{
  border-radius:18px;
  border:1px solid rgba(15,23,42,0.10);
  background:white;
  padding:12px;
}
.dmMateria{ font-weight:1000; }
.dmMeta{ margin-top:4px; color:rgba(15,23,42,0.62); font-weight:850; }
.dmTopics{ margin-top:8px; color:rgba(15,23,42,0.76); font-weight:800; line-height:1.35; }
.dmTopicsLbl{ font-weight:1000; }
.dmNote{ margin-top:10px; color:rgba(15,23,42,0.60); font-weight:800; }
`;

