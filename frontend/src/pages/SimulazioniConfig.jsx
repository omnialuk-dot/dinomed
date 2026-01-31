import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");

/* =========================
   ARGOMENTI (da sillabo)
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

const DEFAULT_ORDER = ["Chimica", "Fisica", "Biologia"];
const ALL_SUBJECTS = DEFAULT_ORDER;

function clampInt(v, min, max, fallback) {
  const n = parseInt(String(v), 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function pill(text) {
  return (
    <span className="dmPill" key={text}>
      {text}
    </span>
  );
}

export default function SimulazioniConfig() {
  const nav = useNavigate();
  const location = useLocation();

  // preset (se arrivi qui da link con stato)
  const preset = location?.state?.preset || null;

  const [err, setErr] = useState("");
  const [starting, setStarting] = useState(false);

  // Materie (SEMESTRE FILTRO: una prova = una materia)
  const [subjects, setSubjects] = useState(() => {
    if (preset?.sections?.length) {
      const first = uniq(preset.sections.map((s) => s.materia)).filter((m) => ALL_SUBJECTS.includes(m))[0];
      return [first || "Chimica"];
    }
    return ["Chimica"];
  });

  // Durata (Formato MUR)
  const [timedMode] = useState(true); // Formato MUR: timer sempre attivo
  const [durationMin, setDurationMin] = useState(45);

  // Ordine materie (non serve più ma lasciamo variabili per compatibilità)
  const [orderMode] = useState("default"); // default | custom
  const [customOrder] = useState(DEFAULT_ORDER);

  // Parametri domande (Formato MUR 2025/26)
  const [sceltaCount, setSceltaCount] = useState(15);
  const [compCount, setCompCount] = useState(16);

  // Argomenti per materia
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

  function toggleSubject(m) {
    // Semestre filtro: UNA prova = UNA materia
    setSubjects([m]);
  }

  // Ordine effettivo (UNA sola materia)
  const effectiveOrder = useMemo(() => {
    return [subjects[0] || "Chimica"];
  }, [subjects]);

  // Topics effettivi (recap)
  const effectiveTopics = useMemo(() => {
    const out = {};
    for (const m of effectiveOrder) {
      if (topicMode[m] === "all") out[m] = [];
      else out[m] = pickedTopics[m] || [];
    }
    return out;
  }, [effectiveOrder, topicMode, pickedTopics]);

  // recap
  const totalQuestions = useMemo(() => {
    return effectiveOrder.reduce((acc) => acc + clampInt(sceltaCount, 0, 200, 15) + clampInt(compCount, 0, 200, 16), 0);
  }, [effectiveOrder, sceltaCount, compCount]);

  const totalSubjects = effectiveOrder.length;

  async function startExam() {
    if (starting) return;

    setErr("");
    setStarting(true);

    const duration_min = timedMode ? clampInt(durationMin, 5, 240, 45) : 0;

    const sections = effectiveOrder.map((materia) => ({
      materia,
      scelta: clampInt(sceltaCount, 0, 200, 15),
      completamento: clampInt(compCount, 0, 200, 16),
      tag: topicMode[materia] === "all" ? [] : pickedTopics[materia] || [],
      difficolta: "Base",
    }));

    const body = {
      duration_min,
      sections,
      order: effectiveOrder,
    };

    const candidates = ["/api/sim/start", "/api/sim/start/", "/api/simulazioni/start", "/api/simulazioni/start/"];

    let lastInfo = "";

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

          let data;
          try {
            data = JSON.parse(txt);
          } catch {
            data = null;
          }

          // session id da backend
          const sessionId = data?.session_id || data?.id || data?.sessionId;
          if (!sessionId) {
            throw new Error("Risposta OK ma manca session_id.\n" + lastInfo);
          }

          nav("/simulazioni/prova", { state: { sessionId, config: body } });
          return;
        } catch (e) {
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

  const onlySubject = subjects[0] || "Chimica";
  const availableTopics = TOPICS[onlySubject] || [];

  return (
    <main className="dmCfg">
      <style>{css}</style>

      <div className="dmHead">
        <div className="dmKicker">
          <span className="dmDot" aria-hidden="true" />
          <span className="dmBrand">
            <span className="dmDino">Dino</span>
            <span className="dmMed">Med</span>
          </span>
          <span className="dmSep">•</span>
          <span className="dmTag">Configura simulazione</span>
        </div>

        <h1 className="dmTitle">
          Imposta la prova in <span className="dmGrad">modo semplice</span>.
        </h1>

        <p className="dmSub">
          Formato <b>Semestre Filtro (MUR)</b>: una materia alla volta, 31 domande, 45 minuti.
        </p>
      </div>

      <div className="dmGrid">
        {/* LEFT */}
        <div className="dmCard">
          {err ? <div className="dmErr">{err}</div> : null}

          <div className="dmCardTitle">Materie</div>
          <div className="dmCardHint">Seleziona 1 materia (una prova = una materia).</div>

          <div className="dmChips">
            {ALL_SUBJECTS.map((m) => (
              <button
                key={m}
                className={`dmChip ${(subjects[0] === m) ? "dmChipOn" : ""}`}
                onClick={() => toggleSubject(m)}
                type="button"
              >
                {m}
              </button>
            ))}
          </div>

          <div className="dmDivider" />

          <div className="dmRow2">
            <div>
              <div className="dmCardTitle">Crocette</div>
              <div className="dmCardHint">Formato MUR: fisso</div>
              <input
                className="dmInput"
                type="number"
                min="0"
                max="200"
                value={sceltaCount}
                disabled
                title="Formato MUR 2025/26: 15 crocette + 16 completamento"
              />
            </div>

            <div>
              <div className="dmCardTitle">Completamento</div>
              <div className="dmCardHint">Formato MUR: fisso</div>
              <input
                className="dmInput"
                type="number"
                min="0"
                max="200"
                value={compCount}
                disabled
                title="Formato MUR 2025/26: 15 crocette + 16 completamento"
              />
            </div>
          </div>

          <div className="dmDivider" />

          <div className="dmRow2">
            <div>
              <div className="dmCardTitle">Tempo</div>
              <div className="dmCardHint">Formato MUR: 45 minuti (timer fisso).</div>

              <div className="dmToggleRow">
                <button className={`dmMini ${true ? "dmMiniOn" : ""}`} type="button" disabled>
                  Con timer
                </button>
                <button className={`dmMini ${false ? "dmMiniOn" : ""}`} type="button" disabled>
                  Senza timer
                </button>
              </div>

              <div style={{ marginTop: 10 }}>
                <input
                  className="dmInput"
                  type="number"
                  min="5"
                  max="240"
                  value={durationMin}
                  disabled
                  title="Formato MUR 2025/26: 45 minuti"
                />
                <div className="dmTiny">Minuti (5–240)</div>
              </div>
            </div>

            <div>
              <div className="dmCardTitle">Formato prova</div>
              <div className="dmCardHint">Una sola materia per volta • 31 domande • 45 minuti</div>

              <div className="dmPills" aria-hidden="true">
                <span className="dmPillMini">15 crocette</span>
                <span className="dmPillMini">16 completamento</span>
                <span className="dmPillMini">+1 / −0,1 / 0</span>
              </div>
            </div>
          </div>

          <div className="dmDivider" />

          <div className="dmCardTitle">Argomenti</div>
          <div className="dmCardHint">
            Filtra gli argomenti per la <b>{onlySubject}</b>. Se lasci “Tutti”, prende domande di tutta la materia.
          </div>

          <div className="dmTopicBox">
            <div className="dmToggleRow">
              <button
                className={`dmMini ${topicMode[onlySubject] === "all" ? "dmMiniOn" : ""}`}
                onClick={() => setTopicMode((prev) => ({ ...prev, [onlySubject]: "all" }))}
                type="button"
              >
                Tutti
              </button>
              <button
                className={`dmMini ${topicMode[onlySubject] === "pick" ? "dmMiniOn" : ""}`}
                onClick={() => setTopicMode((prev) => ({ ...prev, [onlySubject]: "pick" }))}
                type="button"
              >
                Scelgo io
              </button>
            </div>

            {topicMode[onlySubject] === "pick" ? (
              <div className="dmTopicList">
                {availableTopics.map((t) => {
                  const on = (pickedTopics[onlySubject] || []).includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      className={`dmTopic ${on ? "dmTopicOn" : ""}`}
                      onClick={() =>
                        setPickedTopics((prev) => {
                          const cur = prev[onlySubject] || [];
                          const next = on ? cur.filter((x) => x !== t) : [...cur, t];
                          return { ...prev, [onlySubject]: next };
                        })
                      }
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="dmTiny">✔ Nessun filtro: userai tutte le domande di {onlySubject}.</div>
            )}
          </div>

          <div className="dmActions">
            <button className="dmBtn dmBtnPrimary" onClick={startExam} disabled={starting}>
              {starting ? "Avvio…" : "Avvia prova"}
            </button>

            <button className="dmBtn dmBtnSoft" type="button" onClick={() => nav("/simulazioni")}>
              Indietro
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="dmCard dmSoft">
          <div className="dmCardTitle">Riepilogo</div>

          <div className="dmRecap">
            <div className="dmRecapRow">
              <div className="dmRecapLbl">Materia</div>
              <div className="dmRecapVal">{onlySubject}</div>
            </div>
            <div className="dmRecapRow">
              <div className="dmRecapLbl">Domande totali</div>
              <div className="dmRecapVal">{totalQuestions}</div>
            </div>
            <div className="dmRecapRow">
              <div className="dmRecapLbl">Timer</div>
              <div className="dmRecapVal">45 min</div>
            </div>
          </div>

          <div className="dmDivider" />

          <div className="dmCardTitle">Filtri attivi</div>
          <div className="dmCardHint">Quello che selezioni qui deve combaciare con i tag delle domande.</div>

          <div className="dmRecapTopics">
            {effectiveTopics[onlySubject]?.length ? (
              <>
                <div className="dmTiny">Tag selezionati:</div>
                <div className="dmPills">{effectiveTopics[onlySubject].map((t) => pill(t))}</div>
              </>
            ) : (
              <div className="dmTiny">Nessun filtro tag (tutta la materia).</div>
            )}
          </div>

          <div className="dmDivider" />

          <div className="dmCardTitle">Formato scoring</div>
          <div className="dmCardHint">Come nelle prove nazionali.</div>
          <div className="dmPills" aria-hidden="true">
            <span className="dmPillMini">+1 corretta</span>
            <span className="dmPillMini">−0,1 errata</span>
            <span className="dmPillMini">0 omessa</span>
            <span className="dmPillMini">18/30 minimo</span>
          </div>
        </div>
      </div>
    </main>
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
  --shadow: 0 18px 60px rgba(2,6,23,0.10);
}

.dmCfg{ max-width:1120px; margin:0 auto; padding:22px; }

.dmHead{ margin: 6px 4px 14px; }
.dmKicker{
  display:inline-flex; align-items:center; gap:10px;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.80);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
  font-weight: 950;
  color: rgba(15,23,42,0.82);
}
.dmDot{
  width:10px; height:10px; border-radius:999px;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  box-shadow: 0 10px 20px rgba(2,6,23,0.10);
}
.dmBrand{ display:inline-flex; gap:0; }
.dmDino{ color: var(--dino2); font-weight: 1000; }
.dmMed{ color: var(--med2); font-weight: 1000; }
.dmSep{ opacity:.55; }
.dmTag{ font-weight: 950; }

.dmTitle{
  margin: 12px 0 6px;
  font-size: 34px;
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: var(--ink);
  font-weight: 1100;
}
.dmGrad{
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  -webkit-background-clip:text;
  background-clip:text;
  color: transparent;
}
.dmSub{ margin:0; color: var(--ink2); font-weight: 850; max-width: 80ch; }

.dmGrid{
  display:grid;
  grid-template-columns: 1.25fr .75fr;
  gap: 14px;
  margin-top: 14px;
}
@media (max-width: 980px){
  .dmGrid{ grid-template-columns: 1fr; }
}

.dmCard{
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
.dmSoft{
  background:
    radial-gradient(520px 220px at 20% -10%, rgba(56,189,248,0.10), transparent 60%),
    radial-gradient(520px 220px at 80% -10%, rgba(34,197,94,0.10), transparent 60%),
    rgba(255,255,255,0.92);
}

.dmCardTitle{ font-weight: 1100; color: rgba(15,23,42,0.92); letter-spacing:-0.01em; }
.dmCardHint{ margin-top:6px; font-weight: 850; color: rgba(15,23,42,0.70); line-height: 1.35; }

.dmErr{
  margin-bottom: 12px;
  padding: 12px 12px;
  border-radius: 16px;
  border: 1px solid rgba(185,28,28,0.22);
  background: rgba(185,28,28,0.06);
  color: #b91c1c;
  font-weight: 900;
  white-space: pre-wrap;
}

.dmChips{ margin-top: 10px; display:flex; gap:10px; flex-wrap:wrap; }
.dmChip{
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.80);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
  font-weight: 950;
  color: rgba(15,23,42,0.82);
  cursor:pointer;
  transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease;
}
.dmChip:hover{ transform: translateY(-1px); box-shadow: 0 18px 40px rgba(2,6,23,0.10); }
.dmChipOn{
  border-color: rgba(14,165,233,0.35);
  background: linear-gradient(135deg, rgba(34,197,94,0.12), rgba(56,189,248,0.12));
}

.dmDivider{ height:1px; background: rgba(15,23,42,0.10); margin: 14px 0; }

.dmRow2{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top: 10px; }
@media (max-width: 720px){ .dmRow2{ grid-template-columns: 1fr; } }

.dmInput{
  width:100%;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid var(--bd);
  background: rgba(255,255,255,0.92);
  font-weight: 950;
  color: rgba(15,23,42,0.86);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
}
.dmInput:disabled{ opacity: .85; cursor: not-allowed; }

.dmToggleRow{ display:flex; gap:10px; flex-wrap:wrap; margin-top: 10px; }
.dmMini{
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.80);
  font-weight: 950;
  color: rgba(15,23,42,0.78);
  cursor:pointer;
}
.dmMini:disabled{ opacity:.8; cursor:not-allowed; }
.dmMiniOn{
  border-color: rgba(34,197,94,0.35);
  background: linear-gradient(135deg, rgba(34,197,94,0.12), rgba(56,189,248,0.12));
  color: rgba(15,23,42,0.84);
}

