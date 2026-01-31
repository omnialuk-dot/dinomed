import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function SimulazioniRisultato() {
  const nav = useNavigate();
  const location = useLocation();

  const sessionIdFromState = location?.state?.sessionId || "";
  const resultFromState = location?.state?.result || null;
  const metaFromState = location?.state?.meta || null;

  const [loaded, setLoaded] = useState({ result: resultFromState, meta: metaFromState, sessionId: sessionIdFromState });

  // fallback: se l'utente ricarica la pagina risultato, prova a leggere da localStorage
  useEffect(() => {
    const sid = sessionIdFromState;
    if (resultFromState) return;

    // prova a recuperare sessionId dalla query (?s=) se lo aggiungerai in futuro
    const sp = new URLSearchParams(window.location.search);
    const qid = sp.get("s") || sp.get("session") || sp.get("id") || sid;

    if (!qid) return;

    try {
      const raw = localStorage.getItem(`dinomed_sim_${qid}_result`);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.data) {
        setLoaded({ result: parsed.data, meta: null, sessionId: qid });
      }
    } catch {}
  }, [sessionIdFromState, resultFromState]);

  const r = loaded.result;

  const summary = useMemo(() => {
    // Supporta varie shape:
    // - {correct, wrong, blank, score, vote30, total, scoring}
    // - o backend custom: prova a trovare campi simili
    if (!r) return null;

    const correct = r.correct ?? r.corretti ?? r.n_correct ?? 0;
    const wrong = r.wrong ?? r.errati ?? r.n_wrong ?? 0;
    const blank = r.blank ?? r.omesse ?? r.n_blank ?? 0;

    const total =
      r.total ??
      r.n_total ??
      (Number.isFinite(correct + wrong + blank) ? correct + wrong + blank : null);

    const score = r.score ?? r.punteggio ?? null;
    const vote30 = r.vote30 ?? r.voto30 ?? null;

    // se il backend non manda score ma manda correct/wrong/blank, calcolo MUR
    const computedScore =
      score ?? Math.round((correct * 1 + wrong * -0.1) * 1000) / 1000;

    // voto in /30 (scala semplice)
    const computed30 =
      vote30 ??
      (total ? Math.round(((computedScore * 30) / total) * 100) / 100 : null);

    return { correct, wrong, blank, total, score: computedScore, vote30: computed30 };
  }, [r]);

  if (!r || !summary) {
    return (
      <main className="sr2">
        <style>{css}</style>
        <div className="sr2-shell">
          <div className="sr2-card">
            <div className="sr2-title">Risultato non disponibile</div>
            <div className="sr2-sub">
              Non ho trovato i dati del risultato (forse hai ricaricato la pagina o manca l’endpoint di consegna).
            </div>
            <div className="sr2-row">
              <button className="sr2-btn sr2-primary" onClick={() => nav("/simulazioni/config")}>
                Torna alla configurazione →
              </button>
              <button className="sr2-btn" onClick={() => nav("/simulazioni/run", { state: { sessionId: loaded.sessionId } })}>
                Torna alla prova
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const pass = summary.vote30 !== null ? summary.vote30 >= 18 : null;

  return (
    <main className="sr2">
      <style>{css}</style>

      <div className="sr2-shell">
        <header className="sr2-top">
          <div className="sr2-brand">
            <span className="sr2-dot" />
            <span className="sr2-b1">Dino</span>
            <span className="sr2-b2">Med</span>
            <span className="sr2-sep">•</span>
            <span className="sr2-tag">Risultato</span>
          </div>

          <div className="sr2-actions">
            <button className="sr2-btn" onClick={() => nav("/simulazioni/config")}>
              Nuova prova
            </button>
            <button className="sr2-btn sr2-primary" onClick={() => nav("/simulazioni/run", { state: { sessionId: loaded.sessionId } })}>
              Rifai la stessa prova →
            </button>
          </div>
        </header>

        <section className="sr2-grid">
          <div className="sr2-card sr2-main">
            <div className="sr2-hero">
              <div className="sr2-big">
                {summary.vote30 !== null ? (
                  <>
                    <div className="sr2-bigNum">{summary.vote30}</div>
                    <div className="sr2-bigLab">/ 30</div>
                  </>
                ) : (
                  <>
                    <div className="sr2-bigNum">{summary.score}</div>
                    <div className="sr2-bigLab">punti</div>
                  </>
                )}
              </div>

              {pass !== null && (
                <div className={`sr2-pill ${pass ? "ok" : "no"}`}>
                  {pass ? "✅ Superato (≥ 18/30)" : "❌ Non superato (< 18/30)"}
                </div>
              )}

              <div className="sr2-note">
                Scoring MUR: corretta +1 • errata −0,1 • omessa 0
              </div>
            </div>

            <div className="sr2-stats">
              <div className="sr2-stat">
                <div className="sr2-statLab">Corrette</div>
                <div className="sr2-statVal">{summary.correct}</div>
              </div>
              <div className="sr2-stat">
                <div className="sr2-statLab">Errate</div>
                <div className="sr2-statVal">{summary.wrong}</div>
              </div>
              <div className="sr2-stat">
                <div className="sr2-statLab">Omesse</div>
                <div className="sr2-statVal">{summary.blank}</div>
              </div>
              <div className="sr2-stat">
                <div className="sr2-statLab">Totale</div>
                <div className="sr2-statVal">{summary.total ?? "—"}</div>
              </div>
            </div>

            <div className="sr2-scoreLine">
              <span>Punteggio</span>
              <b>{summary.score}</b>
            </div>

            {summary.vote30 !== null && (
              <div className="sr2-scoreLine">
                <span>Voto (scala /30)</span>
                <b>{summary.vote30}</b>
              </div>
            )}
          </div>

          <aside className="sr2-card sr2-side">
            <div className="sr2-sideTitle">Cosa fare adesso</div>
            <div className="sr2-sideTxt">
              • Se sei sotto 18: rifai la prova “senza rischiare”, salta le domande dubbie (0 è meglio di −0,1).<br />
              • Se sei sopra 18: aumenta velocità e precisione, soprattutto sulle crocette.
            </div>

            <div className="sr2-row" style={{ marginTop: 12 }}>
              <button className="sr2-btn" onClick={() => nav("/simulazioni/config")}>
                Nuova prova
              </button>
              <button
                className="sr2-btn sr2-primary"
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(
                      `Risultato DinoMed\nCorrette: ${summary.correct}\nErrate: ${summary.wrong}\nOmesse: ${summary.blank}\nPunteggio: ${summary.score}\nVoto/30: ${summary.vote30 ?? "—"}`
                    );
                  } catch {}
                }}
              >
                Copia risultato
              </button>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

