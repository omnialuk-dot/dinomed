import { useMemo, useState } from "react";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xbdyklro";

export default function Contatti() {
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [fields, setFields] = useState({
    name: "",
    email: "",
    message: "",
  });

  const canSend = useMemo(() => {
    const nameOk = fields.name.trim().length >= 2;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim());
    const msgOk = fields.message.trim().length >= 10;
    return nameOk && emailOk && msgOk && status !== "sending";
  }, [fields, status]);

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: fields.name.trim(),
          email: fields.email.trim(),
          message: fields.message.trim(),
        }),
      });

      if (!res.ok) {
        let msg = "Qualcosa è andato storto. Riprova tra poco.";
        try {
          const data = await res.json();
          if (data?.errors?.length) msg = data.errors[0]?.message || msg;
        } catch {}
        throw new Error(msg);
      }

      setStatus("success");
      setFields({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err?.message || "Errore inatteso.");
    }
  }

  return (
    <main className="ct">
      <style>{css}</style>

      <section className="ct-hero">
        <div className="ct-kicker">
          <span className="ct-dot" aria-hidden="true" />
          <span className="ct-brand">
            <span className="ct-dino">Dino</span>
            <span className="ct-med">Med</span>
          </span>
          <span className="ct-sep">•</span>
          <span className="ct-kickerText">Contatti</span>
        </div>

        <h1 className="ct-title">
          Scrivici. <span className="ct-grad">Davvero.</span>
        </h1>

        <p className="ct-sub">
          Idee, segnalazioni, errori da sistemare o cose che vorresti trovare su DinoMed: leggiamo tutto.
        </p>
      </section>

      <section className="ct-grid">
        {/* FORM */}
        <div className="ct-card">
          <div className="ct-cardHead">
            <div>
              <div className="ct-cardTitle">Invia un messaggio</div>
              <div className="ct-cardSub">Rispondiamo appena riusciamo.</div>
            </div>

            <span className="ct-badge" aria-hidden="true">
              <IconMail /> Online
            </span>
          </div>

          {status === "success" ? (
            <div className="ct-success">
              <div className="ct-successTitle">
                <IconCheck /> Messaggio inviato
              </div>
              <div className="ct-successText">
                Perfetto. Grazie! Se serve, ti rispondiamo via email.
              </div>
              <button className="ct-btn ct-soft" type="button" onClick={() => setStatus("idle")}>
                Invia un altro messaggio <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="ct-form">
              <div className="ct-row">
                <label className="ct-label">
                  Nome
                  <input
                    className="ct-input"
                    value={fields.name}
                    onChange={(e) => setFields((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Es. Matteo"
                    autoComplete="name"
                  />
                </label>

                <label className="ct-label">
                  Email
                  <input
                    className="ct-input"
                    value={fields.email}
                    onChange={(e) => setFields((p) => ({ ...p, email: e.target.value }))}
                    placeholder="nome@email.com"
                    autoComplete="email"
                    inputMode="email"
                  />
                </label>
              </div>

              <label className="ct-label">
                Messaggio
                <textarea
                  className="ct-textarea"
                  value={fields.message}
                  onChange={(e) => setFields((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Scrivi qui… (es. “Nelle dispense manca X”, “Mi piacerebbe una modalità Y”, ecc.)"
                  rows={6}
                />
              </label>

              {status === "error" ? (
                <div className="ct-error">
                  <IconWarn /> {errorMsg}
                </div>
              ) : null}

              <div className="ct-actions">
                <button className="ct-btn ct-primary" type="submit" disabled={!canSend}>
                  {status === "sending" ? "Invio..." : "Invia"}
                  <span aria-hidden="true">→</span>
                  <span className="ct-shine" aria-hidden="true" />
                </button>

                <div className="ct-hint">
                  Compila tutto: nome, email e almeno qualche riga di messaggio.
                </div>
              </div>
            </form>
          )}
        </div>

        {/* SIDE */}
        <aside className="ct-side">
          <div className="ct-sideCard">
            <div className="ct-sideTitle">Cosa puoi scriverci</div>

            <div className="ct-list">
              <div className="ct-item">
                <span className="ct-itemDot" aria-hidden="true" />
                Errori nelle dispense o link rotti
              </div>
              <div className="ct-item">
                <span className="ct-itemDot" aria-hidden="true" />
                Idee per nuove simulazioni / modalità
              </div>
              <div className="ct-item">
                <span className="ct-itemDot" aria-hidden="true" />
                Suggerimenti su struttura e ordine
              </div>
            </div>
          </div>

          <div className="ct-sideCard">
            <div className="ct-sideTitle">Preferisci un contatto diretto?</div>
            <div className="ct-sideSub">Aggiungi qui i tuoi canali quando vuoi.</div>

            <div className="ct-links">
              <a className="ct-link" href="mailto:dinomed.contact@gmail.com">
                <span className="ct-linkIcon" aria-hidden="true"><IconMail /></span>
                Email
                <span className="ct-linkArrow" aria-hidden="true">→</span>
              </a>

              <a className="ct-link" href="#" onClick={(e) => e.preventDefault()}>
                <span className="ct-linkIcon" aria-hidden="true"><IconAt /></span>
                Instagram (in arrivo)
                <span className="ct-linkArrow" aria-hidden="true">→</span>
              </a>
            </div>

            <div className="ct-miniNote">
          
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

/* ---------------- icons ---------------- */
function IconMail() {
  return (
    <span className="ct-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M4 6h16v12H4V6Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="m4 7 8 6 8-6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
function IconCheck() {
  return (
    <span className="ct-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
function IconWarn() {
  return (
    <span className="ct-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 9v4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M12 17h.01"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M10.3 4.5 2.7 18a2 2 0 0 0 1.8 3h15a2 2 0 0 0 1.8-3L13.7 4.5a2 2 0 0 0-3.4 0Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
function IconAt() {
  return (
    <span className="ct-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M16 12a4 4 0 1 1-1.2-2.8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M16 12v1.2a2.8 2.8 0 0 0 5.6 0V12A9.6 9.6 0 1 0 12 21.6h3.2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/* ---------------- CSS ---------------- */
const css = `
:root{
  --dino:#22c55e; --dino2:#16a34a;
  --med:#38bdf8;  --med2:#0ea5e9;
  --ink: rgba(15,23,42,0.92);
  --ink2: rgba(15,23,42,0.72);
  --bd: rgba(15,23,42,0.10);
  --shadow2: 0 12px 28px rgba(2,6,23,0.08);
}

.ct{ max-width: 1120px; margin: 0 auto; padding: 22px; }

/* hero */
.ct-hero{
  border-radius: 28px;
  border: 1px solid var(--bd);
  background:
    radial-gradient(900px 280px at 12% -25%, rgba(34,197,94,0.16), transparent 60%),
    radial-gradient(900px 280px at 70% -30%, rgba(56,189,248,0.16), transparent 55%),
    rgba(255,255,255,0.90);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: var(--shadow2);
  overflow:hidden;
  padding: 28px;
}
@media (max-width: 520px){ .ct-hero{ padding: 18px; } }

.ct-kicker{
  display:inline-flex;
  align-items:center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.68);
  font-weight: 950;
  color: rgba(15,23,42,0.82);
}
.ct-dot{
  width: 10px; height: 10px; border-radius: 999px;
  background: linear-gradient(90deg, var(--dino), var(--med));
  box-shadow: 0 10px 20px rgba(2,6,23,0.10);
}
.ct-brand{ display:inline-flex; gap: 0; }
.ct-dino{ color: var(--dino2); font-weight: 1000; }
.ct-med{ color: var(--med2); font-weight: 1000; }
.ct-sep{ opacity:.55; }

.ct-title{
  margin: 16px 0 10px;
  font-size: 46px;
  line-height: 1.02;
  letter-spacing: -0.035em;
  color: var(--ink);
  font-weight: 1000;
}
@media (max-width: 520px){ .ct-title{ font-size: 36px; } }

.ct-grad{
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  -webkit-background-clip:text;
  background-clip:text;
  color: transparent;
}

.ct-sub{ margin: 0; color: var(--ink2); font-weight: 850; max-width: 80ch; }

/* grid */
.ct-grid{
  margin-top: 22px;
  display:grid;
  grid-template-columns: 1.2fr .8fr;
  gap: 14px;
  align-items: start;
}
@media (max-width: 980px){
  .ct-grid{ grid-template-columns: 1fr; }
}

/* cards */
.ct-card, .ct-sideCard{
  border-radius: 24px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.90);
  box-shadow: 0 14px 52px rgba(2,6,23,0.08);
  padding: 18px;
}

.ct-cardHead{
  display:flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.ct-cardTitle{ font-weight: 1000; color: rgba(15,23,42,0.92); }
.ct-cardSub{ margin-top: 6px; font-weight: 850; color: rgba(15,23,42,0.68); }

.ct-badge{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: linear-gradient(135deg, rgba(34,197,94,0.10), rgba(56,189,248,0.10));
  font-weight: 950;
  color: rgba(15,23,42,0.78);
}

.ct-form{ display:grid; gap: 12px; }

.ct-row{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 680px){
  .ct-row{ grid-template-columns: 1fr; }
}

.ct-label{
  display:grid;
  gap: 8px;
  font-weight: 950;
  color: rgba(15,23,42,0.82);
}

.ct-input, .ct-textarea{
  width: 100%;
  padding: 12px 12px;
  border-radius: 14px;
  border: 1px solid rgba(15,23,42,0.14);
  background: white;
  font-weight: 900;
  outline: none;
}
.ct-textarea{ resize: vertical; min-height: 140px; }

.ct-actions{
  display:flex;
  gap: 12px;
  align-items:center;
  flex-wrap: wrap;
  margin-top: 6px;
}

.ct-btn{
  position: relative;
  overflow: hidden;
  display:inline-flex;
  align-items:center;
  gap: 10px;
  padding: 13px 16px;
  border-radius: 999px;
  text-decoration:none;
  font-weight: 1000;
  border: 1px solid rgba(15,23,42,0.10);
  box-shadow: 0 14px 30px rgba(2,6,23,0.10);
  transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
  color: rgba(15,23,42,0.86);
  background: rgba(255,255,255,0.72);
  cursor: pointer;
}
.ct-btn:hover{ transform: translateY(-1px); box-shadow: 0 18px 40px rgba(2,6,23,0.14); filter: saturate(1.03); }
.ct-btn:disabled{ opacity: .55; cursor: not-allowed; transform: none; }

.ct-primary{
  color:white;
  border: 1px solid rgba(255,255,255,0.18);
  background: linear-gradient(90deg, var(--dino2), var(--med2));
}
.ct-soft{
  background: linear-gradient(135deg, rgba(34,197,94,0.10), rgba(56,189,248,0.10));
}

.ct-shine{
  position:absolute; inset:0;
  background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.26) 25%, transparent 50%);
  transform: translateX(-120%);
  animation: ctShine 4.2s ease-in-out infinite;
  pointer-events: none;
}
@keyframes ctShine{
  0%, 58% { transform: translateX(-120%); }
  88%, 100% { transform: translateX(120%); }
}

.ct-hint{
  font-weight: 850;
  color: rgba(15,23,42,0.64);
}

/* side */
.ct-side{ display:grid; gap: 14px; }

.ct-sideTitle{ font-weight: 1000; color: rgba(15,23,42,0.92); }
.ct-sideSub{ margin-top: 6px; font-weight: 850; color: rgba(15,23,42,0.68); }

.ct-list{ margin-top: 12px; display:grid; gap: 10px; }
.ct-item{ display:flex; gap: 10px; align-items:center; font-weight: 900; color: rgba(15,23,42,0.76); }
.ct-itemDot{ width: 10px; height: 10px; border-radius: 999px; background: linear-gradient(90deg, var(--dino2), var(--med2)); }

.ct-links{ margin-top: 14px; display:grid; gap: 10px; }
.ct-link{
  display:flex;
  align-items:center;
  gap: 10px;
  padding: 12px 12px;
  border-radius: 16px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.72);
  text-decoration:none;
  font-weight: 950;
  color: rgba(15,23,42,0.84);
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}
.ct-link:hover{
  transform: translateY(-1px);
  border-color: rgba(56,189,248,0.22);
  box-shadow: 0 18px 40px rgba(2,6,23,0.12);
}
.ct-linkIcon{
  width: 44px; height: 44px;
  border-radius: 18px;
  display:grid; place-items:center;
  background: linear-gradient(135deg, rgba(34,197,94,0.10), rgba(56,189,248,0.10));
  border: 1px solid rgba(15,23,42,0.08);
  color: rgba(15,23,42,0.78);
}
.ct-linkArrow{ margin-left: auto; opacity: .75; }

.ct-miniNote{
  margin-top: 12px;
  font-weight: 850;
  color: rgba(15,23,42,0.62);
}

/* states */
.ct-error{
  display:flex;
  gap: 10px;
  align-items:center;
  padding: 12px 12px;
  border-radius: 16px;
  border: 1px solid rgba(239,68,68,0.25);
  background: rgba(239,68,68,0.08);
  color: rgba(127,29,29,0.95);
  font-weight: 900;
}

.ct-success{
  border-radius: 20px;
  border: 1px solid rgba(34,197,94,0.20);
  background: rgba(34,197,94,0.08);
  padding: 16px;
  display:grid;
  gap: 10px;
}
.ct-successTitle{
  display:flex;
  gap: 10px;
  align-items:center;
  font-weight: 1000;
  color: rgba(15,23,42,0.92);
}
.ct-successText{
  font-weight: 850;
  color: rgba(15,23,42,0.72);
}

/* icons */
.ct-ico{ width: 18px; height: 18px; display:inline-grid; place-items:center; }
.ct-ico svg{ width: 18px; height: 18px; }
`;