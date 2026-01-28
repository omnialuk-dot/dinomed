import "./index.css";
import logo from "./assets/logo.png";

export default function App() {
  return (
    <div className="home">
      <header className="header">
        <img src={logo} alt="DinoMed logo" className="logo" />
        <h1 className="title">
          <span className="green">Dino</span>
          <span className="blue">Med</span>
        </h1>
        <p className="subtitle">
          Da zero confusione a più chiarezza.
        </p>
      </header>

      <div className="buttons">
        <button className="btn primary">Inizia le simulazioni</button>
        <button className="btn secondary">Vai alle dispense</button>
      </div>
    </div>
  );
}


