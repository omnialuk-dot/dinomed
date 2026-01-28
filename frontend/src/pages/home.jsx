// FILE: src/home.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getFilesList } from "../api";
import logo from "../assets/logo.png";
import logoFull from "../assets/logo-full.png";

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
{/* 2. Hero Section */}
<section className="hero-section">
<img src={logoFull} alt="DinoMed Logo" className="hero-logo-full" />
<h1 className="hero-title">
Da zero confusione a <span className="blue">più chiarezza</span>.
</h1>
<p className="hero-subtitle">
La piattaforma dedicata agli studenti di medicina per preparare il semestre filtro. Niente ansia, solo
metodo.
</p>
<div className="hero-buttons">
<Link to="/simulazioni" className="btn btn-primary">
Inizia una simulazione
</Link>
<Link to="/dispense" className="btn btn-secondary">
Vai alle dispense
</Link>
</div>
</section>

{/* 3. Cards Section */}
<section className="cards-section">
<div className="cards-grid">
<div className="card">
<h3>Simulazioni d'esame</h3>
<p>Mettiti alla prova con domande a crocette e completamento, nello stesso stile dell'esame reale.</p>
</div>
<div className="card">
<h3>Dispense curate</h3>
<p>Materiale di studio chiaro, sintetico e mirato per superare gli scogli più difficili.</p>
</div>
<div className="card">
<h3>
Percorso guidato <span className="badge-coming-soon">In arrivo</span>
</h3>
<p>Un piano di studio passo-passo per non perdersi tra i libri.</p>
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