const css = `
:root{
  --dino:#22c55e; --dino2:#16a34a;
  --med:#38bdf8;  --med2:#0ea5e9;
  --ink: rgba(15,23,42,0.92);
  --bd: rgba(15,23,42,0.10);
  --shadow: 0 18px 60px rgba(2,6,23,0.10);
}
.sr2{ max-width: 1100px; margin: 0 auto; padding: 18px; }
.sr2-shell{ display:grid; gap: 14px; }

.sr2-top{
  display:flex; align-items:center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
  padding: 14px;
  border-radius: 24px;
  border: 1px solid var(--bd);
  background:
    radial-gradient(900px 320px at 12% -25%, rgba(34,197,94,0.16), transparent 60%),
    radial-gradient(900px 320px at 78% -30%, rgba(56,189,248,0.16), transparent 55%),
    rgba(255,255,255,0.90);
  box-shadow: var(--shadow);
}
.sr2-brand{
  display:inline-flex; align-items:center; gap: 8px;
  padding: 10px 12px; border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.74);
  font-weight: 1000; color: rgba(15,23,42,0.82);
}
.sr2-dot{ width: 10px; height: 10px; border-radius: 999px; background: linear-gradient(90deg, var(--dino2), var(--med2)); }
.sr2-b1{ color: var(--dino2); } .sr2-b2{ color: var(--med2); }
.sr2-sep{ opacity:.55; } .sr2-tag{ font-weight: 950; }

.sr2-actions{ display:flex; gap: 10px; flex-wrap: wrap; }
.sr2-btn{
  position: relative; overflow:hidden;
  display:inline-flex; align-items:center; justify-content:center; gap: 10px;
  padding: 12px 14px; border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.78);
  box-shadow: 0 14px 30px rgba(2,6,23,0.10);
  font-weight: 1000; color: rgba(15,23,42,0.86);
  cursor:pointer;
}
.sr2-primary{
  color:white;
  border: 1px solid rgba(255,255,255,0.18);
  background: linear-gradient(90deg, var(--dino2), var(--med2));
}

.sr2-grid{ display:grid; grid-template-columns: 1.2fr .8fr; gap: 14px; }
@media(max-width: 980px){ .sr2-grid{ grid-template-columns: 1fr; } }

.sr2-card{
  border-radius: 24px;
  border: 1px solid var(--bd);
  background:
    radial-gradient(520px 220px at 30% -10%, rgba(34,197,94,0.10), transparent 60%),
    radial-gradient(520px 220px at 80% -10%, rgba(56,189,248,0.10), transparent 60%),
    rgba(255,255,255,0.92);
  box-shadow: 0 14px 52px rgba(2,6,23,0.08);
  padding: 18px;
}

.sr2-hero{ display:grid; gap: 10px; }
.sr2-big{ display:flex; align-items:baseline; gap: 10px; }
.sr2-bigNum{ font-size: 56px; font-weight: 1100; color: rgba(15,23,42,0.92); letter-spacing: -0.03em; }
.sr2-bigLab{ font-weight: 1000; color: rgba(15,23,42,0.65); }
.sr2-pill{
  display:inline-flex; width: fit-content;
  padding: 10px 12px; border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.82);
  font-weight: 1000;
}
.sr2-pill.ok{ border-color: rgba(34,197,94,0.35); background: rgba(34,197,94,0.10); }
.sr2-pill.no{ border-color: rgba(185,28,28,0.22); background: rgba(185,28,28,0.06); }

.sr2-note{ font-weight: 900; color: rgba(15,23,42,0.70); }

.sr2-stats{
  margin-top: 12px;
  display:grid; grid-template-columns: repeat(4, minmax(0,1fr));
  gap: 10px;
}
@media(max-width: 520px){ .sr2-stats{ grid-template-columns: repeat(2, minmax(0,1fr)); } }
.sr2-stat{
  padding: 12px; border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.82);
}
.sr2-statLab{ font-weight: 900; color: rgba(15,23,42,0.70); }
.sr2-statVal{ margin-top: 6px; font-weight: 1100; color: rgba(15,23,42,0.90); font-size: 20px; }

.sr2-scoreLine{
  margin-top: 12px;
  display:flex; justify-content: space-between; gap: 12px;
  padding: 12px; border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.82);
  font-weight: 950; color: rgba(15,23,42,0.82);
}

.sr2-sideTitle{ font-weight: 1100; color: rgba(15,23,42,0.92); }
.sr2-sideTxt{ margin-top: 8px; font-weight: 900; color: rgba(15,23,42,0.72); line-height: 1.45; }
.sr2-row{ display:flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
.sr2-title{ font-weight: 1100; color: rgba(15,23,42,0.92); font-size: 20px; }
.sr2-sub{ margin-top: 8px; font-weight: 900; color: rgba(15,23,42,0.72); line-height: 1.45; }
`;