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
    "Nucleo e cromosomi eucariotici",
    "Cromatina e nucleosomi",
    "Genoma umano (organizzazione)",
    "DNA→RNA→Proteina (concetto)",
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
    <span
      key={text}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid rgba(15,23,42,0.12)",
        background: "rgba(15,23,42,0.03)",
        fontWeight: 900,
        color: "rgba(15,23,42,0.78)",
        fontSize: 12,
      }}
    >
      {text}
    </span>
  );
}

/* =========================
   PAGE
   ========================= */
export default function SimulazioniConfig() {
  const nav = useNavigate();
  const loc = useLocation();
  const preset = loc.state?.preset;

  const [err, setErr] = useState("");
  const [starting, setStarting] = useState(false);

  // Materie selezionate
  const [subjects, setSubjects] = useState(() => {
    if (preset?.sections?.length) {
      return uniq(preset.sections.map((s) => s.materia)).filter((m) => ALL_SUBJECTS.includes(m));
    }
    return ["Chimica"];
  });

  // Durata
  const [timedMode, setTimedMode] = useState(true); // true => timer, false => no timer
  const [durationMin, setDurationMin] = useState(30);

  // Ordine materie
  const [orderMode, setOrderMode] = useState("default"); // default | custom
  const [customOrder, setCustomOrder] = useState(DEFAULT_ORDER);

  // Parametri domande
  const [sceltaCount, setSceltaCount] = useState(20);
  const [compCount, setCompCount] = useState(10);

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

  // Ordine effettivo
  const effectiveOrder = useMemo(() => {
    const base = orderMode === "custom" ? customOrder : DEFAULT_ORDER;
    return base.filter((m) => subjects.includes(m));
  }, [orderMode, customOrder, subjects]);

  // Topics effettivi (recap)
  const effectiveTopics = useMemo(() => {
    const out = {};
    for (const m of effectiveOrder) {
      if (topicMode[m] === "all") out[m] = "Tutti";
      else out[m] = (pickedTopics[m] || []).length ? pickedTopics[m] : "Nessuno (seleziona)";
    }
    return out;
  }, [effectiveOrder, topicMode, pickedTopics]);

  function toggleSubject(m) {
    setSubjects((prev) => {
      if (prev.includes(m)) {
        const next = prev.filter((x) => x !== m);
        return next.length ? next : ["Chimica"];
      }
      return [...prev, m];
    });
  }

  function moveOrder(m, dir) {
    setCustomOrder((prev) => {
      const arr = prev.slice();
      const i = arr.indexOf(m);
      if (i === -1) return arr;
      const j = dir === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= arr.length) return arr;
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
      return arr;
    });
  }

  function setTopicAll(m, isAll) {
    setTopicMode((prev) => ({ ...prev, [m]: isAll ? "all" : "pick" }));
    if (isAll) setPickedTopics((prev) => ({ ...prev, [m]: [] }));
  }

  function toggleTopic(m, t) {
    setPickedTopics((prev) => {
      const cur = new Set(prev[m] || []);
      if (cur.has(t)) cur.delete(t);
      else cur.add(t);
      return { ...prev, [m]: Array.from(cur) };
    });
  }

  async function startExam() {
    if (starting) return;

    setErr("");
    setStarting(true);

    const duration_min = timedMode ? clampInt(durationMin, 5, 240, 30) : 0;

    const sections = effectiveOrder.map((materia) => ({
      materia,
      scelta: clampInt(sceltaCount, 0, 200, 20),
      completamento: clampInt(compCount, 0, 200, 10),
      tag: topicMode[materia] === "all" ? [] : (pickedTopics[materia] || []),
      difficolta: "Base",
    }));

    const body = {
      duration_min,
      sections,
      order: effectiveOrder,
    };

    // IMPORTANT: qui stai chiamando endpoint start.
    // Se uno risponde 405 (Method Not Allowed), significa che quell’endpoint esiste ma NON è POST.
    // Noi proviamo comunque tutti e ti mostriamo la risposta per capire qual è quello giusto.
    const candidates = [
      "/api/sim/start",
      "/api/sim/start/",
      "/api/simulazioni/start",
      "/api/simulazioni/start/",
    ];

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
            // 404: prova prossimo
            if (res.status === 404) continue;

            // altri errori: fermati (perché endpoint c’è ma payload/method non va)
            throw new Error(lastInfo);
          }

          // ok
          let data = null;
          try {
            data = txt ? JSON.parse(txt) : null;
          } catch {
            data = null;
          }

          if (!data || !data.session_id) {
            throw new Error(
              `Risposta OK ma non valida.\nMi aspettavo { session_id, ... }\n\n${lastInfo}`
            );
          }

          nav("/simulazioni/run", { state: { session: data } });
          return;
        } catch (inner) {
          // se non è 404, l’errore è “utile”: lo mostriamo e stoppiamo
          // perché vuol dire che abbiamo trovato l’endpoint ma c’è un mismatch (payload o method)
          const msg = inner?.message || String(inner);
          if (msg.includes("[404]")) continue;
          throw inner;
        }
      }

      // se arrivi qui, TUTTI 404
      setErr(
        "Endpoint start non trovato (404 su tutti).\n\n" +
          candidates.map((x) => `- ${x}`).join("\n") +
          "\n\nVerifica che in backend esista una route POST per avviare la sessione."
      );
    } catch (e) {
      setErr(e?.message || "Errore avvio prova");
    } finally {
      setStarting(false);
    }
  }

  const title = preset?.title || "Personalizza la prova";

  return (
    <main style={{ padding: 18, maxWidth: 1100, margin: "0 auto" }}>
      <style>{css}</style>

      <section className="dmBox">
        <div className="dmTop">
          <div>
            <div className="dmKicker">DinoMed • Simulazioni</div>
            <h1 className="dmH1">{title}</h1>
            <p className="dmP">Imposta materie, tempo e argomenti. Poi avvia: timer (se vuoi), correzione e spiegazioni.</p>
          </div>

          <div className="dmTopActions">
            <button className="dmBtn dmBtnGhost" onClick={() => nav("/simulazioni")} type="button">
              ← Indietro
            </button>
            <button className="dmBtn dmBtnPrimary" onClick={startExam} type="button" disabled={starting}>
              {starting ? "Avvio..." : "Avvia prova →"}
            </button>
          </div>
        </div>

        {err ? <div className="dmErr">⚠️ {err}</div> : null}

        <div className="dmGrid">
          {/* LEFT */}
          <div className="dmCard">
            <div className="dmCardTitle">Materie</div>
            <div className="dmCardHint">Seleziona 1 o più materie.</div>

            <div className="dmChips">
              {ALL_SUBJECTS.map((m) => (
                <button
                  key={m}
                  className={`dmChip ${subjects.includes(m) ? "dmChipOn" : ""}`}
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
                <div className="dmCardHint">Totali per materia</div>
                <input
                  className="dmInput"
                  type="number"
                  min="0"
                  max="200"
                  value={sceltaCount}
                  onChange={(e) => setSceltaCount(e.target.value)}
                />
              </div>

              <div>
                <div className="dmCardTitle">Completamento</div>
                <div className="dmCardHint">Totali per materia</div>
                <input
                  className="dmInput"
                  type="number"
                  min="0"
                  max="200"
                  value={compCount}
                  onChange={(e) => setCompCount(e.target.value)}
                />
              </div>
            </div>

            <div className="dmDivider" />

            <div className="dmRow2">
              <div>
                <div className="dmCardTitle">Tempo</div>
                <div className="dmCardHint">Timer reale oppure allenamento libero.</div>

                <div className="dmToggleRow">
                  <button className={`dmMini ${timedMode ? "dmMiniOn" : ""}`} onClick={() => setTimedMode(true)} type="button">
                    Con timer
                  </button>
                  <button className={`dmMini ${!timedMode ? "dmMiniOn" : ""}`} onClick={() => setTimedMode(false)} type="button">
                    Senza timer
                  </button>
                </div>

                {timedMode ? (
                  <div style={{ marginTop: 10 }}>
                    <input
                      className="dmInput"
                      type="number"
                      min="5"
                      max="240"
                      value={durationMin}
                      onChange={(e) => setDurationMin(e.target.value)}
                    />
                    <div className="dmTiny">Minuti (5–240)</div>
                  </div>
                ) : (
                  <div className="dmTiny" style={{ marginTop: 10 }}>
                    Nessun countdown: prova senza tempo.
                  </div>
                )}
              </div>

              <div>
                <div className="dmCardTitle">Ordine materie</div>
                <div className="dmCardHint">Default: Chimica → Fisica → Biologia</div>

                <div className="dmToggleRow">
                  <button
                    className={`dmMini ${orderMode === "default" ? "dmMiniOn" : ""}`}
                    onClick={() => setOrderMode("default")}
                    type="button"
                  >
                    Default
                  </button>
                  <button
                    className={`dmMini ${orderMode === "custom" ? "dmMiniOn" : ""}`}
                    onClick={() => setOrderMode("custom")}
                    type="button"
                  >
                    Scelgo io
                  </button>
                </div>

                {orderMode === "custom" ? (
                  <div className="dmOrderBox">
                    {/* ✅ FIX: qui ora usa customOrder davvero */}
                    {customOrder.filter((m) => subjects.includes(m)).map((m) => (
                      <div key={m} className="dmOrderRow">
                        <b>{m}</b>
                        <div className="dmOrderBtns">
                          <button className="dmOrderBtn" onClick={() => moveOrder(m, "up")} type="button">
                            ↑
                          </button>
                          <button className="dmOrderBtn" onClick={() => moveOrder(m, "down")} type="button">
                            ↓
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="dmTiny">Ordine finale nel recap a destra.</div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="dmCard dmSoft">
            <div className="dmCardTitle">Argomenti (per materia)</div>
            <div className="dmCardHint">Tutti oppure selezione manuale.</div>

            <div className="dmTopics">
              {effectiveOrder.map((m) => (
                <div key={m} className="dmTopicBlock">
                  <div className="dmTopicHead">
                    <b>{m}</b>
                    <div className="dmToggleRow">
                      <button
                        className={`dmMini ${topicMode[m] === "all" ? "dmMiniOn" : ""}`}
                        onClick={() => setTopicAll(m, true)}
                        type="button"
                      >
                        Tutti
                      </button>
                      <button
                        className={`dmMini ${topicMode[m] === "pick" ? "dmMiniOn" : ""}`}
                        onClick={() => setTopicAll(m, false)}
                        type="button"
                      >
                        Scelgo io
                      </button>
                    </div>
                  </div>

                  {topicMode[m] === "pick" ? (
                    <div className="dmTopicList">
                      {(TOPICS[m] || []).map((t) => {
                        const on = (pickedTopics[m] || []).includes(t);
                        return (
                          <button
                            key={t}
                            className={`dmTopicItem ${on ? "dmTopicOn" : ""}`}
                            onClick={() => toggleTopic(m, t)}
                            type="button"
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="dmTiny" style={{ marginTop: 8 }}>
                      Include tutti gli argomenti per {m}.
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="dmDivider" />

            <div className="dmCardTitle">Recap</div>
            <div className="dmRecap">
              <div className="dmRecapRow">
                <span className="dmRecapLbl">Tempo</span>
                <span className="dmRecapVal">{timedMode ? `${clampInt(durationMin, 5, 240, 30)} min` : "Senza timer"}</span>
              </div>
              <div className="dmRecapRow">
                <span className="dmRecapLbl">Ordine</span>
                <span className="dmRecapVal">{effectiveOrder.join(" → ")}</span>
              </div>
              <div className="dmRecapRow">
                <span className="dmRecapLbl">Per materia</span>
                <span className="dmRecapVal">
                  {sceltaCount} crocette + {compCount} completamento
                </span>
              </div>

              <div className="dmDivider" />

              {effectiveOrder.map((m) => (
                <div key={`rec-${m}`} style={{ marginTop: 10 }}>
                  <div className="dmRecapLbl" style={{ marginBottom: 6 }}>
                    {m} • Argomenti
                  </div>
                  <div className="dmPills">
                    {effectiveTopics[m] === "Tutti"
                      ? pill("Tutti")
                      : Array.isArray(effectiveTopics[m])
                      ? effectiveTopics[m].slice(0, 10).map((t) => pill(t))
                      : pill(String(effectiveTopics[m]))}
                    {Array.isArray(effectiveTopics[m]) && effectiveTopics[m].length > 10 ? pill(`+${effectiveTopics[m].length - 10}`) : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="dmDivider" />

            <button className="dmBtn dmBtnPrimary dmFull" onClick={startExam} type="button" disabled={starting}>
              {starting ? "Avvio..." : "Avvia prova →"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

/* =========================
   CSS
   ========================= */
const css = `
.dmBox{
  border:1px solid rgba(15,23,42,0.10);
  background:rgba(255,255,255,0.92);
  border-radius:22px;
  padding:18px;
  box-shadow:0 18px 55px rgba(15,23,42,0.06);
  position:relative;
  overflow:hidden;
}
.dmBox:before{
  content:"";
  position:absolute;
  inset:-140px -160px auto auto;
  width:460px; height:460px;
  background: radial-gradient(circle at 30% 30%, rgba(16,185,129,0.18), rgba(37,99,235,0.14), rgba(255,255,255,0));
  transform: rotate(12deg);
  pointer-events:none;            /* ✅ FIX CLICK */
  z-index:0;                      /* ✅ overlay dietro */
}
.dmTop, .dmGrid, .dmCard, .dmErr{ position:relative; z-index:1; } /* ✅ contenuto sopra */

.dmErr{
  margin-top:12px;
  padding:12px;
  border-radius:16px;
  border:1px solid rgba(239,68,68,0.35);
  background: rgba(239,68,68,0.08);
  font-weight:800;
  white-space: pre-wrap;
}

.dmTop{ display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:flex-end; }
.dmKicker{
  display:inline-flex; font-weight:950;
  padding:6px 10px; border-radius:999px;
  background:rgba(16,185,129,0.08);
  border:1px solid rgba(16,185,129,0.18);
}
.dmH1{ margin:10px 0 6px; font-size:34px; line-height:1.06; }
.dmP{ margin:0; color:rgba(15,23,42,0.68); font-weight:750; max-width:80ch; }
.dmTopActions{ display:flex; gap:10px; flex-wrap:wrap; }

.dmGrid{ margin-top:14px; display:grid; grid-template-columns: 1.15fr .85fr; gap:12px; }
@media(max-width:980px){ .dmGrid{ grid-template-columns:1fr; } .dmH1{ font-size:30px; } }

.dmCard{
  border-radius:18px;
  border:1px solid rgba(15,23,42,0.10);
  background:rgba(255,255,255,0.92);
  box-shadow:0 14px 40px rgba(15,23,42,0.06);
  padding:14px;
}
.dmSoft{ background: linear-gradient(180deg, rgba(37,99,235,0.05), rgba(255,255,255,0.92)); }
.dmCardTitle{ font-weight:950; font-size:16px; }
.dmCardHint{ margin-top:4px; color:rgba(15,23,42,0.60); font-weight:750; }

.dmDivider{ margin:14px 0; height:1px; background: rgba(15,23,42,0.08); }

.dmChips{ margin-top:10px; display:flex; gap:10px; flex-wrap:wrap; }
.dmChip{
  padding:10px 12px; border-radius:999px;
  border:1px solid rgba(15,23,42,0.14);
  background:white; font-weight:950; cursor:pointer;
  transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease;
}
.dmChip:hover{ transform: translateY(-1px); box-shadow:0 12px 30px rgba(15,23,42,0.10); border-color: rgba(37,99,235,0.22); }
.dmChipOn{ background: rgba(16,185,129,0.10); border-color: rgba(16,185,129,0.30); }

.dmRow2{ margin-top:10px; display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:10px; }
@media(max-width:560px){ .dmRow2{ grid-template-columns:1fr; } }
.dmInput{
  width:100%;
  margin-top:8px;
  padding:12px;
  border-radius:14px;
  border:1px solid rgba(15,23,42,0.14);
  background:white;
  font-weight:900;
  outline:none;
}

.dmToggleRow{ margin-top:10px; display:flex; gap:8px; flex-wrap:wrap; }
.dmMini{
  padding:8px 10px; border-radius:12px;
  border:1px solid rgba(15,23,42,0.14);
  background:white; font-weight:950; cursor:pointer;
}
.dmMiniOn{ background: rgba(37,99,235,0.08); border-color: rgba(37,99,235,0.24); }

.dmOrderBox{
  margin-top:10px;
  border-radius:16px;
  border:1px solid rgba(15,23,42,0.10);
  background:white;
  padding:10px;
}
.dmOrderRow{ display:flex; justify-content:space-between; align-items:center; gap:10px; padding:8px 6px; }
.dmOrderBtns{ display:flex; gap:8px; }
.dmOrderBtn{
  width:36px; height:32px;
  border-radius:10px;
  border:1px solid rgba(15,23,42,0.14);
  background: rgba(15,23,42,0.03);
  font-weight:1000;
  cursor:pointer;
}

.dmTopics{ margin-top:12px; display:grid; gap:12px; }
.dmTopicBlock{
  border-radius:16px;
  border:1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.92);
  padding:10px;
}
.dmTopicHead{ display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; align-items:center; }
.dmTopicList{
  margin-top:10px;
  display:flex;
  gap:8px;
  flex-wrap:wrap;
}
.dmTopicItem{
  padding:8px 10px;
  border-radius:999px;
  border:1px solid rgba(15,23,42,0.12);
  background:white;
  font-weight:900;
  color: rgba(15,23,42,0.82);
  cursor:pointer;
  transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease;
}
.dmTopicItem:hover{ transform: translateY(-1px); box-shadow:0 12px 30px rgba(15,23,42,0.10); border-color: rgba(16,185,129,0.22); }
.dmTopicOn{ background: rgba(16,185,129,0.10); border-color: rgba(16,185,129,0.30); }

.dmRecap{ margin-top:10px; }
.dmRecapRow{ display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; padding:8px 0; }
.dmRecapLbl{ font-size:12px; font-weight:950; color: rgba(15,23,42,0.60); }
.dmRecapVal{ font-weight:950; color: rgba(15,23,42,0.86); }

.dmPills{ display:flex; gap:8px; flex-wrap:wrap; }
.dmTiny{ margin-top:6px; font-size:12px; color: rgba(15,23,42,0.55); font-weight:800; }

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
  box-shadow:0 12px 30px rgba(15,23,42,0.12);
  transition: transform .18s ease, box-shadow .18s ease;
}
.dmBtnPrimary:hover{ transform: translateY(-1px); box-shadow:0 18px 45px rgba(15,23,42,0.18); }
.dmBtnGhost{
  background: white;
  border:1px solid rgba(15,23,42,0.14);
}
.dmFull{ width:100%; }
`;