import SiteHeader from "../components/SiteHeader";

export default function ChiSiamo() {
  return (
    <main className="dm-home">
      <SiteHeader />
      <section className="dm-container dm-card" style={{ padding: 18, marginTop: 12 }}>
        <h1 className="dm-h2" style={{ marginTop: 0 }}>Chi siamo</h1>
        <p className="dm-p dm-muted">
          DinoMed nasce per aiutare gli studenti a studiare meglio: simulazioni mirate + dispense pulite,
          con un metodo semplice e veloce.
        </p>

        <div className="dm-uiRow" style={{ marginTop: 12 }}>
          <div className="dm-uiCard"><div className="dm-uiIcon">🎯</div><div><div className="dm-uiTitle">Metodo</div><div className="dm-uiSub">ripasso mirato</div></div></div>
          <div className="dm-uiCard"><div className="dm-uiIcon">⚡</div><div><div className="dm-uiTitle">Velocità</div><div className="dm-uiSub">niente perdita di tempo</div></div></div>
          <div className="dm-uiCard"><div className="dm-uiIcon">🧠</div><div><div className="dm-uiTitle">Chiarezza</div><div className="dm-uiSub">UI pulita e leggibile</div></div></div>
          <div className="dm-uiCard"><div className="dm-uiIcon">📈</div><div><div className="dm-uiTitle">Progress</div><div className="dm-uiSub">migliori a cicli brevi</div></div></div>
        </div>
      </section>

      <footer className="dm-container dm-footer">© DinoMed</footer>
    </main>
  );
}