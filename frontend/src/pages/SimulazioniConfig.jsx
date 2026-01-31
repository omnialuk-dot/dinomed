import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");

/* =========================
   TOPICS (filtri argomenti)
   ========================= */
const TOPICS = {
  Chimica: [
    "Struttura della materia e teoria atomica",
    "Tavola periodica e proprietà periodiche",
    "Legami chimici e geometria molecolare",
    "Stechiometria e bilanciamento reazioni",
    "Soluzioni: concentrazioni, osmolarità",
    "Equilibri chimici",
    "Acidi-basi, pH, tamponi",
    "Solubilità e Kps",
    "Termodinamica e spontaneità",
    "Cinetica chimica",
    "Ossidazione-riduzione",
    "Chimica organica: gruppi funzionali",
    "Reazioni organiche di base",
    "Biomolecole: carboidrati, lipidi, proteine, acidi nucleici",
  ],
  Fisica: [
    "Grandezze fisiche, SI, conversioni, ordini di grandezza",
    "Vettori: somma, prodotto scalare e vettoriale",
    "Cinematica: moto, velocità, accelerazione",
    "Dinamica: leggi di Newton",
    "Lavoro, energia, potenza",
    "Quantità di moto e urti",
    "Centro di massa e corpo rigido",
    "Fluidi: pressione e densità",
    "Idrostatica: Stevino, Pascal, Archimede",
    "Torricelli e manometro (misura pressione)",
    "Idrodinamica: portata, continuità, Bernoulli",
    "Moto laminare/turbolento e resistenze",
    "Elettromagnetismo: induzione (Faraday)",
  ],
  Biologia: [
    "Albero della vita e teoria cellulare",
    "Virus: struttura e classi",
    "Cellula procariotica (membrana/parete)",
    "Cellula eucariotica e endomembrane",
    "Basi chimiche della vita (polare/non polare)",
    "Macromolecole: zuccheri, lipidi, proteine, nucleotidi",
    "Metabolismo: anabolismo/catabolismo, condensazione/idrolisi",
    "Enzimi: sito attivo, specificità, denaturazione",
    "Membrana: mosaico fluido, trasporti",
    "ATP e catene di trasporto elettroni (concetto)",
    "DNA/RNA: struttura, replicazione, trascrizione",
    "Codice genetico e traduzione (concetto)",
    "Mutazioni e riparazione DNA",
    "Genetica mendeliana e non-mendeliana",
    "Divisione cellulare (concetto)",
  ],
};

const ALL_SUBJECTS = ["Chimica", "Fisica", "Biologia"];

