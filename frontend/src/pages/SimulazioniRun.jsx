import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");

/* ---------------- localStorage history ---------------- */
const HISTORY_KEY = "dm_sim_history_v1";
function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function saveHistory(entry) {
  const prev = loadHistory();
  const next = [entry, ...prev].slice(0, 10);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

/* ---------------- helpers ---------------- */
function pad(n) {
  const x = Math.max(0, Number(n) || 0);
  return x < 10 ? `0${x}` : String(x);
}
function formatMMSS(totalSec) {
  const t = Math.max(0, Number(totalSec) || 0);
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${pad(m)}:${pad(s)}`;
}
function norm(s) {
  return String(s || "").trim().toLowerCase();
}
function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}
function clampInt(v, min, max, fallback) {
  const n = parseInt(String(v), 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

/* ---------------- page ---------------- */
export default function SimulazioniRun() {
  const nav = useNavigate();
  const loc = useLocation();

  // session arriva da SimulazioniConfig (normale) oppure da "rifai errori" (review)
  const session = loc.state?.session;
  const isReview = session?.mode === "review";

  // ✅ timer principale (modalità normale) – usa session.duration_min
  const [timeLeft, setTimeLeft] = useState(() => {
    const min = session?.duration_min ?? 20;
    return Math.max(0, min) * 60;
  });

  // ✅ timer review: selezionabile
  const [reviewTimedMode, setReviewTimedMode] = useState(false); // default: senza timer
  const [reviewDurationMin, setReviewDurationMin] = useState(15);
  const [reviewStarted, setReviewStarted] = useState(() => !isReview); // in normale: già started
  const [reviewTimeLeft, setReviewTimeLeft] = useState(() => 0);

  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(isReview ? true : false); // in review non si invia backend

  const [result, setResult] = useState(isReview ? session?.reviewResult || null : null);
  const [err, setErr] = useState("");

  const tickRef = useRef(null);

  // ✅ per tempo impiegato (modalità normale)
  const startedAtRef = useRef(null);
  const [elapsedSec, setElapsedSec] = useState(null);

  // ✅ in review: “correggi” per domanda (mostra spiegazione solo dopo click)
  const [checked, setChecked] = useState({}); // { [qid]: true }

  // guard
  useEffect(() => {
    if (!session?.questions || !Array.isArray(session?.questions)) {
      nav("/simulazioni", { replace: true });
    }
  }, [session, nav]);

  const questions = session?.questions || [];
  const total = questions.length;

  // avvio timer normale + start time
  useEffect(() => {
    if (!session?.session_id) return;
    if (submitted) return;
    if (isReview) return;

    // start time una sola volta
    if (!startedAtRef.current) startedAtRef.current = Date.now();

    tickRef.current = setInterval(() => {
      setTimeLeft((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);

    return () => clearInterval(tickRef.current);
  }, [session?.session_id, submitted, isReview]);

  // auto submit a tempo 0 (solo normale)
  useEffect(() => {
    if (!session?.session_id) return;
    if (submitted) return;
    if (isReview) return;
    if (timeLeft === 0) onSubmit(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, session?.session_id, submitted, isReview]);

  // ✅ review timer tick
  useEffect(() => {
    if (!isReview) return;
    if (!reviewStarted) return;
    if (!reviewTimedMode) return;

    tickRef.current = setInterval(() => {
      setReviewTimeLeft((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);

    return () => clearInterval(tickRef.current);
  }, [isReview, reviewStarted, reviewTimedMode]);

  // ✅ stop review quando finisce timer: blocca input (locked)
  const reviewLocked = isReview && reviewStarted && reviewTimedMode && reviewTimeLeft === 0;

  const answeredCount = useMemo(() => {
    let c = 0;
    for (const q of questions) {
      const a = answers[q.id];
      if (!a) continue;
      if (q.tipo === "scelta" && typeof a.answer_index === "number") c++;
      if (q.tipo === "completamento" && norm(a.answer_text).length > 0) c++;
    }
    return c;
  }, [answers, questions]);

  function setChoice(qid, idx) {
    setAnswers((prev) => ({ ...prev, [qid]: { tipo: "scelta", answer_index: idx } }));
  }
  function setFill(qid, text) {
    setAnswers((prev) => ({ ...prev, [qid]: { tipo: "completamento", answer_text: text } }));
  }

  async function onSubmit(auto = false) {
    if (!session?.session_id || submitted) return;

    clearInterval(tickRef.current);
    setSubmitting(true);
    setErr("");

    try {
      const payload = {
        answers: questions.map((q) => {
          const a = answers[q.id] || {};
          if (q.tipo === "scelta") {
            return { id: q.id, tipo: "scelta", answer_index: typeof a.answer_index === "number" ? a.answer_index : null };
          }
          return { id: q.id, tipo: "completamento", answer_text: (a.answer_text ?? "").toString() };
        }),
      };

      const res = await fetch(`${API_BASE}/api/sim/${session.session_id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Errore backend (${res.status})`);
      }

      const data = await res.json();
      setResult(data);
      setSubmitted(true);
      setSubmitting(false);

      // ✅ tempo impiegato
      const elapsed = startedAtRef.current ? Math.floor((Date.now() - startedAtRef.current) / 1000) : null;
      setElapsedSec(elapsed);

      // ✅ salva nello storico
      const entry = {
        id: session.session_id,
        at: new Date().toISOString(),
        total: data?.score?.total ?? total,
        correct: data?.score?.correct ?? null,
        percent: data?.score?.percent ?? null,
        duration_min: session.duration_min ?? 20,
        elapsed_sec: elapsed,
        summary: buildSummary(questions),
        wrongIds: (data?.results || []).filter((r) => !r.ok).map((r) => r.id),
      };
      saveHistory(entry);

      setTimeout(() => scrollToId("dm-results"), 200);
    } catch (e) {
      setErr(e.message || "Errore invio prova");
      setSubmitting(false);
      if (auto) setSubmitted(true);
    }
  }

  function reset() {
    nav("/simulazioni", { replace: true });
  }

  function retryWrong() {
    if (!result?.results) return;

    const wrongIds = result.results.filter((r) => !r.ok).map((r) => r.id);
    if (wrongIds.length === 0) {
      setErr("Nessun errore: prova perfetta 😄");
      return;
    }

    const wrongQuestions = questions.filter((q) => wrongIds.includes(q.id));
    const reviewMap = {};
    for (const r of result.results) reviewMap[r.id] = r;

    nav("/simulazioni/run", {
      state: {
        session: {
          mode: "review",
          session_id: "local-review",
          duration_min: 0,
          questions: wrongQuestions,
          reviewMap,
          reviewResult: result,
        },
      },
    });
setTimeout(() => window.scrollTo({ top: 0, behavior: "auto" }), 0);
  }

  // ✅ start review (con/ senza timer)
  function startReviewNow() {
    setErr("");
    setReviewStarted(true);

    if (reviewTimedMode) {
      const min = clampInt(reviewDurationMin, 5, 240, 15);
      setReviewTimeLeft(min * 60);
    } else {
      setReviewTimeLeft(0);
    }
  }

  function onCheckQuestion(qid) {
    setChecked((prev) => ({ ...prev, [qid]: true }));
    // se vuoi anche scroll, volendo:
    // scrollToId(`q-${qid}`);
  }

  return (
    <main className="dmRunPage">
      <style>{css}</style>

      {/* Top bar */}
      <div className="dmRunTop">
        <div className="dmRunLeft">
          <div className="dmKicker">{isReview ? "DinoMed • Rifai gli errori" : "DinoMed • Prova"}</div>
          <div className="dmRunMeta">
            <span className="dmPill">
              <b>{answeredCount}</b> / {total} risposte
            </span>

           
          </div>
        </div>

        <div className="dmRunRight">
          {!isReview ? (
            <div className={`dmTimer ${timeLeft <= 60 ? "dmTimerDanger" : ""}`}>⏱ {formatMMSS(timeLeft)}</div>
          ) : (
            <div className={`dmTimer ${reviewTimedMode && reviewStarted ? (reviewTimeLeft <= 60 ? "dmTimerDanger" : "") : "dmTimerSoft"}`}>
              {reviewTimedMode && reviewStarted ? <>⏱ {formatMMSS(reviewTimeLeft)}</> : <>🎯 Allenamento</>}
            </div>
          )}

          <button className="dmBtn dmBtnGhost" onClick={reset} type="button">
  Nuova prova
</button>
        </div>
      </div>

      {err ? <div className="dmAlert">⚠️ {err}</div> : null}

      {/* ✅ Review controls (timer sì/no + minuti) */}
      {isReview ? (
        <section className="dmReviewControls">
          <div className="dmReviewControlsHead">
            <div>
              <div className="dmReviewTitle">Allenamento errori</div>
              <div className="dmReviewHint">
                Modalità senza timer, Prenditi tutti il tempo che ti serve per riguardarti gli errori!
              </div>
            </div>

            {!reviewStarted ? (
              <button className="dmBtn dmBtnPrimary" onClick={startReviewNow} type="button">
                Inizia →
              </button>
            ) : (
              <span className="dmReviewStarted">{reviewLocked ? "Tempo scaduto" : "In corso"}</span>
            )}
          </div>

          <div className="dmReviewControlsGrid">
            <div className="dmReviewBox">
              <div className="dmBoxLbl">Timer</div>
              <div className="dmToggleRow">
                <button
                  className={`dmMini ${reviewTimedMode ? "dmMiniOn" : ""}`}
                  onClick={() => !reviewStarted && setReviewTimedMode(true)}
                  type="button"
                >
               ♾️
                </button>
                <button
                  className={`dmMini ${!reviewTimedMode ? "dmMiniOn" : ""}`}
                  onClick={() => !reviewStarted && setReviewTimedMode(false)}
                  type="button"
                >
                  Senza timer
                </button>
              </div>

              {reviewTimedMode ? (
                <div style={{ marginTop: 10 }}>
                  <input
                    className="dmInput"
                    type="number"
                    min="5"
                    max="240"
                    value={reviewDurationMin}
                    onChange={(e) => !reviewStarted && setReviewDurationMin(e.target.value)}
                    disabled={reviewStarted}
                  />
                  <div className="dmTiny">Minuti (5–240)</div>
                </div>
              ) : (
                <div className="dmTiny" style={{ marginTop: 10 }}>
                  Nessun countdown: fai gli errori con calma.
                </div>
              )}
            </div>

            <div className="dmReviewBox">
              <div className="dmBoxLbl">Regola</div>
              <div className="dmTiny" style={{ marginTop: 6 }}>
                In questa modalità <b>non appare nulla</b> finché non premi <b>Correggi</b> sulla domanda.
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Questions */}
      <section className="dmRunGrid">
        {questions.map((q, idx) => (
          <QuestionCard
            key={q.id}
            q={q}
            idx={idx}
            answer={answers[q.id]}
            onChoice={setChoice}
            onFill={setFill}
            locked={isReview ? (!reviewStarted || reviewLocked) : false}
            isReview={isReview}
            reviewRow={isReview ? (session?.reviewMap?.[q.id] || null) : null}
            resultRow={!isReview ? result?.results?.find((r) => r.id === q.id) : null}
            checked={!!checked[q.id]}
            onCheck={() => onCheckQuestion(q.id)}
          />
        ))}
      </section>

      {/* Results (solo normale) */}
      {!isReview && submitted ? (
        <section id="dm-results" className="dmResults">
          <div className="dmResultsHead">
            <h2 className="dmH2">Risultati</h2>

            <div className="dmScoreWrap">
              {result?.score ? (
                <div className="dmScore">
                  ✅ <b>{result.score.correct}</b> / {result.score.total} — <b>{result.score.percent}%</b>
                </div>
              ) : (
                <div className="dmScore">Risultati non disponibili</div>
              )}

              {/* ✅ tempo impiegato */}
              <div className="dmScore dmScoreSoft">
                ⏱ Tempo: <b>{elapsedSec == null ? "—" : formatMMSS(elapsedSec)}</b>
              </div>
            </div>
          </div>

          <div className="dmResultsHint">
            Ora puoi fare la cosa più premium: <b>rifare solo gli errori</b>.
          </div>

          <div className="dmActionsRow">
            <button className="dmBtn dmBtnPrimary" onClick={retryWrong} type="button">
              Rifai gli errori →
            </button>
            <button className="dmBtn dmBtnGhost" onClick={reset} type="button">
              Torna alle simulazioni
            </button>
          </div>

          <div className="dmResultsList">
            {(result?.results || []).map((r, i) => (
              <div key={r.id} className={`dmResRow ${r.ok ? "dmOk" : "dmKo"}`}>
                <div className="dmResTop">
                  <div className="dmResTitle">
                    {r.ok ? "✅" : "❌"} Domanda {i + 1} • {r.materia} • {r.tipo}
                  </div>
                  <button className="dmMiniBtn" onClick={() => scrollToId(`q-${r.id}`)} type="button">
                    Vai su →
                  </button>
                </div>

                <div className="dmResText">{r.testo}</div>

                <div className="dmResGrid">
                  <div className="dmResBox">
                    <div className="dmResLbl">La tua risposta</div>
                    <div className="dmResVal">{String(r.your_answer ?? "—")}</div>
                  </div>
                  <div className="dmResBox">
                    <div className="dmResLbl">Corretta</div>
                    <div className="dmResVal">{String(r.correct_answer ?? "—")}</div>
                  </div>
                </div>

                <div className="dmExplain">
                  <div className="dmResLbl">Spiegazione</div>
                  <div className="dmExplainText">{r.spiegazione || "—"}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="dmBottomSpacer" />
      )}
{/* Bottom actions (fine pagina) */}
{!isReview && !submitted ? (
  <section className="dmBottomActions">
    <div className="dmBottomCard">
      <div className="dmBottomHint">
Ricordati di terminare solo se hai ricontrollato bene la prova!
      </div>

      <button
        className="dmBtn dmBtnPrimary dmBottomBtn"
        onClick={() => onSubmit(false)}
        disabled={submitting}
        type="button"
      >
        {submitting ? "Invio..." : "Termina prova"}
      </button>
    </div>
  </section>
) : null}
    </main>
  );
}

/* ---------------- components ---------------- */

function QuestionCard({ q, idx, answer, onChoice, onFill, locked, isReview, reviewRow, resultRow, checked, onCheck }) {
  const picked = typeof answer?.answer_index === "number" ? answer.answer_index : null;
  const fillText = answer?.answer_text ?? "";

  // ✅ in review: correttezza SOLO dopo “Correggi”
  let ok = null;
  if (isReview && checked && reviewRow) {
    if (q.tipo === "scelta") {
      if (typeof picked === "number") ok = picked === reviewRow.correct_answer;
      else ok = false;
    } else {
      ok = norm(fillText) && norm(fillText) === norm(reviewRow.correct_answer);
    }
  }

  // normale: mostra ok/ko quando arrivano risultati backend
  let normalOk = null;
  if (!isReview && resultRow) normalOk = !!resultRow.ok;

  const showReveal = isReview && checked && reviewRow;

  return (
    <article id={`q-${q.id}`} className={`dmQCard`}>
      <div className="dmQHead">
        <div className="dmQTitle">
          <span className="dmQNum">#{idx + 1}</span>
          <span className="dmQMeta">
            {q.materia} • {q.tipo}
          </span>
          {Array.isArray(q.tag) && q.tag.length ? <span className="dmTag">{q.tag[0]}</span> : null}
        </div>

        {isReview && showReveal ? (
          <span className={`dmStatus ${ok ? "dmStatusOk" : "dmStatusKo"}`}>{ok ? "Corretta" : "Sbagliata"}</span>
        ) : null}

        {!isReview && normalOk !== null ? (
          <span className={`dmStatus ${normalOk ? "dmStatusOk" : "dmStatusKo"}`}>{normalOk ? "Corretta" : "Sbagliata"}</span>
        ) : null}
      </div>

      <div className="dmQText">{q.testo}</div>

      {q.tipo === "scelta" ? (
        <div className="dmOpts">
          {(q.opzioni || []).map((opt, i) => {
            const selected = picked === i;

            // ✅ review: evidenzia SOLO dopo "Correggi"
            const showOk = showReveal && typeof reviewRow?.correct_answer === "number" && i === reviewRow.correct_answer;
            const showKo = showReveal && typeof picked === "number" && selected && picked !== reviewRow.correct_answer;

            return (
              <button
                key={i}
                className={`dmOpt ${selected ? "dmOptSel" : ""} ${showOk ? "dmOptOk" : ""} ${showKo ? "dmOptKo" : ""}`}
                onClick={() => !locked && onChoice(q.id, i)}
                type="button"
              >
                <span className="dmOptKey">{String.fromCharCode(65 + i)}</span>
                <span className="dmOptText">{opt}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {q.tipo === "completamento" ? (
        <div className="dmFill">
          <input
            className="dmFillInput"
            placeholder="Scrivi una parola (completamento)"
            value={fillText}
            onChange={(e) => !locked && onFill(q.id, e.target.value)}
            disabled={locked}
          />
          <div className="dmSmallHint">Suggerimento: 1 parola, senza frasi.</div>
        </div>
      ) : null}

      {/* ✅ review: bottone Correggi + reveal */}
      {isReview ? (
        <div className="dmCheckRow">
          <button className="dmMiniBtn" onClick={onCheck} type="button" disabled={!reviewRow}>
            Correggi
          </button>

          {showReveal ? (
            <div className="dmReviewBox">
              <div className="dmResLbl">Risposta corretta</div>
              <div className="dmResVal">{String(reviewRow.correct_answer ?? "—")}</div>
              <div className="dmResLbl" style={{ marginTop: 8 }}>
                Spiegazione
              </div>
              <div className="dmExplainText">{reviewRow.spiegazione || "—"}</div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* normale: niente reveal extra (già sotto “Risultati”) */}
    </article>
  );
}

function buildSummary(questions) {
  const by = {};
  for (const q of questions) {
    const k = q.materia || "Altro";
    by[k] = (by[k] || 0) + 1;
  }
  return by;
}

/* ---------------- CSS ---------------- */
const css = `
:root{
  --dm-header-h: 72px; /* metti qui l’altezza reale del tuo SiteHeader */
}

.dmRunPage{ padding:18px; max-width:1100px; margin:0 auto; }

.dmRunTop{
position: relative;
}

.dmBottomActions{
  margin-top: 14px;
  padding-bottom: 30px;
}

.dmBottomCard{
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.92);
  box-shadow: 0 14px 40px rgba(15,23,42,0.06);
  padding: 14px;
  display:flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.dmBottomHint{
  font-weight: 850;
  color: rgba(15,23,42,0.70);
}

.dmBottomBtn{
  min-width: 200px;
}

/* ✅ su schermi piccoli NON resta incollata */
@media (max-width: 900px){
.dmRunTop{
  position: sticky;
  top: calc(var(--dm-header-h, 72px) + 10px); /* ✅ sta sotto l'header */
  z-index: 30; /* ✅ sotto all’header */
  display:flex;
  justify-content:space-between;
  gap:12px;
  flex-wrap:wrap;
  align-items:flex-end;
  border-radius:18px;
  border:1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.92);
  box-shadow: 0 16px 50px rgba(15,23,42,0.08);
  padding: 12px;
  backdrop-filter: blur(10px);
}
}
.dmKicker{
  display:inline-flex; font-weight:950;
  padding:6px 10px; border-radius:999px;
  background:rgba(16,185,129,0.08);
  border:1px solid rgba(16,185,129,0.18);
}
.dmRunMeta{ display:flex; gap:8px; flex-wrap:wrap; margin-top:8px; }
.dmPill{
  display:inline-flex; gap:6px; align-items:center;
  padding:6px 10px; border-radius:999px;
  border:1px solid rgba(15,23,42,0.12);
  background: rgba(15,23,42,0.03);
  font-weight:900; color: rgba(15,23,42,0.82);
}
.dmPillSoft{ color: rgba(15,23,42,0.60); }
.dmMono{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono","Courier New", monospace; }

.dmRunRight{ display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
.dmTimer{
  padding:10px 12px; border-radius:14px;
  border:1px solid rgba(15,23,42,0.14);
  background:white;
  font-weight:1000;
  box-shadow: 0 10px 25px rgba(15,23,42,0.05);
}
.dmTimerSoft{
  border-color: rgba(37,99,235,0.20);
  background: rgba(37,99,235,0.06);
}
.dmTimerDanger{
  border-color: rgba(239,68,68,0.35);
  background: rgba(239,68,68,0.06);
}
.dmBtn{
  padding:10px 12px; border-radius:14px;
  font-weight:950; border:none; cursor:pointer;
}
.dmBtnPrimary{
  background: rgba(15,23,42,0.92);
  color: white;
  box-shadow: 0 12px 30px rgba(15,23,42,0.12);
  transition: transform .18s ease, box-shadow .18s ease;
}
.dmBtnPrimary:hover{ transform: translateY(-1px); box-shadow:0 18px 45px rgba(15,23,42,0.18); }
.dmBtnGhost{
  background: white;
  border: 1px solid rgba(15,23,42,0.14);
}

.dmAlert{
  margin-top:12px; padding:12px; border-radius:16px;
  border:1px solid rgba(239,68,68,0.35);
  background: rgba(239,68,68,0.08);
  font-weight:800;
}

.dmReviewControls{
  margin-top: 12px;
  border-radius: 22px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.92);
  box-shadow: 0 18px 55px rgba(15,23,42,0.06);
  padding: 14px;
}
.dmReviewControlsHead{
  display:flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}
.dmReviewTitle{ font-weight: 1000; font-size: 16px; }
.dmReviewHint{ margin-top: 4px; color: rgba(15,23,42,0.62); font-weight: 800; }
.dmReviewStarted{
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.12);
  background: rgba(15,23,42,0.03);
  font-weight: 950;
  color: rgba(15,23,42,0.75);
}

.dmReviewControlsGrid{
  margin-top: 10px;
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
@media(max-width: 780px){ .dmReviewControlsGrid{ grid-template-columns: 1fr; } }
.dmReviewBox{
  border-radius: 16px;
  border: 1px solid rgba(15,23,42,0.10);
  background: white;
  padding: 10px;
}
.dmBoxLbl{ font-weight: 950; color: rgba(15,23,42,0.82); }

.dmRunGrid{
  margin-top: 12px;
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
}

.dmQCard{
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.92);
  box-shadow: 0 14px 40px rgba(15,23,42,0.06);
  padding: 14px;
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}
.dmQCard:hover{
  transform: translateY(-1px);
  box-shadow: 0 18px 55px rgba(15,23,42,0.10);
  border-color: rgba(37,99,235,0.18);
}

.dmQHead{
  display:flex; justify-content:space-between; gap:10px; align-items:center; flex-wrap:wrap;
}
.dmQTitle{ display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
.dmQNum{ font-weight:1000; color: rgba(15,23,42,0.92); }
.dmQMeta{ color: rgba(15,23,42,0.62); font-weight:850; }
.dmTag{
  font-size:12px; font-weight:950;
  padding:4px 8px; border-radius:999px;
  border:1px solid rgba(16,185,129,0.18);
  background: rgba(16,185,129,0.08);
}
.dmStatus{
  font-size:12px; font-weight:1000;
  padding:6px 10px; border-radius:999px;
  border:1px solid rgba(15,23,42,0.12);
}
.dmStatusOk{ border-color: rgba(16,185,129,0.25); background: rgba(16,185,129,0.10); }
.dmStatusKo{ border-color: rgba(239,68,68,0.25); background: rgba(239,68,68,0.08); }

.dmQText{
  margin-top: 10px;
  font-weight: 800;
  color: rgba(15,23,42,0.86);
  line-height: 1.35;
}

.dmOpts{ margin-top: 10px; display:grid; gap: 8px; }
.dmOpt{
  width: 100%;
  display:flex;
  gap: 10px;
  align-items:flex-start;
  text-align:left;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(15,23,42,0.12);
  background: white;
  cursor: pointer;
  transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease;
}
.dmOpt:hover{
  transform: translateY(-1px);
  box-shadow: 0 14px 35px rgba(15,23,42,0.10);
  border-color: rgba(37,99,235,0.18);
}
.dmOptSel{ border-color: rgba(37,99,235,0.35); background: rgba(37,99,235,0.06); }
.dmOptOk{ border-color: rgba(16,185,129,0.35); background: rgba(16,185,129,0.10); }
.dmOptKo{ border-color: rgba(239,68,68,0.30); background: rgba(239,68,68,0.08); }
.dmOptKey{
  width: 28px; height: 28px; border-radius: 10px;
  display:grid; place-items:center;
  border: 1px solid rgba(15,23,42,0.12);
  background: rgba(15,23,42,0.03);
  font-weight: 1000;
}
.dmOptText{ font-weight: 800; color: rgba(15,23,42,0.84); line-height: 1.3; }

.dmFill{ margin-top: 10px; }
.dmFillInput{
  width: 100%;
  padding: 12px 12px;
  border-radius: 14px;
  border: 1px solid rgba(15,23,42,0.14);
  outline: none;
  font-weight: 900;
}
.dmSmallHint{ margin-top: 6px; font-size: 12px; color: rgba(15,23,42,0.55); font-weight: 800; }

.dmCheckRow{ margin-top: 10px; display:grid; gap: 10px; }

.dmReviewBox{
  border-radius: 16px;
  border: 1px solid rgba(37,99,235,0.14);
  background: rgba(37,99,235,0.05);
  padding: 10px;
}
.dmResLbl{ font-size: 12px; color: rgba(15,23,42,0.60); font-weight: 950; }
.dmResVal{ margin-top: 4px; font-weight: 950; color: rgba(15,23,42,0.86); }
.dmExplainText{ margin-top: 6px; color: rgba(15,23,42,0.78); font-weight: 800; line-height: 1.35; }

.dmResults{
  margin-top: 14px;
  border-radius: 22px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.92);
  box-shadow: 0 18px 55px rgba(15,23,42,0.06);
  padding: 16px;
}
.dmResultsHead{ display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:baseline; }
.dmH2{ margin: 0; }
.dmScoreWrap{ display:flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.dmScore{
  font-weight: 1000;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(16,185,129,0.22);
  background: rgba(16,185,129,0.10);
}
.dmScoreSoft{
  border-color: rgba(15,23,42,0.14);
  background: rgba(15,23,42,0.03);
  color: rgba(15,23,42,0.78);
}
.dmResultsHint{ margin-top: 8px; color: rgba(15,23,42,0.62); font-weight: 800; }

.dmActionsRow{
  margin-top: 12px;
  display:flex;
  gap:10px;
  flex-wrap:wrap;
}

.dmResultsList{ margin-top: 12px; display:grid; gap: 10px; }
.dmResRow{ border-radius: 18px; border: 1px solid rgba(15,23,42,0.10); background: white; padding: 12px; }
.dmOk{ border-color: rgba(16,185,129,0.25); }
.dmKo{ border-color: rgba(239,68,68,0.25); }
.dmResTop{ display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; align-items:center; }
.dmResTitle{ font-weight: 1000; color: rgba(15,23,42,0.88); }
.dmMiniBtn{
  padding: 8px 10px; border-radius: 12px;
  border: 1px solid rgba(15,23,42,0.14);
  background: white; font-weight: 950; cursor: pointer;
}
.dmResText{ margin-top: 8px; font-weight: 800; color: rgba(15,23,42,0.82); line-height: 1.35; }

.dmToggleRow{ margin-top:10px; display:flex; gap:8px; flex-wrap:wrap; }
.dmMini{
  padding:8px 10px; border-radius:12px;
  border:1px solid rgba(15,23,42,0.14);
  background:white; font-weight:950; cursor:pointer;
}
.dmMiniOn{ background: rgba(37,99,235,0.08); border-color: rgba(37,99,235,0.24); }
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
.dmTiny{ margin-top:6px; font-size:12px; color: rgba(15,23,42,0.55); font-weight:800; }

.dmBottomSpacer{ height: 30px; }
`;