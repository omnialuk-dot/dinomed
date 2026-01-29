import SiteHeader from "../components/SiteHeader";

export default function Contatti() {
  return (
    <main className="dm-home">
      <SiteHeader />
      <section className="dm-container dm-card" style={{ padding: 18, marginTop: 12 }}>
        <h1 className="dm-h2" style={{ marginTop: 0 }}>Contatti</h1>
        <p className="dm-p dm-muted">
          Per segnalazioni, richieste o collaborazione, scrivici.
        </p>

        <div className="dm-uiRow" style={{ marginTop: 12 }}>
          <div className="dm-uiCard" style={{ gridColumn: "span 12" }}>
            <div className="dm-uiIcon">✉️</div>
            <div>
              <div className="dm-uiTitle">Email</div>
              <div className="dm-uiSub">inserire-email@dinomed.it</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="dm-container dm-footer">© DinoMed</footer>
    </main>
  );
}