function clampInt(v, min, max, fallback) {
  const n = parseInt(String(v), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

export default function SimulazioniConfig() {
  const nav = useNavigate();
  const location = useLocation();
  const preset = location?.state?.preset || null;

  const [err, setErr] = useState("");
  const [starting, setStarting] = useState(false);

  // Materie (multi)
  const [subjects, setSubjects] = useState(() => {
    if (preset?.sections?.length) {
      const picked = uniq(preset.sections.map((s) => s.materia)).filter((m) => ALL_SUBJECTS.includes(m));
      return picked.length ? picked : ["Chimica"];
    }
    return ["Chimica"];
  });

  // Formato (tutto selezionabile)
  const [timedMode, setTimedMode] = useState(true);
  const [durationMin, setDurationMin] = useState(45);

  const [sceltaCount, setSceltaCount] = useState(15);
  const [compCount, setCompCount] = useState(16);

  // Argomenti
  const [topicMode, setTopicMode] = useState(() => {
    const o = {};
    for (const m of ALL_SUBJECTS) o[m] = "all"; // all | pick
    return o;
  });
  const [pickedTopics, setPickedTopics] = useState(() => {
    const o = {};
    for (const m of ALL_SUBJECTS) o[m] = [];
    return o;
  });

  // UI helpers
  const [openTopicsFor, setOpenTopicsFor] = useState(null); // materia | null

  function toggleSubject(m) {
    setSubjects((prev) => {
      const on = prev.includes(m);
      const next = on ? prev.filter((x) => x !== m) : [...prev, m];
      // evita zero materie (a prova di scemo)
      return next.length ? next : prev;
    });
  }

  function applyMUR() {
    setTimedMode(true);
    setDurationMin(45);
    setSceltaCount(15);
    setCompCount(16);
  }

  const order = useMemo(() => {
    const base = ["Chimica", "Fisica", "Biologia"];
    return base.filter((m) => subjects.includes(m));
  }, [subjects]);

  const totalQuestions = useMemo(() => {
    const scelta = clampInt(sceltaCount, 0, 200, 15);
    const comp = clampInt(compCount, 0, 200, 16);
    return (scelta + comp) * order.length;
  }, [sceltaCount, compCount, order]);

  const formatChip = useMemo(() => {
    const s = clampInt(sceltaCount, 0, 200, 15);
    const c = clampInt(compCount, 0, 200, 16);
    const t = timedMode ? `${clampInt(durationMin, 5, 240, 45)} min` : "senza timer";
    return `${s} crocette • ${c} completamento • ${t}`;
  }, [sceltaCount, compCount, timedMode, durationMin]);

  const effectiveTopics = useMemo(() => {
    const out = {};
    for (const m of order) out[m] = topicMode[m] === "all" ? [] : pickedTopics[m] || [];
    return out;
  }, [order, topicMode, pickedTopics]);

  async function startExam() {
    if (starting) return;
    setErr("");

    if (!order.length) {
      setErr("Seleziona almeno 1 materia.");
      return;
    }

    const scelta = clampInt(sceltaCount, 0, 200, 15);
    const comp = clampInt(compCount, 0, 200, 16);
    if (scelta + comp <= 0) {
      setErr("Metti almeno 1 domanda.");
      return;
    }

    const duration_min = timedMode ? clampInt(durationMin, 5, 240, 45) : 0;

    const sections = order.map((materia) => ({
      materia,
      scelta,
      completamento: comp,
      tag: topicMode[materia] === "all" ? [] : pickedTopics[materia] || [],
      difficolta: "Base",
    }));

    const body = {
      duration_min,
      sections,
      order,
    };

    const candidates = ["/api/sim/start", "/api/sim/start/", "/api/simulazioni/start", "/api/simulazioni/start/"];
    let lastInfo = "";

    setStarting(true);
    try {
      for (const path of candidates) {
        try {
          const res = await fetch(`${API_BASE}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(body),
          });

          const txt = await res.text();
          lastInfo = `[${res.status}] ${path}\n${txt || "(empty)"}`;

          if (!res.ok) {
            if (res.status === 404) continue;
            throw new Error(lastInfo);
          }

          let data = null;
          try {
            data = JSON.parse(txt);
          } catch {
            data = null;
          }

          const sessionId = data?.session_id || data?.id || data?.sessionId;
          if (!sessionId) throw new Error("Risposta OK ma manca session_id.\n" + lastInfo);

          nav("/simulazioni/prova", { state: { sessionId, config: body } });
          return;
        } catch (e) {
          // continua solo se 404 endpoint
          if (String(e?.message || "").includes("[404]")) continue;
          throw e;
        }
      }
      throw new Error("Nessun endpoint start trovato.\nUltimo tentativo:\n" + lastInfo);
    } catch (e) {
      setErr(String(e?.message || e || "Errore sconosciuto"));
    } finally {
      setStarting(false);
    }
  }

  return (
    <main className="scx">
      <style>{css}</style>

      {/* HEADER */}
      <section className="scx-hero">
        <div className="scx-kicker">
          <span className="scx-dot" aria-hidden="true" />
          <span className="scx-brand">
            <span className="scx-dino">Dino</span>
            <span className="scx-med">Med</span>
          </span>
          <span className="scx-sep">•</span>
          <span className="scx-tag">Configura</span>
        </div>

        <div className="scx-heroRow">
          <div className="scx-left">
            <h1 className="scx-title">
              Avvia la prova in <span className="scx-grad">30 secondi</span>.
            </h1>
            <div className="scx-chipRow" aria-hidden="true">
              <span className="scx-chip">{order.length} materie</span>
              <span className="scx-chip">{totalQuestions} domande</span>
              <span className="scx-chip">{formatChip}</span>
            </div>

            <div className="scx-ctaRow">
              <button className="scx-btn scx-primary" onClick={startExam} disabled={starting}>
                {starting ? "Avvio…" : "Avvia prova"} <span aria-hidden="true">→</span>
                <span className="scx-shine" aria-hidden="true" />
              </button>

              <button className="scx-btn scx-soft" type="button" onClick={applyMUR}>
                Formato MUR 2025/26
              </button>
            </div>

            {err ? <div className="scx-err">{err}</div> : null}
          </div>

          <div className="scx-right" aria-hidden="true">
            <div className="scx-mini">
              <div className="scx-miniTitle">Suggerimento</div>
              <div className="scx-miniText">Se vuoi allenarti “come all’esame”, premi <b>Formato MUR</b> e vai.</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 STEP */}
      <section className="scx-steps">
        {/* STEP 1 */}
        <div className="scx-card">
          <div className="scx-cardTop">
            <div className="scx-step">1</div>
            <div>
              <div className="scx-cardTitle">Scegli le materie</div>
              <div className="scx-cardSub">Puoi selezionarne anche 2 o 3.</div>
            </div>
          </div>

          <div className="scx-pills">
            {ALL_SUBJECTS.map((m) => (
              <button
                key={m}
                type="button"
                className={`scx-pill ${subjects.includes(m) ? "isOn" : ""}`}
                onClick={() => toggleSubject(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* STEP 2 */}
        <div className="scx-card">
          <div className="scx-cardTop">
            <div className="scx-step">2</div>
            <div>
              <div className="scx-cardTitle">Imposta il formato</div>
              <div className="scx-cardSub">Timer e numero domande (cambi tutto tu).</div>
            </div>
          </div>

          <div className="scx-grid">
            <div className="scx-field">
              <div className="scx-label">Crocette</div>
              <input
                className="scx-input"
                type="number"
                min="0"
                max="200"
                value={sceltaCount}
                onChange={(e) => setSceltaCount(clampInt(e.target.value, 0, 200, 15))}
              />
            </div>

            <div className="scx-field">
              <div className="scx-label">Completamento</div>
              <input
                className="scx-input"
                type="number"
                min="0"
                max="200"
                value={compCount}
                onChange={(e) => setCompCount(clampInt(e.target.value, 0, 200, 16))}
              />
            </div>

            <div className="scx-field">
              <div className="scx-label">Timer</div>
              <div className="scx-toggleRow">
                <button
                  type="button"
                  className={`scx-miniBtn ${timedMode ? "isOn" : ""}`}
                  onClick={() => setTimedMode(true)}
                >
                  On
                </button>
                <button
                  type="button"
                  className={`scx-miniBtn ${!timedMode ? "isOn" : ""}`}
                  onClick={() => setTimedMode(false)}
                >
                  Off
                </button>
              </div>
            </div>

            <div className="scx-field">
              <div className="scx-label">Minuti</div>
              <input
                className="scx-input"
                type="number"
                min="5"
                max="240"
                value={durationMin}
                onChange={(e) => setDurationMin(clampInt(e.target.value, 5, 240, 45))}
                disabled={!timedMode}
              />
              <div className="scx-hint">{timedMode ? "5–240" : "timer off"}</div>
            </div>
          </div>
        </div>

        {/* STEP 3 */}
        <div className="scx-card scx-wide">
          <div className="scx-cardTop">
            <div className="scx-step">3</div>
            <div>
              <div className="scx-cardTitle">Filtra per argomento (facoltativo)</div>
              <div className="scx-cardSub">Se non tocchi nulla, prende tutta la materia.</div>
            </div>
          </div>

          <div className="scx-topicWrap">
            {order.map((m) => {
              const mode = topicMode[m];
              const isOpen = openTopicsFor === m;
              const topics = TOPICS[m] || [];
              const picked = pickedTopics[m] || [];
              const pickedCount = picked.length;

              return (
                <div className="scx-topicCard" key={m}>
                  <div className="scx-topicHead">
                    <div className="scx-topicName">{m}</div>

                    <div className="scx-topicActions">
                      <button
                        type="button"
                        className={`scx-miniBtn ${mode === "all" ? "isOn" : ""}`}
                        onClick={() => setTopicMode((p) => ({ ...p, [m]: "all" }))}
                      >
                        Tutti
                      </button>
                      <button
                        type="button"
                        className={`scx-miniBtn ${mode === "pick" ? "isOn" : ""}`}
                        onClick={() => setTopicMode((p) => ({ ...p, [m]: "pick" }))}
                      >
                        Scelgo io
                      </button>

                      <button
                        type="button"
                        className={`scx-open ${isOpen ? "isOn" : ""}`}
                        onClick={() => setOpenTopicsFor((cur) => (cur === m ? null : m))}
                      >
                        {isOpen ? "Chiudi" : "Apri"} {mode === "pick" ? `(${pickedCount})` : ""}
                      </button>
                    </div>
                  </div>

                  {mode === "pick" && isOpen ? (
                    <div className="scx-topicList">
                      {topics.map((t) => {
                        const on = picked.includes(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            className={`scx-topic ${on ? "isOn" : ""}`}
                            onClick={() =>
                              setPickedTopics((prev) => {
                                const cur = prev[m] || [];
                                const next = on ? cur.filter((x) => x !== t) : [...cur, t];
                                return { ...prev, [m]: next };
                              })
                            }
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="scx-topicFoot">
                      {mode === "all" ? "✔ Tutti gli argomenti" : pickedCount ? `✔ ${pickedCount} selezionati` : "Scegli argomenti (facoltativo)"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------------- CSS ---------------- */
const css = `
:root{
  --dino:#22c55e; --dino2:#16a34a;
  --med:#38bdf8;  --med2:#0ea5e9;

  --ink: rgba(15,23,42,0.92);
  --ink2: rgba(15,23,42,0.70);
  --bd: rgba(15,23,42,0.10);
  --shadow: 0 18px 60px rgba(2,6,23,0.10);
}

.scx{ max-width: 1120px; margin: 0 auto; padding: 22px; }

/* HERO */
.scx-hero{
  border-radius: 28px;
  border: 1px solid var(--bd);
  background:
    radial-gradient(900px 320px at 12% -25%, rgba(34,197,94,0.16), transparent 60%),
    radial-gradient(900px 320px at 78% -30%, rgba(56,189,248,0.16), transparent 55%),
    rgba(255,255,255,0.90);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: var(--shadow);
  overflow:hidden;
  padding: 18px;
}

.scx-kicker{
  display:inline-flex;
  align-items:center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.74);
  font-weight: 950;
  color: rgba(15,23,42,0.82);
}
.scx-dot{
  width: 10px; height: 10px; border-radius: 999px;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  box-shadow: 0 10px 20px rgba(2,6,23,0.10);
}
.scx-brand{ display:inline-flex; gap:0; }
.scx-dino{ color: var(--dino2); font-weight: 1000; }
.scx-med{ color: var(--med2); font-weight: 1000; }
.scx-sep{ opacity:.55; }

.scx-heroRow{
  display:grid;
  grid-template-columns: 1.25fr .75fr;
  gap: 14px;
  margin-top: 14px;
  align-items: center;
}
@media (max-width: 980px){
  .scx-heroRow{ grid-template-columns: 1fr; }
}

.scx-title{
  margin: 0;
  font-size: 34px;
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: var(--ink);
  font-weight: 1100;
}
@media (max-width:520px){ .scx-title{ font-size: 30px; } }

.scx-grad{
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  -webkit-background-clip:text;
  background-clip:text;
  color: transparent;
}

.scx-chipRow{ margin-top: 10px; display:flex; gap: 8px; flex-wrap: wrap; }
.scx-chip{
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.72);
  font-weight: 950;
  color: rgba(15,23,42,0.78);
}

.scx-ctaRow{ margin-top: 12px; display:flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.scx-btn{
  position: relative;
  overflow:hidden;
  display:inline-flex;
  align-items:center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 999px;
  font-weight: 1000;
  border: 1px solid rgba(15,23,42,0.10);
  box-shadow: 0 14px 30px rgba(2,6,23,0.10);
  transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
  cursor:pointer;
  background: rgba(255,255,255,0.78);
  color: rgba(15,23,42,0.86);
}
.scx-btn:hover{ transform: translateY(-1px); box-shadow: 0 18px 40px rgba(2,6,23,0.14); filter: saturate(1.03); }
.scx-btn:disabled{ opacity:.70; cursor:not-allowed; }
.scx-primary{
  color:white;
  border: 1px solid rgba(255,255,255,0.18);
  background: linear-gradient(90deg, var(--dino2), var(--med2));
}
.scx-soft{
  background: linear-gradient(135deg, rgba(34,197,94,0.10), rgba(56,189,248,0.10));
}
.scx-shine{
  position:absolute; inset:0;
  background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.26) 25%, transparent 50%);
  transform: translateX(-120%);
  animation: scxShine 4.2s ease-in-out infinite;
  pointer-events:none;
}
@keyframes scxShine{
  0%, 58% { transform: translateX(-120%); }
  88%, 100% { transform: translateX(120%); }
}

.scx-mini{
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.72);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
  padding: 12px;
}
.scx-miniTitle{ font-weight: 1100; color: rgba(15,23,42,0.90); }
.scx-miniText{ margin-top: 6px; font-weight: 850; color: rgba(15,23,42,0.72); line-height: 1.35; }

.scx-err{
  margin-top: 12px;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(185,28,28,0.22);
  background: rgba(185,28,28,0.06);
  color: #b91c1c;
  font-weight: 900;
  white-space: pre-wrap;
}

/* STEPS */
.scx-steps{ margin-top: 14px; display:grid; gap: 14px; }

.scx-card{
  border-radius: 24px;
  border: 1px solid var(--bd);
  background:
    radial-gradient(520px 220px at 30% -10%, rgba(34,197,94,0.10), transparent 60%),
    radial-gradient(520px 220px at 80% -10%, rgba(56,189,248,0.10), transparent 60%),
    rgba(255,255,255,0.92);
  box-shadow: 0 14px 52px rgba(2,6,23,0.08);
  padding: 18px;
  color: rgba(15,23,42,0.88);
}
.scx-wide{ padding: 18px; }

.scx-cardTop{ display:flex; gap: 12px; align-items:flex-start; }
.scx-step{
  width: 36px; height: 36px;
  border-radius: 14px;
  display:grid; place-items:center;
  font-weight: 1100;
  color: rgba(15,23,42,0.86);
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.78);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
}
.scx-cardTitle{ font-weight: 1100; color: rgba(15,23,42,0.92); letter-spacing:-0.01em; }
.scx-cardSub{ margin-top: 6px; font-weight: 850; color: rgba(15,23,42,0.70); line-height:1.35; }

/* STEP 1 pills */
.scx-pills{ margin-top: 12px; display:flex; gap: 10px; flex-wrap: wrap; }
.scx-pill{
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.78);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
  font-weight: 950;
  color: rgba(15,23,42,0.80);
  cursor:pointer;
  transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease;
}
.scx-pill:hover{ transform: translateY(-1px); box-shadow: 0 18px 40px rgba(2,6,23,0.10); }
.scx-pill.isOn{
  border-color: rgba(14,165,233,0.35);
  background: linear-gradient(135deg, rgba(34,197,94,0.12), rgba(56,189,248,0.12));
}

/* STEP 2 grid */
.scx-grid{ margin-top: 12px; display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px; }
@media (max-width: 980px){ .scx-grid{ grid-template-columns: 1fr 1fr; } }
@media (max-width: 560px){ .scx-grid{ grid-template-columns: 1fr; } }

.scx-field{ display:flex; flex-direction:column; gap: 6px; }
.scx-label{ font-weight: 950; color: rgba(15,23,42,0.76); }
.scx-input{
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.92);
  font-weight: 950;
  color: rgba(15,23,42,0.86);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
}
.scx-input:disabled{ opacity: .75; cursor:not-allowed; }
.scx-hint{ font-size: 12px; font-weight: 850; color: rgba(15,23,42,0.55); }

.scx-toggleRow{ display:flex; gap: 8px; flex-wrap: wrap; }
.scx-miniBtn{
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.78);
  font-weight: 950;
  color: rgba(15,23,42,0.78);
  cursor:pointer;
}
.scx-miniBtn.isOn{
  border-color: rgba(34,197,94,0.35);
  background: linear-gradient(135deg, rgba(34,197,94,0.12), rgba(56,189,248,0.12));
}

