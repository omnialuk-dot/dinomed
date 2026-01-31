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

function makeDefaultCounts() {
  return {
    Chimica: { scelta: 15, completamento: 16 },
    Fisica: { scelta: 15, completamento: 16 },
    Biologia: { scelta: 15, completamento: 16 },
  };
}

export default function SimulazioniConfig() {
  const nav = useNavigate();
  const location = useLocation();
  const preset = location?.state?.preset || null;

  const [err, setErr] = useState("");
  const [starting, setStarting] = useState(false);

  /* ==============
     STEP 1 Materie
     ============== */
  const [subjects, setSubjects] = useState(() => {
    if (preset?.sections?.length) {
      const picked = uniq(preset.sections.map((s) => s.materia)).filter((m) => ALL_SUBJECTS.includes(m));
      return picked.length ? picked : ["Chimica"];
    }
    return ["Chimica"];
  });

  function toggleSubject(m) {
    setSubjects((prev) => {
      const on = prev.includes(m);
      const next = on ? prev.filter((x) => x !== m) : [...prev, m];
      return next.length ? next : prev; // evita zero materie
    });
  }

  const order = useMemo(() => {
    const base = ["Chimica", "Fisica", "Biologia"];
    return base.filter((m) => subjects.includes(m));
  }, [subjects]);

  /* ==================
     STEP 2 Timer (globale)
     ================== */
  const [timedMode, setTimedMode] = useState(true);
  const [durationMin, setDurationMin] = useState(45);

  /* ==============================
     STEP 2 Formato per materia
     ============================== */
  const [countsBySubject, setCountsBySubject] = useState(() => {
    const base = makeDefaultCounts();
    if (preset?.sections?.length) {
      for (const s of preset.sections) {
        if (!s?.materia || !ALL_SUBJECTS.includes(s.materia)) continue;
        base[s.materia] = {
          scelta: clampInt(s.scelta, 0, 200, base[s.materia].scelta),
          completamento: clampInt(s.completamento, 0, 200, base[s.materia].completamento),
        };
      }
    }
    return base;
  });

  // target del pannello formato: ALL o una materia (solo tra quelle selezionate)
  const [formatTarget, setFormatTarget] = useState("ALL"); // "ALL" | materia

  const targetOptions = useMemo(() => ["ALL", ...order], [order]);

  // se togli una materia e il target diventa invalido, torna su ALL
  useMemo(() => {
    if (formatTarget !== "ALL" && !order.includes(formatTarget)) setFormatTarget("ALL");
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  function setCountsFor(target, patch) {
    setCountsBySubject((prev) => {
      const next = { ...prev };
      if (target === "ALL") {
        for (const m of order) {
          const cur = next[m] || { scelta: 15, completamento: 16 };
          next[m] = {
            scelta: patch.scelta != null ? patch.scelta : cur.scelta,
            completamento: patch.completamento != null ? patch.completamento : cur.completamento,
          };
        }
      } else {
        const m = target;
        const cur = next[m] || { scelta: 15, completamento: 16 };
        next[m] = {
          scelta: patch.scelta != null ? patch.scelta : cur.scelta,
          completamento: patch.completamento != null ? patch.completamento : cur.completamento,
        };
      }
      return next;
    });
  }

  const allSameFormat = useMemo(() => {
    if (order.length <= 1) return true;
    const first = countsBySubject[order[0]] || { scelta: 15, completamento: 16 };
    return order.every((m) => {
      const c = countsBySubject[m] || { scelta: 15, completamento: 16 };
      return c.scelta === first.scelta && c.completamento === first.completamento;
    });
  }, [order, countsBySubject]);

  const shownCounts = useMemo(() => {
    if (formatTarget === "ALL") {
      if (!order.length) return { scelta: 15, completamento: 16, mixed: false };
      if (allSameFormat) {
        const c0 = countsBySubject[order[0]] || { scelta: 15, completamento: 16 };
        return { scelta: c0.scelta, completamento: c0.completamento, mixed: false };
      }
      const c0 = countsBySubject[order[0]] || { scelta: 15, completamento: 16 };
      return { scelta: c0.scelta, completamento: c0.completamento, mixed: true };
    }
    const c = countsBySubject[formatTarget] || { scelta: 15, completamento: 16 };
    return { scelta: c.scelta, completamento: c.completamento, mixed: false };
  }, [formatTarget, order, allSameFormat, countsBySubject]);

  /* ==================
     STEP 3 Argomenti
     ================== */
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

  /* ==================
     Preset MUR (premi e vai)
     ================== */
  const [murPulse, setMurPulse] = useState(false);

  function applyMUR() {
    setTimedMode(true);
    setDurationMin(45);
    setCountsFor("ALL", { scelta: 15, completamento: 16 });

    // feedback chiaro che è stato applicato
    setMurPulse(true);
    window.setTimeout(() => setMurPulse(false), 900);
  }

  /* ==================
     Stats chip in alto
     ================== */
  const totalQuestions = useMemo(() => {
    let sum = 0;
    for (const m of order) {
      const c = countsBySubject[m] || { scelta: 15, completamento: 16 };
      sum += clampInt(c.scelta, 0, 200, 15) + clampInt(c.completamento, 0, 200, 16);
    }
    return sum;
  }, [order, countsBySubject]);

  const formatChip = useMemo(() => {
    const t = timedMode ? `${clampInt(durationMin, 5, 240, 45)} min` : "senza timer";
    if (!order.length) return `— • ${t}`;
    if (allSameFormat) {
      const c0 = countsBySubject[order[0]] || { scelta: 15, completamento: 16 };
      const s = clampInt(c0.scelta, 0, 200, 15);
      const c = clampInt(c0.completamento, 0, 200, 16);
      return `${s} crocette • ${c} completamento • ${t}`;
    }
    return `formato personalizzato • ${t}`;
  }, [order, allSameFormat, countsBySubject, timedMode, durationMin]);

  /* ==================
     START
     ================== */
  async function startExam() {
    if (starting) return;
    setErr("");

    if (!order.length) {
      setErr("Seleziona almeno 1 materia.");
      return;
    }

    if (totalQuestions <= 0) {
      setErr("Metti almeno 1 domanda (crocette o completamento).");
      return;
    }

    const duration_min = timedMode ? clampInt(durationMin, 5, 240, 45) : 0;

    const sections = order.map((materia) => {
      const c = countsBySubject[materia] || { scelta: 15, completamento: 16 };
      return {
        materia,
        scelta: clampInt(c.scelta, 0, 200, 15),
        completamento: clampInt(c.completamento, 0, 200, 16),
        tag: topicMode[materia] === "all" ? [] : pickedTopics[materia] || [],
        difficolta: "Base",
      };
    });

    const body = { duration_min, sections, order };

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

  // conteggio argomenti selezionati per materia
  const pickedCount = (m) => (pickedTopics[m] || []).length;

  return (
    <main className="scx">
      <style>{css}</style>

      {/* HERO */}
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

              <button className={`scx-btn scx-soft ${murPulse ? "isPulse" : ""}`} type="button" onClick={applyMUR}>
                Formato MUR 2025/26 {murPulse ? "✓" : ""}
              </button>
            </div>

            {err ? <div className="scx-err">{err}</div> : null}
          </div>

          <div className="scx-right" aria-hidden="true">
            <div className="scx-mini">
              <div className="scx-miniTitle">Suggerimento</div>
              <div className="scx-miniText">
                Se vuoi allenarti “come all’esame”, premi <b>Formato MUR</b> e avvia.
              </div>
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
              <div className="scx-cardSub">Timer globale + domande per singola materia.</div>
            </div>
          </div>

          {/* Timer (globale) */}
          <div className="scx-formatHeader">
            <div className="scx-formatLabel">Timer (vale per tutta la prova)</div>
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

          <div className="scx-grid">
            {/* Target: tutte / singola materia */}
            <div className="scx-field">
              <div className="scx-label">Applica a</div>
              <select
                className="scx-select"
                value={formatTarget}
                onChange={(e) => setFormatTarget(e.target.value)}
              >
                {targetOptions.map((t) => (
                  <option key={t} value={t}>
                    {t === "ALL" ? "Tutte le materie selezionate" : t}
                  </option>
                ))}
              </select>
              <div className="scx-hint">
                {formatTarget === "ALL"
                  ? order.length > 1
                    ? "Modifica tutte insieme"
                    : "Hai selezionato 1 materia"
                  : "Modifica solo questa materia"}
                {shownCounts.mixed && formatTarget === "ALL" ? " • (ora è personalizzato)" : ""}
              </div>
            </div>

            {/* Crocette */}
            <div className="scx-field">
              <div className="scx-label">Crocette</div>
              <input
                className="scx-input"
                type="number"
                min="0"
                max="200"
                value={shownCounts.scelta}
                onChange={(e) => setCountsFor(formatTarget, { scelta: clampInt(e.target.value, 0, 200, 15) })}
              />
            </div>

            {/* Completamento */}
            <div className="scx-field">
              <div className="scx-label">Completamento</div>
              <input
                className="scx-input"
                type="number"
                min="0"
                max="200"
                value={shownCounts.completamento}
                onChange={(e) =>
                  setCountsFor(formatTarget, { completamento: clampInt(e.target.value, 0, 200, 16) })
                }
              />
            </div>

            {/* Minuti */}
            <div className="scx-field">
              <div className="scx-label">Minuti</div>
              <input
                className={`scx-input ${!timedMode ? "isDashes" : ""}`}
                type="text"
                value={timedMode ? String(durationMin) : "— —"}
                onChange={(e) => {
                  if (!timedMode) return;
                  setDurationMin(clampInt(e.target.value, 5, 240, 45));
                }}
                disabled={!timedMode}
                inputMode={timedMode ? "numeric" : "none"}
              />
              <div className="scx-hint">{timedMode ? "5–240" : "timer spento"}</div>
            </div>
          </div>

          {/* mini riepilogo per materia (senza papiro) */}
          {order.length > 1 ? (
            <div className="scx-summary">
              {order.map((m) => {
                const c = countsBySubject[m] || { scelta: 15, completamento: 16 };
                return (
                  <div className="scx-sumPill" key={m}>
                    <span className="scx-sumName">{m}</span>
                    <span className="scx-sumSep">•</span>
                    <span className="scx-sumVal">
                      {c.scelta} + {c.completamento}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* STEP 3 */}
        <div className="scx-card scx-wide">
          <div className="scx-cardTop">
            <div className="scx-step">3</div>
            <div>
              <div className="scx-cardTitle">Filtra per argomento (facoltativo)</div>
              <div className="scx-cardSub">Se lasci “Tutti”, prende tutta la materia.</div>
            </div>
          </div>

          <div className="scx-topicWrap">
            {order.map((m) => {
              const mode = topicMode[m];
              const topics = TOPICS[m] || [];
              const picked = pickedTopics[m] || [];

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
                        Scelgo io {mode === "pick" ? `(${pickedCount(m)})` : ""}
                      </button>
                    </div>
                  </div>

                  {/* QUI: niente “Apri/Chiudi”. Se scelgo io -> lista subito */}
                  {mode === "pick" ? (
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
                    <div className="scx-topicFoot">✔ Tutti gli argomenti</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA BASSO (centrato + lungo) */}
        <div className="scx-bottomCta">
          <button className="scx-bottomBtn scx-primary" onClick={startExam} disabled={starting}>
            {starting ? "Avvio…" : "Avvia prova"} <span aria-hidden="true">→</span>
            <span className="scx-shine" aria-hidden="true" />
          </button>
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
.scx-soft.isPulse{
  transform: translateY(-1px);
  box-shadow: 0 18px 40px rgba(2,6,23,0.14);
  filter: saturate(1.06);
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

/* STEP 2 layout */
.scx-formatHeader{
  margin-top: 12px;
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.scx-formatLabel{
  font-weight: 950;
  color: rgba(15,23,42,0.78);
}

.scx-grid{ margin-top: 12px; display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px; }
@media (max-width: 980px){ .scx-grid{ grid-template-columns: 1fr 1fr; } }
@media (max-width: 560px){ .scx-grid{ grid-template-columns: 1fr; } }

.scx-field{ display:flex; flex-direction:column; gap: 6px; }
.scx-label{ font-weight: 950; color: rgba(15,23,42,0.76); }

.scx-input, .scx-select{
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.92);
  font-weight: 950;
  color: rgba(15,23,42,0.86);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
}
.scx-input:disabled{ opacity: .78; cursor:not-allowed; }
.scx-input.isDashes{ letter-spacing: .25em; text-align: center; font-weight: 1100; }

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

/* mini summary per materia */
.scx-summary{
  margin-top: 12px;
  display:flex;
  gap: 10px;
  flex-wrap: wrap;
}
.scx-sumPill{
  padding: 9px 11px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.74);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
  display:inline-flex;
  align-items:center;
  gap: 8px;
  font-weight: 950;
  color: rgba(15,23,42,0.78);
}
.scx-sumName{ color: rgba(15,23,42,0.86); }
.scx-sumSep{ opacity: .55; }
.scx-sumVal{ opacity: .85; }

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

/* BOTTOM CTA */
.scx-bottomCta{
  margin-top: 6px;
  display:flex;
  justify-content: center;
}
.scx-bottomBtn{
  position: relative;
  overflow:hidden;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap: 10px;
  width: min(720px, 100%);
  padding: 16px 18px;
  border-radius: 999px;
  font-weight: 1100;
  border: 1px solid rgba(255,255,255,0.18);
  box-shadow: 0 18px 60px rgba(2,6,23,0.12);
  cursor:pointer;
  color: white;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
}
.scx-bottomBtn:hover{ transform: translateY(-1px); box-shadow: 0 22px 70px rgba(2,6,23,0.14); filter: saturate(1.03); }
.scx-bottomBtn:disabled{ opacity:.70; cursor:not-allowed; }
`;