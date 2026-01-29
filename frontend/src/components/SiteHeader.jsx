import { Link, NavLink } from "react-router-dom";
import logo from "../assets/photos/logo.png";

export default function SiteHeader() {
  return (
    <header className="sh-wrap">
      <style>{css}</style>

      <div className="sh-inner">
        <Link to="/" className="sh-brand">
          <img src={logo} alt="DinoMed" className="sh-logo" />
          <span className="sh-text">DinoMed</span>
        </Link>

        <nav className="sh-nav">
          <NavLink to="/" className="sh-link">Home</NavLink>
          <NavLink to="/dispense" className="sh-link">Dispense</NavLink>
          <NavLink to="/simulazioni" className="sh-link">Simulazioni</NavLink>
          <NavLink to="/admin" className="sh-link sh-admin">Area riservata</NavLink>
          <NavLink to="/simulazioni" className="sh-link sh-cta">Inizia</NavLink>
        </nav>
      </div>
    </header>
  );
}

const css = `
.sh-wrap{
  position: sticky;
  top:0;
  z-index:100;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0,0,0,0.08);
}
.sh-inner{
  max-width:1100px;
  margin:0 auto;
  padding:10px 18px;
  display:flex;
  justify-content:space-between;
  align-items:center;
}
.sh-brand{
  display:flex;
  align-items:center;
  gap:10px;
  text-decoration:none;
}
.sh-logo{
  width:40px;
  height:40px;
  border-radius:12px;
}
.sh-text{
  font-weight:1000;
  font-size:18px;
  color:#111827;
}
.sh-nav{
  display:flex;
  gap:10px;
}
.sh-link{
  text-decoration:none;
  font-weight:900;
  color:rgba(15,23,42,0.75);
  padding:8px 10px;
  border-radius:999px;
}
.sh-link:hover{ background:rgba(0,0,0,0.05); }
.sh-admin{
  background:rgba(0,0,0,0.04);
}
.sh-cta{
  background:#2563eb;
  color:white;
}
`;