/* STEP 3 topics */
.scx-topicWrap{ margin-top: 12px; display:grid; gap: 12px; }
.scx-topicCard{
  border-radius: 20px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.78);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
  padding: 12px;
}
.scx-topicHead{ display:flex; justify-content: space-between; gap: 10px; align-items:center; flex-wrap: wrap; }
.scx-topicName{ font-weight: 1100; color: rgba(15,23,42,0.90); }
.scx-topicActions{ display:flex; gap: 8px; flex-wrap: wrap; align-items:center; }
.scx-open{
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: linear-gradient(135deg, rgba(56,189,248,0.10), rgba(34,197,94,0.10));
  font-weight: 950;
  color: rgba(15,23,42,0.78);
  cursor:pointer;
}
.scx-open.isOn{ border-color: rgba(14,165,233,0.35); }

.scx-topicFoot{ margin-top: 8px; font-weight: 850; color: rgba(15,23,42,0.68); }

.scx-topicList{ margin-top: 10px; display:flex; gap: 10px; flex-wrap: wrap; }
.scx-topic{
  padding: 9px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.76);
  font-weight: 900;
  color: rgba(15,23,42,0.76);
  cursor:pointer;
}
.scx-topic.isOn{
  border-color: rgba(14,165,233,0.35);
  background: linear-gradient(135deg, rgba(56,189,248,0.14), rgba(56,189,248,0.06));
  color: rgba(14,165,233,0.95);
}
`;
