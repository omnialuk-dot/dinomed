import { useMemo, useState } from "react";
import { getUser } from "../lib/userSession";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/photos/logo.png";

export default function SiteHeader() {
  const user = useMemo(() => getUser(), []);
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sh-wrap">
      <style>{css}</style>

      <div className="sh-inner">
        <Link to="/" className="sh-brand" onClick={close}>
          <span className="sh-logoWrap" aria-hidden="true">
            <img src={logo} alt="DinoMed" className="sh-logo" />
          </span>

          <span className="sh-text" aria-label="DinoMed">
            <span className="sh-dinom">DinoMed</span>
            {/* glow SUPER soft */}
            <span className="sh-brandGlow" ari
        {/* User email (logged) */}
        {user?.email ? (
          <div className="sh-user" title={user.email}>{user.email}</div>
        ) : null}
a-hidden="true" />
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="sh-nav" aria-label="Navigazione principale">
          <NavLink to="/" className="sh-link" onClick={close}>Home</NavLink>
          <NavLink to="/dispense" className="sh-link" onClick={close}>Dispense</NavLink>
          <NavLink to="/simulazioni" className="sh-link" onClick={close}>Simulazioni</NavLink>
          <NavLink to="/chi-siamo" className="sh-link" onClick={close}>Chi siamo</NavLink>
          <NavLink to="/contatti" className="sh-link" onClick={close}>Contatti</NavLink>

          <NavLink to="/simulazioni/config" className="sh-link sh-cta" onClick={close}>
            Inizia
            <span className="sh-ctaShine" aria-hidden="true" />
          </NavLink>

          <NavLink to="/profilo" className="sh-link" onClick={close}>Profilo</NavLink>
        </nav>

        {/* Mobile burger */}
        <button
          className={"sh-burger" + (open ? " isOpen" : "")}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Chiudi menu" : "Apri menu"}
          aria-expanded={open ? "true" : "false"}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile dropdown */}
      {open ? (
        <div className="sh-mobile" role="dialog" aria-label="Menu">
          <NavLink to="/" className="sh-mLink" onClick={close}>Home</NavLink>
          <NavLink to="/dispense" className="sh-mLink" onClick={close}>Dispense</NavLink>
          <NavLink to="/simulazioni" className="sh-mLink" onClick={close}>Simulazioni</NavLink>
          <NavLink to="/chi-siamo" className="sh-mLink" onClick={close}>Chi siamo</NavLink>
          <NavLink to="/contatti" className="sh-mLink" onClick={close}>Contatti</NavLink>

          <NavLink to="/profilo" className="sh-mLink" onClick={close}>Profilo</NavLink>

          <NavLink to="/simulazioni/config" className="sh-mLink sh-mCta" onClick={close}>
            Inizia
            <span className="sh-ctaShine" aria-hidden="true" />
          </NavLink>
        </div>
      ) : null}
    </header>
  );
}

