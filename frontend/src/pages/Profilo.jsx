import { Link, useNavigate } from "react-router-dom";
import { clearUserSession, getUser } from "../lib/userSession";
import { useMemo } from "react";

export default function Profilo() {
  const nav = useNavigate();
  const user = useMemo(() => getUser(), []);

  const logout = () => {
    clearUserSession();
    nav("/login", { replace: true });
  };

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
          Qui trovi account e scorciatoie rapide. A breve aggiungiamo storico prove, media e revisione completa.
        </p>

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
  color: rgba(2,6,23,0.70);
  font-weight: 900;
  letter-spacing: -0.01em;
}
.pr-dot{
  width:10px;height:10px;border-radius:999px;
  background: linear-gradient(135deg, rgba(34,197,94,.90), rgba(56,189,248,.90));
  box-shadow: 0 10px 20px rgba(2,6,23,0.10);
}
.pr-brand{ white-space:nowrap; font-weight: 950; }
.pr-sep{ opacity:.45; }

.pr-title{
  margin: 14px 0 6px;
  font-size: clamp(28px, 4.2vw, 40px);
  letter-spacing: -0.03em;
  line-height: 1.06;
}
.pr-grad{
  background: linear-gradient(135deg, rgba(34,197,94,1), rgba(56,189,248,1));
  -webkit-background-clip: text;
  background-clip:text;
  color: transparent;
}

.pr-sub{
  margin: 0 0 16px;
  max-width: 70ch;
  color: rgba(2,6,23,0.72);
  line-height: 1.55;
  font-weight: 650;
}

.pr-card{
  margin-top: 14px;
  border-radius: 18px;
  border: 1px solid rgba(2,6,23,0.10);
  background:
    radial-gradient(900px 260px at 12% -25%, rgba(34,197,94,0.10), transparent 60%),
    radial-gradient(900px 260px at 70% -30%, rgba(56,189,248,0.10), transparent 55%),
    rgba(255,255,255,0.78);
  padding: 16px 16px 14px;
}

.pr-cardTitle{
  font-weight: 950;
  letter-spacing: -0.02em;
  margin-bottom: 10px;
}

.pr-row{
  display:flex;
  justify-content:space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(2,6,23,0.10);
  background: rgba(255,255,255,0.60);
}
.pr-label{ font-weight: 900; color: rgba(2,6,23,0.70); }
.pr-value{ font-weight: 800; color: rgba(2,6,23,0.85); word-break: break-word; text-align:right; }

.pr-actions{ display:flex; gap:10px; flex-wrap:wrap; margin-top: 12px; }
.pr-btn{
  text-decoration:none;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  padding: 10px 14px;
  border-radius: 14px;
  font-weight: 900;
  border: 1px solid rgba(2,6,23,0.12);
  color: rgba(2,6,23,0.84);
  background: rgba(255,255,255,0.70);
  cursor: pointer;
}
.pr-btn:hover{ transform: translateY(-1px); }
.pr-primary{
  border-color: rgba(14,165,233,0.20);
  background: linear-gradient(135deg, rgba(34,197,94,.16), rgba(56,189,248,.16));
}
.pr-danger{
  border-color: rgba(244,63,94,0.18);
  background: rgba(244,63,94,0.10);
  color: rgba(127,29,29,0.92);
}

@media (max-width:520px){
  .pr-hero{ padding: 18px 16px 18px; }
}
`;
