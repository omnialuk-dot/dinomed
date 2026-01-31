import { useMemo, useRef, useState } from "react";
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
function normalizeOrder(subjects, prevOrder) {
  const keep = (prevOrder || []).filter((m) => subjects.includes(m));
  const add = subjects.filter((m) => !keep.includes(m));
  return [...keep, ...add];
}

function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => clearTimeout(id));
}

function niceErr(e) {
  const msg = String(e?.message || e || "");
  if (msg.includes("AbortError")) return "Timeout: il server non risponde (12s).";
  if (msg.toLowerCase().includes("failed to fetch")) {
    return "Fetch fallita: possibile CORS / backend giù / URL errato / mixed-content (https → http).";
  }
  return msg || "Errore sconosciuto";
}
export default function SimulazioniConfig() {
  const nav = useNavigate();
  const location = useLocation();
  const preset = location?.state?.preset || null;

  const [err, setErr] = useState("");
  const [starting, setStarting] = useState(false);

  // preset MUR toggle (deve rimanere “selezionato” se attivo)
  const [murActive, setMurActive] = useState(false);

  // per evidenziare errori argomenti (scelgo io ma 0 selezionati)
  const [topicErrors, setTopicErrors] = useState({}); // { Chimica:true, ... }
  const topicCardRef = useRef({}); // refs per scroll

  // Materie (multi)
  const [subjects, setSubjects] = useState(() => {
    if (preset?.sections?.length) {
      const picked = uniq(preset.sections.map((s) => s.materia)).filter((m) => ALL_SUBJECTS.includes(m));
      return picked.length ? picked : ["Chimica"];
    }
    return ["Chimica"];
  });

  // Ordine materie (modificabile se >1)
  const [order, setOrder] = useState(() => normalizeOrder(subjects, ["Chimica", "Fisica", "Biologia"]));

  // Timer (universale)
  const [timedMode, setTimedMode] = useState(true);
  // range richiesto: 1–250
  const [durationMin, setDurationMin] = useState(45);

  // Conteggio domande PER MATERIA
  const [countsBySubject, setCountsBySubject] = useState(() => ({
    Chimica: { scelta: 15, completamento: 16 },
    Fisica: { scelta: 15, completamento: 16 },
    Biologia: { scelta: 15, completamento: 16 },
  }));

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

  // UI helper: modifica formato per “tutte” o per una materia
  const [formatScope, setFormatScope] = useState("Tutte"); // Tutte | Chimica | Fisica | Biologia

  const activeSubjects = useMemo(() => {
    const s = subjects.filter((m) => ALL_SUBJECTS.includes(m));
    return s.length ? s : ["Chimica"];
  }, [subjects]);

  const activeOrder = useMemo(() => normalizeOrder(activeSubjects, order), [activeSubjects, order]);

  function toggleSubject(m) {
    if (murActive) return; // con MUR attivo: materie fisse
    setSubjects((prev) => {
      const on = prev.includes(m);
      const next = on ? prev.filter((x) => x !== m) : [...prev, m];
      return next.length ? next : prev;
    });
  }

  function toggleMUR() {
    // Toggle vero: se è attivo → lo disattivi e torni libero
    if (murActive) {
      setMurActive(false);
      setErr("");
      return;
    }

    // Attiva preset + auto seleziona tutto
    setMurActive(true);
    const murSubjects = ["Chimica", "Fisica", "Biologia"];
    setSubjects(murSubjects);
    setOrder(murSubjects);

    // Domande MUR per ciascuna
    setCountsBySubject({
      Chimica: { scelta: 15, completamento: 16 },
      Fisica: { scelta: 15, completamento: 16 },
      Biologia: { scelta: 15, completamento: 16 },
    });

    // Timer resta modificabile (imposto default MUR)
    setTimedMode(true);
    // ✅ MUR: 135 minuti (2h15)
    setDurationMin(135);

    setErr("");
  }

  function moveOrder(m, dir) {
    setOrder((prev) => {
      const cur = normalizeOrder(activeSubjects, prev);
      const i = cur.indexOf(m);
      if (i < 0) return cur;
      const j = dir === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= cur.length) return cur;
      const next = [...cur];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  const totalQuestions = useMemo(() => {
    return activeOrder.reduce((sum, m) => {
      const sc = clampInt(countsBySubject[m]?.scelta ?? 0, 0, 99, 15);
      const co = clampInt(countsBySubject[m]?.completamento ?? 0, 0, 99, 16);
      return sum + sc + co;
    }, 0);
  }, [activeOrder, countsBySubject]);

  const formatChip = useMemo(() => {
    const t = timedMode ? `${clampInt(durationMin, 1, 250, 45)} min` : "senza timer";
    const first = activeOrder[0];
    const s = clampInt(countsBySubject[first]?.scelta ?? 15, 0, 99, 15);
    const c = clampInt(countsBySubject[first]?.completamento ?? 16, 0, 99, 16);
    const multi = activeOrder.length > 1 ? "• formato per materia" : "";
    return `${s} crocette • ${c} completamento • ${t} ${multi}`.trim();
  }, [activeOrder, countsBySubject, timedMode, durationMin]);

  function setCounts(scope, patch) {
    setCountsBySubject((prev) => {
      const next = { ...prev };
      const targets = scope === "Tutte" ? activeSubjects : [scope];

      for (const m of targets) {
        const cur = next[m] || { scelta: 15, completamento: 16 };
        next[m] = { ...cur, ...patch };
      }
      return next;
    });
  }

  function setTopicPick(m, t) {
    setPickedTopics((prev) => {
      const cur = prev[m] || [];
      const on = cur.includes(t);
      const next = on ? cur.filter((x) => x !== t) : [...cur, t];
      return { ...prev, [m]: next };
    });

    // appena seleziona 1 argomento → sparisce l’errore locale
    setTopicErrors((p) => {
      if (!p[m]) return p;
      const nn = { ...p };
      delete nn[m];
      return nn;
    });

    // e pulisco anche il banner rosso generale se era solo quello
    setErr((e) => (e.startsWith("Completa gli argomenti") ? "" : e));
  }

  async function startExam() {
    if (starting) return;
    setErr("");

    // reset errori argomenti
    setTopicErrors({});

    if (!activeOrder.length) {
      setErr("Seleziona almeno 1 materia, per continuare.");
      return;
    }

    // valida: ogni materia deve avere almeno 1 domanda
    for (const m of activeOrder) {
      const sc = clampInt(countsBySubject[m]?.scelta ?? 0, 0, 99, 15);
      const co = clampInt(countsBySubject[m]?.completamento ?? 0, 0, 99, 16);
      if (sc + co <= 0) {
        setErr(`In ${m} metti almeno 1 domanda (crocette o completamento).`);
        return;
      }
    }

    // valida: se “Scelgo io” → deve avere almeno 1 argomento selezionato
    const missing = [];
    for (const m of activeOrder) {
      if (topicMode[m] === "pick") {
        const picked = pickedTopics[m] || [];
        if (picked.length === 0) missing.push(m);
      }
    }
    if (missing.length) {
      const local = {};
      for (const m of missing) local[m] = true;
      setTopicErrors(local);

      // errore “chiaro” + scroll sulla prima materia che manca
      const first = missing[0];
      setErr(`Completa gli argomenti selezionati prima di avviare la prova. (${first})`);
      const el = topicCardRef.current?.[first];
      if (el && typeof el.scrollIntoView === "function") {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      }
      return;
    }

    const duration_min = timedMode ? clampInt(durationMin, 1, 250, 45) : 0;

    const sections = activeOrder.map((materia) => ({
      materia,
      scelta: clampInt(countsBySubject[materia]?.scelta ?? 15, 0, 99, 15),
      completamento: clampInt(countsBySubject[materia]?.completamento ?? 16, 0, 99, 16),
      tag: topicMode[materia] === "all" ? [] : pickedTopics[materia] || [],
      difficolta: "Base",
    }));

    const body = { duration_min, sections, order: activeOrder };

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
            throw new Error(txt || `Errore backend (${res.status})`);
          }

          let data = null;
          try {
            data = JSON.parse(txt);
          } catch {
            data = null;
          }

          const sessionId = data?.session_id || data?.id || data?.sessionId;

          // se backend non ritorna la struttura, evito crash
          if (!sessionId) throw new Error("Risposta OK ma manca session_id.\n" + lastInfo);

          // ✅ FIX IMPORTANTISSIMO: route corretta è /simulazioni/run (non /simulazioni/prova)
        nav(`/simulazioni/run?s=${encodeURIComponent(sessionId)}`, {
  state: { sessionId, config: body },
});

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

  const showOrder = activeOrder.length > 1;

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
              <span className="scx-chip">{activeOrder.length} materie</span>
              <span className="scx-chip">{totalQuestions} domande</span>
              <span className="scx-chip">{formatChip}</span>
            </div>

            <div className="scx-ctaRow">
              <button className="scx-btn scx-primary" onClick={startExam} disabled={starting}>
                {starting ? "Avvio…" : "Avvia prova"} <span aria-hidden="true">→</span>
                <span className="scx-shine" aria-hidden="true" />
              </button>

              <button
                className={`scx-btn scx-soft ${murActive ? "isActive" : ""}`}
                type="button"
                onClick={toggleMUR}
              >
                Formato MUR 2025/26 {murActive ? "✓" : ""}
              </button>
            </div>

            {err ? <div className="scx-err">{err}</div> : null}
          </div>

          <div className="scx-right" aria-hidden="true">
            <div className="scx-mini">
              <div className="scx-miniTitle">Suggerimento</div>
              <div className="scx-miniText">
                Se vuoi allenarti “come all’esame”, premi <b>Formato MUR</b> e vai. Timer e argomenti li puoi comunque cambiare.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="scx-steps">
        {/* STEP 1 */}
        <div className="scx-card">
          <div className="scx-cardTop">
            <div className="scx-step">1</div>
            <div>
              <div className="scx-cardTitle">Scegli le materie</div>
              <div className="scx-cardSub">
                {murActive ? "Formato MUR attivo: materie bloccate (timer e argomenti restano liberi)." : "Puoi selezionarne anche 2 o 3."}
              </div>
            </div>
          </div>

          <div className="scx-pills">
            {ALL_SUBJECTS.map((m) => (
              <button
                key={m}
                type="button"
                className={`scx-pill ${activeSubjects.includes(m) ? "isOn" : ""} ${murActive ? "isLock" : ""}`}
                onClick={() => toggleSubject(m)}
                disabled={murActive}
                title={murActive ? "Formato MUR: materie fisse" : ""}
              >
                {m}
              </button>
            ))}
          </div>

          {/* ORDINE */}
          {showOrder && (
            <div className="scx-orderBox">
              <div className="scx-orderTitle">Ordine della prova</div>
              <div className="scx-orderSub">Scegli con che materia partire (↑ ↓).</div>

              <div className="scx-orderList">
                {activeOrder.map((m, idx) => (
                  <div className="scx-orderRow" key={m}>
                    <div className="scx-orderName">
                      <span className="scx-orderIdx">{idx + 1}</span>
                      {m}
                    </div>

                    <div className="scx-orderBtns">
                      <button
                        type="button"
                        className="scx-ordBtn"
                        onClick={() => moveOrder(m, "up")}
                        disabled={idx === 0}
                        aria-label={`Sposta su ${m}`}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="scx-ordBtn"
                        onClick={() => moveOrder(m, "down")}
                        disabled={idx === activeOrder.length - 1}
                        aria-label={`Sposta giù ${m}`}
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* STEP 2 */}
        <div className="scx-card">
          <div className="scx-cardTop">
            <div className="scx-step">2</div>
            <div>
              <div className="scx-cardTitle">Imposta il formato</div>
              <div className="scx-cardSub">
                {murActive ? "Formato MUR: domande bloccate a 15+16. Timer modificabile." : "Timer e numero domande (anche per singola materia)."}
              </div>
            </div>
          </div>

          {/* SCOPE formato */}
          <div className="scx-scopeRow">
            <div className="scx-scopeLabel">Modifica formato per:</div>
            <select
              className="scx-select"
              value={formatScope}
              onChange={(e) => setFormatScope(e.target.value)}
              disabled={murActive}
              title={murActive ? "Formato MUR: numero domande bloccato" : ""}
            >
              <option value="Tutte">Tutte le materie</option>
              {activeOrder.map((m) => (
                <option key={m} value={m}>
                  Solo {m}
                </option>
              ))}
            </select>
          </div>

          <div className="scx-grid">
            <div className="scx-field">
              <div className="scx-label">Crocette</div>
              <input
                className="scx-input"
                type="number"
                min="0"
                max="99"
                value={countsBySubject[formatScope === "Tutte" ? activeOrder[0] : formatScope]?.scelta ?? 15}
                onChange={(e) => setCounts(formatScope, { scelta: clampInt(e.target.value, 0, 99, 15) })}
                disabled={murActive}
              />
            </div>

            <div className="scx-field">
              <div className="scx-label">Completamento</div>
              <input
                className="scx-input"
                type="number"
                min="0"
                max="99"
                value={countsBySubject[formatScope === "Tutte" ? activeOrder[0] : formatScope]?.completamento ?? 16}
                onChange={(e) => setCounts(formatScope, { completamento: clampInt(e.target.value, 0, 99, 16) })}
                disabled={murActive}
              />
            </div>

            <div className="scx-field">
              <div className="scx-label">Timer</div>
              <div className="scx-toggleRow">
                <button type="button" className={`scx-miniBtn ${timedMode ? "isOn" : ""}`} onClick={() => setTimedMode(true)}>
                  On
                </button>
                <button type="button" className={`scx-miniBtn ${!timedMode ? "isOn" : ""}`} onClick={() => setTimedMode(false)}>
                  Off
                </button>
              </div>
            </div>

            <div className="scx-field">
              <div className="scx-label">Minuti</div>
              <input
                className="scx-input"
                type="number"
                min="1"
                max="250"
                value={timedMode ? durationMin : ""}
                placeholder={timedMode ? "" : "— —"}
                onChange={(e) => setDurationMin(clampInt(e.target.value, 1, 250, 45))}
                disabled={!timedMode}
              />
              <div className="scx-hint">{timedMode ? "1–250" : "timer spento"}</div>
            </div>
          </div>

          {/* Riassunto mini per materia */}
          {activeOrder.length > 1 && (
            <div className="scx-summary">
              {activeOrder.map((m) => {
                const sc = countsBySubject[m]?.scelta ?? 15;
                const co = countsBySubject[m]?.completamento ?? 16;
                return (
                  <div className="scx-sumRow" key={m}>
                    <div className="scx-sumName">{m}</div>
                    <div className="scx-sumVal">
                      {sc} crocette • {co} completamento
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
            {activeOrder.map((m) => {
              const mode = topicMode[m];
              const topics = TOPICS[m] || [];
              const picked = pickedTopics[m] || [];
              const pickedCount = picked.length;
              const showLocalErr = Boolean(topicErrors[m]);

              return (
                <div
                  className={`scx-topicCard ${showLocalErr ? "isErr" : ""}`}
                  key={m}
                  ref={(el) => (topicCardRef.current[m] = el)}
                >
                  <div className="scx-topicHead">
                    <div className="scx-topicName">{m}</div>

                    <div className="scx-topicActions">
                      <button
                        type="button"
                        className={`scx-miniBtn ${mode === "all" ? "isOn" : ""}`}
                        onClick={() => {
                          // ✅ se passo a "Tutti":
                          // 1) non devo più mostrare l'errore "Completa gli argomenti..."
                          // 2) non deve restare l'errore locale
                          // 3) tengo pulito lo state dei pick (così non rimane memoria "fantasma")
                          setTopicMode((p) => ({ ...p, [m]: "all" }));
                          setPickedTopics((pt) => ({ ...pt, [m]: [] }));
                          setTopicErrors((pe) => {
                            if (!pe[m]) return pe;
                            const nn = { ...pe };
                            delete nn[m];
                            return nn;
                          });
                          setErr((e) => (e.startsWith("Completa gli argomenti") ? "" : e));
                        }}
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

                      {mode === "pick" && (
                        <span className="scx-pickedPill">
                          Selezionati: <b>{pickedCount}</b>
                        </span>
                      )}
                    </div>
                  </div>

                  {mode === "pick" ? (
                    <>
                      {showLocalErr && (
                        <div className="scx-localErr">
                          Hai scelto <b>Scelgo io</b>, ma non hai selezionato nessun argomento in <b>{m}</b>.
                        </div>
                      )}

                      <div className="scx-topicList">
                        {topics.map((t) => {
                          const on = picked.includes(t);
                          return (
                            <button
                              key={t}
                              type="button"
                              className={`scx-topic ${on ? "isOn" : ""}`}
                              onClick={() => setTopicPick(m, t)}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="scx-topicFoot">✔ Tutti gli argomenti</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTONE FINALE */}
        <div className="scx-bottom">
          <button className="scx-btn scx-primary scx-bottomBtn" onClick={startExam} disabled={starting}>
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
.scx-soft.isActive{
  border-color: rgba(34,197,94,0.30);
  box-shadow: 0 16px 44px rgba(2,6,23,0.12);
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
}
.scx-pill.isOn{
  border-color: rgba(34,197,94,0.35);
  background: linear-gradient(135deg, rgba(34,197,94,0.14), rgba(56,189,248,0.14));
}
.scx-pill.isLock{ opacity: .92; }

/* ORDER BOX */
.scx-orderBox{
  margin-top: 14px;
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.72);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
  padding: 12px;
}
.scx-orderTitle{ font-weight: 1100; color: rgba(15,23,42,0.90); }
.scx-orderSub{ margin-top: 6px; font-weight: 850; color: rgba(15,23,42,0.70); }

.scx-orderList{ margin-top: 10px; display:grid; gap: 8px; }
.scx-orderRow{
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 10px;
  border-radius: 14px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.82);
}
.scx-orderName{ display:flex; align-items:center; gap: 10px; font-weight: 950; color: rgba(15,23,42,0.86); }
.scx-orderIdx{
  width: 26px; height: 26px; border-radius: 10px;
  display:grid; place-items:center;
  border: 1px solid rgba(15,23,42,0.10);
  background: linear-gradient(135deg, rgba(34,197,94,0.10), rgba(56,189,248,0.10));
  font-weight: 1100;
}
.scx-orderBtns{ display:flex; gap: 8px; }
.scx-ordBtn{
  width: 34px; height: 34px;
  border-radius: 12px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.86);
  font-weight: 1100;
  cursor:pointer;
}
.scx-ordBtn:disabled{ opacity: .55; cursor:not-allowed; }

/* STEP 2 */
.scx-scopeRow{
  margin-top: 12px;
  display:flex;
  align-items:center;
  gap: 10px;
  flex-wrap: wrap;
}
.scx-scopeLabel{ font-weight: 950; color: rgba(15,23,42,0.78); }
.scx-select{
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.82);
  font-weight: 950;
  color: rgba(15,23,42,0.86);
}

.scx-grid{
  margin-top: 12px;
  display:grid;
  grid-template-columns: repeat(4, minmax(0,1fr));
  gap: 12px;
}
@media (max-width: 980px){
  .scx-grid{ grid-template-columns: repeat(2, minmax(0,1fr)); }
}
@media (max-width: 520px){
  .scx-grid{ grid-template-columns: 1fr; }
}

.scx-field{ display:flex; flex-direction: column; gap: 6px; }
.scx-label{ font-weight: 1000; color: rgba(15,23,42,0.80); }
.scx-input{
  padding: 12px 12px;
  border-radius: 14px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.92);
  font-weight: 1000;
  color: rgba(15,23,42,0.86);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
}
.scx-input:disabled{ background: rgba(255,255,255,0.60); color: rgba(15,23,42,0.55); }
.scx-hint{ font-weight: 850; color: rgba(15,23,42,0.62); }

.scx-toggleRow{ display:flex; gap: 8px; }
.scx-miniBtn{
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.78);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
  font-weight: 1000;
  color: rgba(15,23,42,0.82);
  cursor:pointer;
}
.scx-miniBtn.isOn{
  border-color: rgba(34,197,94,0.35);
  background: linear-gradient(135deg, rgba(34,197,94,0.14), rgba(56,189,248,0.14));
}

/* Summary */
.scx-summary{
  margin-top: 12px;
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.72);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
  padding: 12px;
  display:grid;
  gap: 8px;
}
.scx-sumRow{
  display:flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 10px;
  border-radius: 14px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.82);
}
.scx-sumName{ font-weight: 1000; color: rgba(15,23,42,0.88); }
.scx-sumVal{ font-weight: 900; color: rgba(15,23,42,0.70); }

/* TOPICS */
.scx-topicWrap{
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr;   /* ✅ una card per riga */
  gap: 12px;
}

/* se vuoi che su desktop resti comunque 1 colonna, non serve media query */
@media (max-width: 980px){
  .scx-topicWrap{ grid-template-columns: 1fr; }
}

.scx-topicCard{
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.76);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
  padding: 12px;
}
.scx-topicCard.isErr{
  border-color: rgba(185,28,28,0.22);
  background: rgba(185,28,28,0.04);
}

.scx-topicHead{
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.scx-topicName{ font-weight: 1100; color: rgba(15,23,42,0.90); }
.scx-topicActions{ display:flex; gap: 8px; align-items:center; flex-wrap: wrap; }

.scx-pickedPill{
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.86);
  font-weight: 900;
  color: rgba(15,23,42,0.70);
}

.scx-localErr{
  margin-top: 10px;
  padding: 10px 10px;
  border-radius: 14px;
  border: 1px solid rgba(185,28,28,0.22);
  background: rgba(185,28,28,0.06);
  color: #b91c1c;
  font-weight: 900;
}

.scx-topicList{
  margin-top: 10px;
  display:flex;
  flex-wrap: wrap;     /* ✅ vanno a capo */
  gap: 8px;
  width: 100%;
}

.scx-topic{
  padding: 10px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.86);
  font-weight: 900;
  color: rgba(15,23,42,0.78);
  cursor:pointer;
}
.scx-topic.isOn{
  border-color: rgba(34,197,94,0.35);
  background: linear-gradient(135deg, rgba(34,197,94,0.14), rgba(56,189,248,0.14));
  color: rgba(15,23,42,0.88);
}

.scx-topicFoot{
  margin-top: 10px;
  font-weight: 900;
  color: rgba(15,23,42,0.70);
}

/* Bottom CTA */
.scx-bottom{
  margin-top: 2px;
  display:flex;
  justify-content: center;
}
.scx-bottomBtn{
  width: min(720px, 100%);
  justify-content:center;
  padding: 16px 18px;
  font-size: 16px;
}
`;