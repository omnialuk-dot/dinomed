import { Link, useNavigate } from "react-router-dom";
import { clearUserSession, getUser, getUserToken } from "../lib/userSession";
import { useEffect, useMemo, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");

function fmtDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso || "";
  }
}
function sumSubjects(per) {
  const out = { total: 0, max: 0 };
  if (!per || typeof per !== "object") return out;
  for (const k of Object.keys(per)) {
    const v = per[k] || {};
    out.total += Number(v.vote ?? v.score ?? 0);
    out.max += Number(v.max_vote ?? 30);
  }
  return out;
}

export default function Profilo() {
  const nav = useNavigate();
  const user = useMemo(() => getUser(), []);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    clearUserSession();
    nav("/login", { replace: true });
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const tok = getUserToken();
        const res = await fetch(`${API_BASE}/api/user/runs`, {
          headers: {
            Accept: "application/json",
            ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
          },
        });
        if (!res.ok) throw new Error("runs_failed");
        const data = await res.json();
        if (!alive) return;
        setRuns(Array.isArray(data?.items) ? data.items : []);
      } catch {
        if (!alive) return;
        setRuns([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = runs.length;
    let sum = 0;
    let max = 0;
    let best = null;

    for (const r of runs) {
      const t = Number(r?.score_total ?? 0);
      const m = Number(r?.score_max ?? 0);
      if (m > 0) sum += t / m;
      if (!best || (t / (m || 1)) > (Number(best.score_total) / (Number(best.score_max) || 1))) best = r;
      max = Math.max(max, t);
    }

    const avgPct = total ? Math.round((sum / total) * 1000) / 10 : 0;

    return { total, avgPct, best };
  }, [runs]);

  return (
    <main className="pr">
      <style>{css}</style>

      <section className="pr-hero">
        <div className="pr-kicker">
          <span className="pr-dot" aria-hidden="true" />
          <span className="pr-brand">DinoMed</span>
          <span className="pr-sep">•</span>
          <span className="pr-kickerText">Profilo</span>
        </div>

        <h1 className="pr-title">
          Benvenuto, <span className="pr-grad">{user?.email || "utente"}</span>
        </h1>

        <p className="pr-sub">
          Storico prove, medie e revisione completa. Admin resta libero (sezione separata).
        </p>

        <div className="pr-grid">
          <div className="pr-card">
            <div className="pr-cardTitle">Account</div>
            <div className="pr-row">
              <div className="pr-label">Email</div>
              <div className="pr-value">{user?.email || "—"}</div>
            </div>

            <div className="pr-actions">
              <Link to="/simulazioni/config" className="pr-btn pr-primary">Nuova prova</Link>
              <button type="button" onClick={logout} className="pr-btn pr-danger">Esci</button>
              <Link to="/" className="pr-btn">Home</Link>
            </div>
          </div>

          <div className="pr-card">
            <div className="pr-cardTitle">Statistiche</div>
            <div className="pr-statGrid">
              <div className="pr-stat">
                <div className="pr-statK">Prove</div>
                <div className="pr-statV">{stats.total}</div>
              </div>
              <div className="pr-stat">
                <div className="pr-statK">Media</div>
                <div className="pr-statV">{stats.avgPct}%</div>
              </div>
              <div className="pr-stat">
                <div className="pr-statK">Migliore</div>
                <div className="pr-statV">
                  {stats.best ? `${stats.best.score_total}/${stats.best.score_max}` : "—"}
                </div>
              </div>
            </div>

            <div className="pr-miniNote">
              La media è calcolata sulle prove salvate (percentuale su voto massimo).
            </div>
          </div>
        </div>

        <div className="pr-block">
          <div className="pr-blockHead">
            <h2 className="pr-h2">Storico prove</h2>
            <Link to="/simulazioni/config" className="pr-link">Avvia una nuova prova</Link>
          </div>

          {loading ? (
            <div className="pr-empty">Caricamento…</div>
          ) : runs.length === 0 ? (
            <div className="pr-empty">
              Ancora nessuna prova salvata. Fai una simulazione e termina la prova per vederla qui.
            </div>
          ) : (
            <div className="pr-list">
              {runs.map((r) => {
                const per = r?.per_subject || {};
                const sums = sumSubjects(per);
                return (
                  <article className="pr-item" key={r.id}>
                    <div className="pr-itemTop">
                      <div>
                        <div className="pr-itemTitle">{r.title || "Simulazione"}</div>
                        <div className="pr-itemMeta">
                          {fmtDate(r.created_at)} • Totale: <b>{r.score_total}/{r.score_max}</b>
                        </div>
                        <div className="pr-itemSub">
                          {Object.keys(per).length
                            ? Object.keys(per).map((m) => `${m}: ${per[m].vote}/${per[m].max_vote}`).join("  •  ")
                            : (sums.max ? `Totale per materie: ${sums.total}/${sums.max}` : "")}
                        </div>
                      </div>

                      <div className="pr-itemBtns">
                        <button className="pr-btn pr-secondary" onClick={() => nav(`/profilo/prove/${r.id}?mode=errors`)}>
                          Rivedi errori
                        </button>
                        <button className="pr-btn" onClick={() => nav(`/profilo/prove/${r.id}?mode=all`)}>
                          Rivedi tutto
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

const css = `
.pr{
  padding: 28px 16px 56px;
  max-width: 1100px;
  margin: 0 auto;
}

.pr-hero{
  background: rgba(255,255,255,0.72);
  border: 1px solid rgba(15,23,42,0.10);
  border-radius: 22px;
  padding: 22px 22px 24px;
  box-shadow: 0 18px 50px rgba(2,6,23,0.10);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.pr-kicker{
  display:flex;
  align-items:center;
  gap:10px;
  font-weight:800;
  color: rgba(2,6,23,0.70);
}

.pr-dot{ width:10px;height:10px;border-radius:999px;
  background: linear-gradient(135deg, rgba(34,197,94,0.95), rgba(56,189,248,0.95));
  box-shadow: 0 0 0 4px rgba(34,197,94,0.10);
}
.pr-brand{ letter-spacing:-0.3px; }
.pr-sep{ opacity:0.5; }
.pr-kickerText{ opacity:0.7; }

.pr-title{
  margin: 14px 0 6px;
  font-size: 34px;
  line-height: 1.15;
  letter-spacing: -0.8px;
  color: rgba(2,6,23,0.88);
}
.pr-grad{
  background: linear-gradient(135deg, rgba(34,197,94,0.95), rgba(56,189,248,0.95));
  -webkit-background-clip:text;
  background-clip:text;
  color: transparent;
}

.pr-sub{
  margin: 0 0 16px;
  color: rgba(2,6,23,0.68);
  font-weight: 650;
}

.pr-grid{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.pr-card{
  background: rgba(255,255,255,0.78);
  border: 1px solid rgba(15,23,42,0.10);
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 12px 36px rgba(2,6,23,0.08);
}

.pr-cardTitle{
  font-weight: 900;
  color: rgba(2,6,23,0.78);
  margin-bottom: 10px;
}

.pr-row{
  display:flex;
  justify-content:space-between;
  gap: 10px;
  padding: 10px 0;
  border-top: 1px solid rgba(15,23,42,0.08);
}
.pr-row:first-of-type{ border-top: 0; padding-top: 0; }
.pr-label{ color: rgba(2,6,23,0.55); font-weight: 750; }
.pr-value{ color: rgba(2,6,23,0.82); font-weight: 850; word-break: break-word; text-align:right; }

.pr-actions{
  display:flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.pr-btn{
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.70);
  border-radius: 14px;
  padding: 10px 12px;
  font-weight: 850;
  color: rgba(2,6,23,0.78);
  cursor: pointer;
  text-decoration:none;
  display:inline-flex;
  align-items:center;
  gap: 8px;
  transition: transform .12s ease, box-shadow .12s ease;
}
.pr-btn:hover{ transform: translateY(-1px); box-shadow: 0 10px 26px rgba(2,6,23,0.10); }
.pr-primary{
  background: linear-gradient(135deg, rgba(34,197,94,0.90), rgba(56,189,248,0.90));
  color: rgba(2,6,23,0.92);
  border-color: rgba(0,0,0,0);
}
.pr-danger{
  background: rgba(220,38,38,0.12);
  border-color: rgba(220,38,38,0.24);
  color: rgba(185,28,28,0.95);
}
.pr-secondary{
  background: rgba(14,165,233,0.12);
  border-color: rgba(14,165,233,0.22);
}

.pr-statGrid{
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.pr-stat{
  border: 1px solid rgba(15,23,42,0.08);
  background: rgba(255,255,255,0.60);
  border-radius: 16px;
  padding: 12px;
}
.pr-statK{ color: rgba(2,6,23,0.55); font-weight: 800; font-size: 13px; }
.pr-statV{ color: rgba(2,6,23,0.88); font-weight: 950; font-size: 22px; margin-top: 6px; }

.pr-miniNote{
  margin-top: 10px;
  color: rgba(2,6,23,0.55);
  font-weight: 700;
  font-size: 13px;
}

.pr-block{
  margin-top: 14px;
  background: rgba(255,255,255,0.78);
  border: 1px solid rgba(15,23,42,0.10);
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 12px 36px rgba(2,6,23,0.08);
}
.pr-blockHead{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap: 10px;
  margin-bottom: 10px;
}
.pr-h2{ margin:0; color: rgba(2,6,23,0.86); letter-spacing:-0.4px; }
.pr-link{
  text-decoration:none;
  font-weight: 900;
  color: rgba(2,6,23,0.70);
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.62);
}
.pr-empty{ color: rgba(2,6,23,0.62); font-weight: 750; padding: 10px 0; }

.pr-list{ display:grid; gap: 10px; }
.pr-item{
  border: 1px solid rgba(15,23,42,0.08);
  background: rgba(255,255,255,0.62);
  border-radius: 16px;
  padding: 14px;
}
.pr-itemTop{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap: 12px;
}
.pr-itemTitle{ font-weight: 950; color: rgba(2,6,23,0.86); }
.pr-itemMeta{ margin-top: 4px; color: rgba(2,6,23,0.60); font-weight: 750; font-size: 13px; }
.pr-itemSub{ margin-top: 6px; color: rgba(2,6,23,0.72); font-weight: 800; font-size: 13px; }
.pr-itemBtns{ display:flex; gap: 8px; flex-wrap: wrap; justify-content:flex-end; }

@media (max-width: 920px){
  .pr-grid{ grid-template-columns: 1fr; }
  .pr-itemTop{ flex-direction: column; align-items: stretch; }
  .pr-itemBtns{ justify-content:flex-start; }
}
@media (max-width: 520px){
  .pr-statGrid{ grid-template-columns: 1fr; }
}
`;
