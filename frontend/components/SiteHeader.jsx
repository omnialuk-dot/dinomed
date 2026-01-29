import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import logoFull from "../assets/logo-full.png";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  const navClass = ({ isActive }) =>
    "dm-navLink" + (isActive ? " active" : "");

  return (
    <header className="dm-container dm-top dm-siteTop">
      <div className="dm-brand">
        <Link to="/" className="dm-brandLink" onClick={() => setOpen(false)}>
          <img className="dm-logo" src={logoFull} alt="DinoMed logo" />
          <div className="dm-brandText">
            <div className="dm-name">
              <span className="dm-nameDino">Dino</span>
              <span className="dm-nameMed">Med</span>
            </div>
            <div className="dm-tag">Study smarter • Esami • Test • Ripasso</div>
          </div>
        </Link>
      </div>

      {/* Desktop nav */}
      <nav className="dm-siteNav">
        <NavLink to="/" className={navClass}>Home</NavLink>
        <NavLink to="/simulazioni" className={navClass}>Simulazioni</NavLink>
        <NavLink to="/dispense" className={navClass}>Dispense</NavLink>
        <NavLink to="/chi-siamo" className={navClass}>Chi siamo</NavLink>
        <NavLink to="/contatti" className={navClass}>Contatti</NavLink>
      </nav>

      {/* Mobile hamburger */}
      <button
        className="dm-burger"
        onClick={() => setOpen((v) => !v)}
        aria-label="Apri menu"
        aria-expanded={open ? "true" : "false"}
      >
        <span />
        <span />
        <span />
      </button>

      {/* Mobile dropdown */}
      {open ? (
        <div className="dm-mobileNav">
          <NavLink to="/" className={navClass} onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/simulazioni" className={navClass} onClick={() => setOpen(false)}>Simulazioni</NavLink>
          <NavLink to="/dispense" className={navClass} onClick={() => setOpen(false)}>Dispense</NavLink>
          <NavLink to="/chi-siamo" className={navClass} onClick={() => setOpen(false)}>Chi siamo</NavLink>
          <NavLink to="/contatti" className={navClass} onClick={() => setOpen(false)}>Contatti</NavLink>
        </div>
      ) : null}
    </header>
  );
}