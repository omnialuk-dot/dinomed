import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getUserToken } from "../lib/userSession";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}
function letter(i){ return String.fromCharCode(65 + i); }

export default function ProfiloProva() {
  const nav = useNavigate();
  const { id } = useParams();
  const q = useQuery();
  const mode = (q.get("mode") || "errors").toLowerCase(); // errors|all
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const tok = getUserToken();
        const res = await fetch(`${API_BASE}/api/user/runs/${encodeURIComponent(id)}`, {
          headers: {
            Accept: "application/json",
            ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
          },
        });
        if (!res.ok) throw new Error("fetch_failed");
        const data = await res.json();
        if (!alive) return;
        setRun(data);
      } catch {
        if (!alive) return;
        setRun(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const items = useMemo(() => {
    const det = run?.details || [];
    if (mode === "all") return det;
    return det.filter((d) => d.ok === false);
  }, [run, mode]);

  return (
    <main className="rv">
      <style>{css}</style>

      <div className="rv-top">
        <div>
          <div className="rv-kicker">DinoMed • Revisione</div>
          <h1 className="rv-title">{loading ? "Caricamento…" : (run?.title || "Prova")}</h1>
          <div className="rv-sub">
            {run ? (
              <>
                Totale: <b>{run.score_total}/{run.score_max}</b> • Modalità: <b>{mode === "all" ? "tutte" : "errori"}</b>
              </>
            ) : "—"}
          </div>
        </div>

        <div className="rv-actions">
          <button className="rv-btn" onClick={() => nav("/profilo")}>Torna al profilo</button>
          <button className={"rv-btn " + (mode === "errors" ? "isOn" : "")} onClick={() => nav(`/profilo/prove/${id}?mode=errors`)}>
            Solo errori
          </button>
          <button className={"rv-btn " + (mode === "all" ? "isOn" : "")} onClick={() => nav(`/profilo/prove/${id}?mode=all`)}>
            Tutte
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rv-card">Caricamento…</div>
      ) : !run ? (
        <div className="rv-card">Prova non trovata.</div>
      ) : items.length === 0 ? (
        <div className="rv-card">
          {mode === "errors" ? "Perfetto: nessun errore in questa prova." : "Nessuna domanda salvata."}
        </div>
      ) : (
        <div className="rv-list">
          {items.map((d, idx) => (
            <article className="rv-q" key={(d.id || "q") + "_" + idx}>
              <div className="rv-qTop">
                <div className="rv-badges">
                  <span className="rv-pill">{d.materia || "Materia"}</span>
                  <span className={"rv-pill " + (d.ok ? "ok" : "bad")}>
                    {d.ok ? "Corretta" : "Errata"}
                  </span>
                </div>
                <div className="rv-qId">#{idx + 1}</div>
              </div>

              <div className="rv-text">{d.testo}</div>

              {d.tipo === "scelta" ? (
                <div className="rv-opts">
                  {(d.opzioni || []).map((op, i) => {
                    const isCorrect = Number(d.correct) === i;
                    const userIndex = typeof d.your_answer === "number" ? d.your_answer : null;
                    const isUser = userIndex === i;
                    return (
                      <div
                        key={i}
                        className={
                          "rv-opt" +
                          (isCorrect ? " isCorrect" : "") +
                          (isUser ? " isUser" : "")
                        }
                      >
                        <div className="rv-optKey">{letter(i)}</div>
                        <div className="rv-optText">{op}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rv-comp">
                  <div className="rv-compRow">
                    <div className="rv-compK">La tua risposta</div>
                    <div className="rv-compV">{String(d.your_answer || "—")}</div>
                  </div>
                  <div className="rv-compRow">
                    <div className="rv-compK">Risposta corretta</div>
                    <div className="rv-compV">{String(d.correct || "—")}</div>
                  </div>
                </div>
              )}

              {d.spiegazione ? (
                <div className="rv-exp">
                  <div className="rv-expK">Spiegazione</div>
                  <div className="rv-expV">{d.spiegazione}</div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}

      {run ? (
        <div className="rv-bottom">
          <div className="rv-bottomLeft">
            <button className="rv-btn" onClick={() => nav("/simulazioni/config")}>Nuova prova</button>
            <button className="rv-btn" onClick={() => nav("/profilo")}>Torna al profilo</button>
          </div>
          <div className="rv-bottomRight">
            {mode === "errors" ? (
              <button className="rv-btn isOn" onClick={() => nav(`/profilo/prove/${id}?mode=errors`)}>Solo errori</button>
            ) : (
              <button className="rv-btn" onClick={() => nav(`/profilo/prove/${id}?mode=errors`)}>Rivedi solo gli errori</button>
            )}
            {mode === "all" ? (
              <button className="rv-btn isOn" onClick={() => nav(`/profilo/prove/${id}?mode=all`)}>Tutte</button>
            ) : (
              <button className="rv-btn" onClick={() => nav(`/profilo/prove/${id}?mode=all`)}>Rivedi tutta la prova</button>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}

const css = `
.rv{
  padding: 26px 16px 56px;
  max-width: 1100px;
  margin: 0 auto;
}
.rv-top{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap: 14px;
  margin-bottom: 14px;
}
.rv-kicker{
  font-weight: 900;
  color: rgba(2,6,23,0.70);
}
.rv-title{
  margin: 8px 0 4px;
  font-size: 30px;
  letter-spacing:-0.6px;
  color: rgba(2,6,23,0.88);
}
.rv-sub{
  color: rgba(2,6,23,0.62);
  font-weight: 750;
}
.rv-actions{
  display:flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content:flex-end;
}
.rv-btn{
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.70);
  border-radius: 14px;
  padding: 10px 12px;
  font-weight: 900;
  color: rgba(2,6,23,0.78);
  cursor: pointer;
}
.rv-btn.isOn{
  background: rgba(14,165,233,0.12);
  border-color: rgba(14,165,233,0.22);
}
.rv-bottom{
  margin-top: 14px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap: 10px;
  flex-wrap: wrap;
}
.rv-bottomLeft, .rv-bottomRight{ display:flex; gap: 8px; flex-wrap: wrap; }

.rv-card{
  background: rgba(255,255,255,0.72);
  border: 1px solid rgba(15,23,42,0.10);
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 18px 50px rgba(2,6,23,0.10);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  font-weight: 800;
  color: rgba(2,6,23,0.70);
}
.rv-list{
  display:grid;
  gap: 12px;
}
.rv-q{
  background: rgba(255,255,255,0.72);
  border: 1px solid rgba(15,23,42,0.10);
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 12px 36px rgba(2,6,23,0.08);
}
.rv-qTop{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap: 10px;
  margin-bottom: 10px;
}
.rv-badges{ display:flex; gap: 8px; flex-wrap: wrap; }
.rv-pill{
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.62);
  font-weight: 900;
  font-size: 12px;
  color: rgba(2,6,23,0.70);
}
.rv-pill.ok{ background: rgba(34,197,94,0.12); border-color: rgba(34,197,94,0.22); }
.rv-pill.bad{ background: rgba(220,38,38,0.10); border-color: rgba(220,38,38,0.20); color: rgba(185,28,28,0.95); }
.rv-qId{ color: rgba(2,6,23,0.55); font-weight: 900; }
.rv-text{ font-weight: 850; color: rgba(2,6,23,0.86); line-height: 1.35; }

.rv-opts{ display:grid; gap: 8px; margin-top: 12px; }
.rv-opt{
  display:flex;
  gap: 10px;
  align-items:flex-start;
  border: 1px solid rgba(15,23,42,0.08);
  background: rgba(255,255,255,0.60);
  border-radius: 16px;
  padding: 10px 12px;
}
.rv-optKey{
  width: 26px; height: 26px;
  border-radius: 10px;
  display:grid; place-items:center;
  font-weight: 950;
  background: rgba(2,6,23,0.06);
  color: rgba(2,6,23,0.75);
  flex: 0 0 auto;
}
.rv-opt.isCorrect{ border-color: rgba(34,197,94,0.22); background: rgba(34,197,94,0.08); }
.rv-opt.isUser{ box-shadow: 0 0 0 4px rgba(56,189,248,0.10); }
.rv-optText{ font-weight: 800; color: rgba(2,6,23,0.78); }

.rv-comp{
  margin-top: 12px;
  border: 1px solid rgba(15,23,42,0.08);
  border-radius: 16px;
  background: rgba(255,255,255,0.60);
  padding: 10px 12px;
}
.rv-compRow{
  display:flex;
  justify-content:space-between;
  gap: 10px;
  padding: 8px 0;
  border-top: 1px solid rgba(15,23,42,0.08);
}
.rv-compRow:first-child{ border-top: 0; padding-top: 0; }
.rv-compK{ font-weight: 850; color: rgba(2,6,23,0.55); }
.rv-compV{ font-weight: 950; color: rgba(2,6,23,0.82); text-align:right; }

.rv-exp{
  margin-top: 12px;
  border: 1px solid rgba(15,23,42,0.10);
  border-radius: 16px;
  background: rgba(255,255,255,0.62);
  padding: 12px;
}
.rv-expK{ font-weight: 950; color: rgba(2,6,23,0.70); margin-bottom: 6px; }
.rv-expV{ font-weight: 800; color: rgba(2,6,23,0.74); line-height: 1.35; }

@media (max-width: 860px){
  .rv-top{ flex-direction: column; }
  .rv-actions{ justify-content:flex-start; }
}
`;
