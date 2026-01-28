import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Simulazioni() {
  return (
    <div>
      <header className="header-sticky">
        <div className="logo-container">
          <img src={logo} alt="DinoMed Icon" style={{ height: 40 }} />
        </div>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/simulazioni">Simulazioni</Link>
          <Link to="/dispense">Dispense</Link>
        </nav>
        <button className="mobile-menu-btn">☰</button>
      </header>

      <div className="home-container">
        <section className="demo-section">
          <h2 className="section-title">Simulazioni</h2>
          <p style={{ textAlign: "center", color: "#4b5563" }}>
            Qui ci mettiamo: elenco simulazioni, “inizia test”, timer, risultati, ecc.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
            <button className="btn btn-primary">Inizia simulazione (demo)</button>
            <Link className="btn btn-secondary" to="/">Torna alla Home</Link>
          </div>
        </section>
      </div>

      <footer className="footer">
        <p>© 2026 DinoMed. Tutti i diritti riservati.</p>
      </footer>
    </div>
  );
}
