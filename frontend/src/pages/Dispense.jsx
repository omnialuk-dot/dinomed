import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL, getFilesList } from "../api";
import logo from "../assets/logo.png";

function fileUrl(f) {
  const raw = f?.url || f?.path || f?.file_url || f?.download_url || "";
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  return `${API_BASE_URL}${raw.startsWith("/") ? "" : "/"}${raw}`;
}

export default function Dispense() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFilesList("pdf")
      .then((data) => setFiles(Array.isArray(data) ? data : []))
      .catch(() => setFiles([]))
      .finally(() => setLoading(false));
  }, []);

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
          <h2 className="section-title">Dispense</h2>

          {loading ? (
            <p style={{ textAlign: "center", color: "#9ca3af" }}>Caricamento...</p>
          ) : files.length === 0 ? (
            <div style={{ textAlign: "center", padding: 20, background: "white", borderRadius: 12 }}>
              <p>Nessuna dispensa disponibile al momento.</p>
            </div>
          ) : (
            <div className="file-list">
              {files.map((f, i) => {
                const name = f?.name || f?.filename || f?.original_name || `Dispensa ${i + 1}`;
                const url = fileUrl(f);

                return (
                  <div key={i} className="file-item">
                    <span className="file-name">📄 {name}</span>

                    {url ? (
                      <a className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 14 }} href={url} target="_blank" rel="noreferrer">
                        Apri / Scarica
                      </a>
                    ) : (
                      <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 14 }} disabled>
                        Link non disponibile
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <footer className="footer">
        <p>© 2026 DinoMed. Tutti i diritti riservati.</p>
      </footer>
    </div>
  );
}
