// FILE: src/home.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getFilesList } from "../api";
import logo from "../assets/logo.png";
import logoFull from "../assets/logo-full.png";
import heroIllo from "../assets/hero-illustration.svg";

export default function Home() {
const [files, setFiles] = useState([]);
const [loadingFiles, setLoadingFiles] = useState(true);

// Demo state
const [answers, setAnswers] = useState({});

useEffect(() => {
getFilesList("pdf")
.then((data) => {
const list = Array.isArray(data?.files) ? data.files : [];
setFiles(list);
})
.catch(() => setFiles([]))
.finally(() => setLoadingFiles(false));
}, []);

const handleDemoClick = (qId, option, correct) => {
setAnswers({
...answers,
[qId]: { selected: option, correct: correct },
});
};

const getOptionClass = (qId, option, isCorrectOption) => {
const answer = answers[qId];
if (!answer) return "option-btn";

if (answer.selected === option) {
return isCorrectOption ? "option-btn correct" : "option-btn wrong";
}
if (answer.selected !== option && isCorrectOption && answer.selected) {
return "option-btn correct";
}
return "option-btn";
};

return (
<div className="home-wrapper">
{/* 1. Sticky Header */}
<header className="header-sticky">
<div className="logo-container">
<img src={logo} alt="DinoMed Icon" style={{ height: "40px" }} />
</div>
<nav className="nav-links">
<Link to="/simulazioni">Simulazioni</Link>
<Link to="/dispense">Dispense</Link>
<Link to="/admin">Area Admin</Link>
<Link to="/login" className="btn btn-primary" style={{ padding: "8px 16px" }}>
Accedi
</Link>
</nav>
<button className="mobile-menu-btn">☰</button>
</header>

<div className="home-container">
{/* 2. Hero Section (Premium, senza immagini per ora) */}
<section className="hero-premium">
  <div className="hero-premium__left">
    <img src={logoFull} alt="DinoMed Logo" className="hero-logo-full" />

    <h1 className="hero-premium__title">
      Da zero confusione a <span className="blue">più chiarezza</span>.
    </h1>

    <p className="hero-premium__subtitle">
      Simulazioni, dispense e metodo: tutto in un posto. Interfaccia pulita, zero fronzoli, massimo risultato.
    </p>

    <div className="hero-premium__actions">
      <Link to="/simulazioni" className="btn btn-primary">Inizia una simulazione</Link>
      <Link to="/dispense" className="btn btn-secondary">Vai alle dispense</Link>
    </div>

    <div className="hero-premium__trust">
      <div className="trust-pill">⚡ Rapido</div>
      <div className="trust-pill">🎯 Mirato</div>
      <div className="trust-pill">🧠 Chiaro</div>
      <div className="trust-pill">🔒 Affidabile</div>
    </div>
  </div>

  {/* Placeholder premium: quando vorrai, qui ci mettiamo l’immagine */}
  <div className="hero-premium__right">
    <div className="hero-glass">
      <div className="hero-glass__top">
        <div className="dot dot-red" />
        <div className="dot dot-yellow" />
        <div className="dot dot-green" />
        <div className="hero-glass__label">DinoMed • Dashboard</div>
      </div>

      <div className="hero-glass__body">
        <div className="mini-card">
          <div className="mini-icon">📝</div>
          <div>
            <div className="mini-title">Simulazioni</div>
            <div className="mini-sub">Modalità esame, feedback immediato</div>
          </div>
        </div>

        <div className="mini-card">
          <div className="mini-icon">📚</div>
          <div>
            <div className="mini-title">Dispense</div>
            <div className="mini-sub">Sintetiche, pulite, efficaci</div>
          </div>
        </div>

        <div className="mini-card">
          <div className="mini-icon">🧭</div>
          <div>
            <div className="mini-title">Metodo</div>
            <div className="mini-sub">Percorso guidato (in arrivo)</div>
          </div>
        </div>

        <div className="progress-wrap">
          <div className="progress-row">
            <span>Prontezza</span>
            <span className="muted">+12%</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" /></div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* 3. Bento Grid (Premium Features) */}
<section className="bento">
  <h2 className="section-title">Tutto quello che serve. Fatto bene.</h2>

  <div className="bento-grid">
    <div className="bento-item bento-item--big">
      <div className="bento-kicker">🔥 Focus totale</div>
      <h3>Una home che ti porta subito dove serve</h3>
      <p>
        Simulazioni e dispense in primo piano, demo rapida, ultime aggiunte visibili. Niente caos, niente perdite di tempo.
      </p>
      <div className="bento-tags">
        <span className="tag">UX pulita</span>
        <span className="tag">Mobile friendly</span>
        <span className="tag">Veloce</span>
      </div>
    </div>

    <div className="bento-item">
      <div className="bento-icon">🎯</div>
      <h3>Stile esame</h3>
      <p>Domande realistiche, feedback immediato e ritmo da “giorno della prova”.</p>
    </div>

    <div className="bento-item">
      <div className="bento-icon">📌</div>
      <h3>Materiale mirato</h3>
      <p>Dispense curate, leggibili e fatte per ricordare davvero.</p>
    </div>

    <div className="bento-item">
      <div className="bento-icon">⚡</div>
      <h3>Zero attrito</h3>
      <p>Navigazione veloce, layout pulito, niente roba “cheap”.</p>
    </div>

    <div className="bento-item">
      <div className="bento-icon">🔒</div>
      <h3>Affidabile</h3>
      <p>Struttura chiara e solida. Prima utilità, poi estetica top.</p>
    </div>
  </div>

  <div className="cta-strip">
    <div>
      <div className="cta-title">Pronto a fare sul serio?</div>
      <div className="cta-sub">Inizia con una simulazione veloce o apri le ultime dispense.</div>
    </div>
    <div className="cta-actions">
      <Link to="/simulazioni" className="btn btn-primary">Vai alle simulazioni</Link>
      <Link to="/dispense" className="btn btn-secondary">Vai alle dispense</Link>
    </div>
  </div>
</section>

{/* 4. Mini Demo Simulazione */}
<section className="demo-section">
<h2 className="section-title">Prova subito</h2>

<div className="question-box">
<div className="question-text">1. Quale osso non fa parte del carpo?</div>
<div className="options-grid">
{["Scafoide", "Cuboide", "Semilunare", "Uncinato"].map((opt) => (
<button
key={opt}
className={getOptionClass(1, opt, opt === "Cuboide")}
onClick={() => handleDemoClick(1, opt, opt === "Cuboide")}
>
{opt}
</button>
))}
</div>
</div>

<div className="question-box">
<div className="question-text">2. Il neurotrasmettitore della placca motrice è:</div>
<div className="options-grid">
{["Adrenalina", "Dopamina", "Acetilcolina", "Serotonina"].map((opt) => (
<button
key={opt}
className={getOptionClass(2, opt, opt === "Acetilcolina")}
onClick={() => handleDemoClick(2, opt, opt === "Acetilcolina")}
>
{opt}
</button>
))}
</div>
</div>
</section>

{/* 5. Ultime Dispense */}
<section className="files-section">
<h2 className="section-title">Ultime dispense caricate</h2>

{loadingFiles ? (
<p style={{ textAlign: "center", color: "#9ca3af" }}>Caricamento...</p>
) : files.length > 0 ? (
<div className="file-list">
{files.slice(0, 3).map((f) => {
const filename = f.filename || f.name || "file.pdf";
const href = filePublicUrl(filename, "pdf");
return (
<div key={filename} className="file-item">
<span className="file-name">📄 {f.original_filename || filename}</span>
<a
className="btn btn-secondary"
style={{ padding: "6px 12px", fontSize: "14px" }}
href={href}
target="_blank"
rel="noreferrer"
>
Apri
</a>
</div>
);
})}
</div>
) : (
<div style={{ textAlign: "center", padding: "20px", background: "white", borderRadius: "12px" }}>
<p>Nessuna dispensa recente disponibile al momento.</p>
<Link to="/dispense" style={{ color: "#2f80ed" }}>
Vedi tutto l'archivio
</Link>
</div>
)}
</section>
</div>

{/* 6. Footer */}
<footer className="footer">
<p>© 2026 DinoMed. Tutti i diritti riservati.</p>
<p style={{ fontSize: "12px", opacity: 0.6, marginTop: "8px" }}>Fatto con 💙 per gli studenti.</p>
</footer>
</div>
);
}