const css = `
:root{
  --dino:#22c55e;
  --dino2:#16a34a;
  --med:#38bdf8;
  --med2:#0ea5e9;
  --ink:#0b1220;
  --bd:rgba(15,23,42,0.10);
  --glass:rgba(255,255,255,0.72);
  --shadow:0 18px 50px rgba(2,6,23,0.10);
  --shadow2:0 10px 30px rgba(2,6,23,0.08);
}

.sh-wrap{
  position:sticky; top:0; z-index:100;
  background:
    radial-gradient(900px 260px at 12% -25%, rgba(34,197,94,0.12), transparent 60%),
    radial-gradient(900px 260px at 70% -30%, rgba(56,189,248,0.12), transparent 55%),
    var(--glass);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--bd);
  box-shadow: var(--shadow2);
}

.sh-inner{
  max-width:1100px;
  margin:0 auto;
  padding:12px 18px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
}

 .sh-brand{
  display:flex;
  align-items:center;
  gap:12px;
  text-decoration:none;
  color:var(--ink);
}

.sh-logoWrap{
  width:44px;height:44px;border-radius:14px;
  display:grid;place-items:center;
  background: linear-gradient(135deg, rgba(34,197,94,.14), rgba(56,189,248,.14));
  border: 1px solid rgba(2,6,23,0.08);
  box-shadow: 0 12px 28px rgba(2,6,23,0.08);
}
.sh-logo{
  width:30px;height:30px;object-fit:contain;
  filter: drop-shadow(0 6px 10px rgba(2,6,23,0.14));
}

.sh-text{
  position:relative;
  display:inline-flex;
  align-items:baseline;
  white-space:nowrap;
  font-weight:1000;
  font-size:18px;
  letter-spacing:-0.02em;
  line-height:1;
}
.sh-dino{ color:var(--dino); text-shadow:0 6px 14px rgba(34,197,94,0.12); }
.sh-med{ color:var(--med); margin-left:0; text-shadow:0 6px 14px rgba(56,189,248,0.12); }

/* glow MOLTO ridotto */
.sh-brandGlow{
  position:absolute;
  inset:-6px -10px -6px -10px;
  background:
    radial-gradient(180px 48px at 20% 55%, rgba(34,197,94,0.06), transparent 70%),
    radial-gradient(180px 48px at 80% 55%, rgba(56,189,248,0.06), transparent 70%);
  filter: blur(16px);
  z-index:-1;
  pointer-events:none;
  opacity:.40;
}

.sh-nav{
  display:flex;
  align-items:center;
  gap:6px;
  padding:6px;
  border-radius:999px;
  background: rgba(255,255,255,0.55);
  border: 1px solid rgba(2,6,23,0.08);
}

.sh-link{
  position:relative;
  text-decoration:none;
  font-weight:900;
  font-size:14px;
  color: rgba(15,23,42,0.78);
  padding:10px 12px;
  border-radius:999px;
  transition: transform .18s ease, background .18s ease, color .18s ease;
}
.sh-link:hover{
  background: rgba(2,6,23,0.04);
  color: var(--ink);
  transform: translateY(-1px);
}
.sh-link::after{
  content:"";
  position:absolute;
  left:14px; right:14px; bottom:6px;
  height:2px; border-radius:999px;
  background: linear-gradient(90deg, var(--dino), var(--med));
  transform: scaleX(0);
  transform-origin:left;
  transition: transform .22s ease;
  opacity:.9;
}
.sh-link:hover::after{ transform: scaleX(1); }

.sh-link.active{
  background: linear-gradient(135deg, rgba(34,197,94,0.10), rgba(56,189,248,0.10));
  color: var(--ink);
  border: 1px solid rgba(2,6,23,0.06);
  box-shadow: 0 10px 24px rgba(2,6,23,0.08);
}
.sh-link.active::after{ transform: scaleX(1); }

.sh-cta{
  position:relative;
  overflow:hidden;
  color:#fff !important;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  border: 1px solid rgba(255,255,255,0.18);
  box-shadow: 0 14px 30px rgba(2,6,23,0.18);
}
.sh-cta:hover{
  filter: saturate(1.05);
  box-shadow: 0 18px 40px rgba(2,6,23,0.22);
}
.sh-ctaShine{
  position:absolute; inset:0;
  background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.26) 25%, transparent 50%);
  transform: translateX(-120%);
  animation: shShine 4.2s ease-in-out infinite;
  pointer-events:none;
}
@keyframes shShine{
  0%, 58% { transform: translateX(-120%); }
  88%, 100% { transform: translateX(120%); }
}

.sh-burger{
  display:none;
  width:44px;height:44px;border-radius:14px;
  border:1px solid rgba(2,6,23,0.10);
  background: rgba(255,255,255,0.65);
  box-shadow: 0 12px 26px rgba(2,6,23,0.10);
  cursor:pointer;
}
.sh-burger span{
  display:block;
  width:18px;height:2px;margin:4px auto;
  border-radius:999px;
  background: rgba(11,18,32,0.78);
  transition: transform .18s ease, opacity .18s ease;
}
.sh-burger.isOpen span:nth-child(1){ transform: translateY(6px) rotate(45deg); }
.sh-burger.isOpen span:nth-child(2){ opacity:0; }
.sh-burger.isOpen span:nth-child(3){ transform: translateY(-6px) rotate(-45deg); }

.sh-mobile{
  max-width:1100px;
  margin: 10px auto 14px;
  padding: 10px;
  border-radius: 18px;
  background: rgba(255,255,255,0.78);
  border: 1px solid rgba(2,6,23,0.10);
  box-shadow: var(--shadow);
  display:grid;
  gap:6px;
}
.sh-mLink{
  text-decoration:none;
  font-weight:900;
  color: rgba(15,23,42,0.82);
  padding: 12px 12px;
  border-radius: 14px;
  background: rgba(2,6,23,0.03);
}
.sh-mLink:hover{ background: rgba(2,6,23,0.06); }
.sh-mLink.active{
  background: linear-gradient(135deg, rgba(34,197,94,0.10), rgba(56,189,248,0.10));
  border: 1px solid rgba(2,6,23,0.06);
}
.sh-mCta{
  color:#fff !important;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  border: 1px solid rgba(255,255,255,0.18);
}

@media (max-width: 860px){
  .sh-nav{ display:none; }
  .sh-burger{ display:inline-grid; place-items:center; }
}

.sh-link:focus-visible,
.sh-brand:focus-visible,
.sh-burger:focus-visible,
.sh-mLink:focus-visible{
  outline: 3px solid rgba(56,189,248,0.35);
  outline-offset: 3px;
}

.sh-text{ white-space:nowrap; }
.sh-dinom{
  font-weight:900;
  letter-spacing:-0.5px;
  background: linear-gradient(135deg, rgba(34,197,94,0.95), rgba(56,189,248,0.95));
  -webkit-background-clip:text;
  background-clip:text;
  color: transparent;
}
.sh-user{
  margin-left: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid var(--bd);
  background: rgba(255,255,255,0.62);
  box-shadow: 0 10px 30px rgba(2,6,23,0.06);
  font-size: 13px;
  font-weight: 700;
  color: rgba(2,6,23,0.70);
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
@media (max-width: 880px){
  .sh-user{ display:none; }
}
`;