.dmTopicBox{ margin-top: 10px; }
.dmTopicList{
  margin-top: 10px;
  display:flex;
  gap: 10px;
  flex-wrap: wrap;
}
.dmTopic{
  padding: 9px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.76);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
  font-weight: 900;
  color: rgba(15,23,42,0.76);
  cursor:pointer;
}
.dmTopicOn{
  border-color: rgba(14,165,233,0.35);
  background: linear-gradient(135deg, rgba(56,189,248,0.14), rgba(56,189,248,0.06));
  color: rgba(14,165,233,0.95);
}

.dmRecap{ margin-top: 12px; display:grid; gap: 10px; }
.dmRecapRow{ display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; padding:8px 0; }
.dmRecapLbl{ font-size:12px; font-weight:950; color: rgba(15,23,42,0.60); }
.dmRecapVal{ font-weight:950; color: rgba(15,23,42,0.86); }

.dmPills{ display:flex; gap:8px; flex-wrap:wrap; }
.dmPillMini{ display:inline-flex; align-items:center; padding:8px 10px; border-radius:999px; border:1px solid rgba(15,23,42,0.10); background: rgba(255,255,255,0.70); font-weight:950; color: rgba(15,23,42,0.78); }
.dmTiny{ margin-top:6px; font-size:12px; color: rgba(15,23,42,0.55); font-weight:800; }

.dmPill{
  display:inline-flex; align-items:center;
  padding:8px 10px;
  border-radius:999px;
  border:1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.70);
  font-weight:950;
  color: rgba(15,23,42,0.78);
}

.dmActions{ margin-top: 14px; display:flex; gap:10px; flex-wrap:wrap; }

.dmBtn{
  padding:12px 14px; border-radius:14px;
  font-weight:950; border:none; cursor:pointer;
}
.dmBtn:disabled{
  opacity: .65;
  cursor: not-allowed;
}
.dmBtnPrimary{
  background:rgba(15,23,42,0.92);
  color:white;
  box-shadow:0 12px 30px rgba(15,23,42,0.18);
}
.dmBtnSoft{
  background: rgba(255,255,255,0.86);
  border:1px solid rgba(15,23,42,0.10);
}
`;