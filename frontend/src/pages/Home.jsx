import { Link } from "react-router-dom";
import logoFull from "../assets/logo-full.png";

export default function Home() {
  return (
    <main className="dm-home">
      {/* HEADER */}
      <header className="dm-container dm-top">
        <div className="dm-brand">
          <img className="dm-logo" src={logoFull} alt="DinoMed logo" />

          <div className="dm-brandText">
            <div className="dm-name">
              <span className="dm-nameDino">Dino</span>
              <span className="dm-nameMed">Med</span>
            </div>
            <div className="dm-tag">
              Study smarter • Esami • Test • Ripasso
            </div>
          </div>
        </div>

        <div className="dm-topActions">
          <Link to="/dispense" className="dm-btn dm-btnGhost">
            Dispense
          </Link>
          <Link to="/simulazioni" className="dm-btn dm-btnPrimary">
            Inizia
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="dm-container dm-hero">
        {/* LEFT */}
        <div className="dm-heroLeft">
          <div className="dm-pillRow">
            <span className="dm-pill">⚡ veloce</span>
            <span className="dm-pill">🎯 mirato</span>
            <span className="dm-pill">🧠 chiaro</span>
          </div>

          <h1 className="dm-h1">
            Simulazioni e dispense,{" "}
            <span className="dm-grad">fatte bene</span>.
          </h1>

          <p className="dm-sub">
            DinoMed è il tuo spazio pulito per studiare: fai una simulazione,
            capisci dove sbagli, ripassi dalle dispense e migliori davvero.
          </p>

          <div className="dm-heroActions">
            <Link to="/simulazioni" className="dm-btn dm-btnPrimary">
              Vai alle simulazioni →
            </Link>
            <Link to="/dispense" className="dm-btn dm-btnGhost">
              Apri le dispense
            </Link>
          </div>

          <div className="dm-miniStats">
            <div className="dm-stat">
              <div className="dm-statNum">01</div>
              <div className="dm-statTxt">Fai test veloci</div>
            </div>
            <div className="dm-stat">
              <div className="dm-statNum">02</div>
              <div className="dm-statTxt">Correggi gli errori</div>
            </div>
            <div className="dm-stat">
              <div className="dm-statNum">03</div>
              <div className="dm-statTxt">Ripassa mirato</div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="dm-heroRight">
          <div className="dm-preview">
            <div className="dm-previewTop">
              <div className="dm-dots">
                <span className="dm-dot r"></span>
                <span className="dm-dot y"></span>
                <span className="dm-dot g"></span>
              </div>
              <div className="dm-previewTitle">
                DinoMed • Dashboard
              </div>
            </div>

            <div className="dm-previewBody">
              <div className="dm-rowCard">
                <div className="dm-ic">📝</div>
                <div className="dm-rowText">
                  <div className="dm-rowTitle">
                    Simulazione rapida
                  </div>
                  <div className="dm-rowSub">
                    Modalità esame • timer • punteggio
                  </div>
                </div>
                <div className="dm-rowCta">Apri</div>
              </div>

              <div className="dm-rowCard">
                <div className="dm-ic">📚</div>
                <div className="dm-rowText">
                  <div className="dm-rowTitle">
                    Dispense ordinate
                  </div>
                  <div className="dm-rowSub">
                    Argomenti chiari • ricerca veloce
                  </div>
                </div>
                <div className="dm-rowCta">Apri</div>
              </div>

              <div className="dm-progress">
                <div className="dm-progressTop">
                  <span>Stai migliorando</span>
                  <span className="dm-muted">+12%</span>
                </div>
                <div className="dm-bar">
                  <div className="dm-barFill"></div>
                </div>
              </div>

              <div className="dm-hint">
                Tip: fai 1 simulazione corta → correggi → ripassa
                1 dispensa.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="dm-container dm-grid">
        <div className="dm-card dm-cardBig">
          <div className="dm-cardKicker">Focus</div>
          <h2 className="dm-h2">
            Un sito che sembra un’app, non un template.
          </h2>
          <p className="dm-p">
            Navigazione semplice, layout pulito e coerenza ovunque.
            Prima utilità, poi estetica — entrambe premium.
          </p>

          <div className="dm-tagRow">
            <span className="dm-chip">UX pulita</span>
            <span className="dm-chip">Mobile-first</span>
            <span className="dm-chip">Velocità</span>
          </div>
        </div>

        <Link to="/simulazioni" className="dm-card dm-cardLink">
          <div className="dm-cardIcon">🎯</div>
          <h3 className="dm-h3">Simulazioni</h3>
          <p className="dm-p">
            Esperienza esame: domande, ritmo, risultati chiari.
          </p>
          <div className="dm-cardArrow">Apri →</div>
        </Link>

        <Link to="/dispense" className="dm-card dm-cardLink">
          <div className="dm-cardIcon">📌</div>
          <h3 className="dm-h3">Dispense</h3>
          <p className="dm-p">
            Materiale ordinato, leggibile, rapido da consultare.
          </p>
          <div className="dm-cardArrow">Apri →</div>
        </Link>

        <div className="dm-card">
          <div className="dm-cardIcon">⚡</div>
          <h3 className="dm-h3">Tracking</h3>
          <p className="dm-p">
            Capisci cosa ripassare: errori ricorrenti e punti deboli.
          </p>
          <div className="dm-spark">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="dm-container dm-cta">
        <div>
          <h2 className="dm-h2">Parti in 2 minuti.</h2>
          <p className="dm-p dm-muted">
            Fai una simulazione breve e capisci subito cosa
            ripassare.
          </p>
        </div>

        <Link to="/simulazioni" className="dm-btn dm-btnPrimary">
          Inizia ora →
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="dm-container dm-footer">
        © DinoMed — clean UI, risultati veri.
      </footer>
    </main>
  );
}