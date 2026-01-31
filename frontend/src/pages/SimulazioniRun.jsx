import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");

function clampInt(v, min, max, fallback) {
  const n = parseInt(String(v), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function SimulazioniRun() {
  const nav = useNavigate();
  const location = useLocation();

  const sessionId = location?.state?.sessionId || "";
  const config = location?.state?.config || null;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qid]: { answer_index, answer_text } }

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  // Timer
  const startRef = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);

  const timed = Boolean(config?.duration_min && config.duration_min > 0);
  const durationSec = timed ? clampInt(config.duration_min, 1, 999, 45) * 60 : 0;
  const remaining = timed ? Math.max(0, durationSec - elapsed) : 0;

  useEffect(() => {
    if (!sessionId) {
      setErr("Sessione mancante. Torna alla configurazione e riprova.");
      setLoading(false);
      return;
    }

    let alive = true;
    setLoading(true);
    setErr("");

    fetch(`${API_BASE}/api/sim/${sessionId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then((data) => {
        if (!alive) return;
        setSession(data || null);
        setQuestions(Array.isArray(data?.questions) ? data.questions : []);
      })
      .catch(() => {
        if (!alive) return;
        setErr("Impossibile caricare la prova. Riprova.");
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [sessionId]);

  // Tick timer
  useEffect(() => {
    if (!timed || submitted) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 250);
    return () => clearInterval(t);
  }, [timed, submitted]);

  // Auto-submit allo scadere
  useEffect(() => {
    if (!timed || submitted) return;
    if (remaining <= 0 && !submitting && !submitted && questions.length) {
      submit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, timed, submitted, questions.length, submitting]);

  const total = questions.length;
  const q = questions[idx];

  // === scoring (MUR): +1 corretta, 0 omessa, -0.1 errata ===
  const omittedCount = useMemo(() => {
    if (!questions.length) return 0;
    let om = 0;
    for (const q of questions) {
      const a = answers[q.id];
      if (!a) {
        om++;
        continue;
      }
      if (q.type === "scelta") {
        if (a.answer_index === null || a.answer_index === undefined) om++;
      } else {
        const t = String(a.answer_text ?? "").trim();
        if (!t) om++;
      }
    }
    return om;
  }, [questions, answers]);

  const correctCount = useMemo(() => {
    if (!submitted || !result?.results) return 0;
    return result.results.filter((r) => r?.ok).length;
  }, [submitted, result]);

  const wrongCount = useMemo(() => {
    if (!questions.length) return 0;
    return Math.max(0, total - correctCount - omittedCount);
  }, [total, correctCount, omittedCount, questions.length]);

  const pointsRounded = useMemo(() => {
    const pts = correctCount - wrongCount * 0.1;
    return Math.round(pts * 10) / 10;
  }, [correctCount, wrongCount]);

  const score30Rounded = useMemo(() => {
    if (!total) return 0;
    const s30 = (pointsRounded / total) * 30;
    return Math.round(s30 * 10) / 10;
  }, [pointsRounded, total]);

  const percentRounded = useMemo(() => {
    if (!total) return 0;
    const pct = (correctCount / total) * 100;
    return Math.round(pct);
  }, [correctCount, total]);

  const breakdown = useMemo(() => {
    if (!submitted || !result?.results || !questions.length) return [];
    const byId = new Map(result.results.map((r) => [r.question_id, r]));
    const map = new Map();

    for (const q of questions) {
      const materia = q.materia || "Materia";
      if (!map.has(materia)) map.set(materia, { materia, correct: 0, wrong: 0, omitted: 0, total: 0 });
      const b = map.get(materia);
      b.total++;

      const a = answers[q.id];
      const isOmitted =
        !a ||
        (q.type === "scelta"
          ? a.answer_index === null || a.answer_index === undefined
          : !String(a.answer_text ?? "").trim());

      if (isOmitted) b.omitted++;

      const rr = byId.get(q.id);
      if (rr?.ok) b.correct++;
    }

    for (const b of map.values()) {
      b.wrong = Math.max(0, b.total - b.correct - b.omitted);
      const pts = b.correct - b.wrong * 0.1;
      b.points = Math.round(pts * 10) / 10;
      b.pct = b.total ? Math.round((b.correct / b.total) * 100) : 0;
    }
    return Array.from(map.values());
  }, [submitted, result, questions, answers]);

  function setChoice(qid, index) {
    setAnswers((p) => ({ ...p, [qid]: { answer_index: index, answer_text: null } }));
  }

  function setText(qid, txt) {
    setAnswers((p) => ({ ...p, [qid]: { answer_index: null, answer_text: txt } }));
  }

  function isAnswered(question) {
    const a = answers[question.id];
    if (!a) return false;
    if (question.type === "scelta") return a.answer_index !== null && a.answer_index !== undefined;
    return String(a.answer_text ?? "").trim().length > 0;
  }

  function go(i) {
    setIdx(Math.max(0, Math.min(total - 1, i)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    if (submitting || submitted) return;
    if (!sessionId) return;

    setErr("");
    setSubmitting(true);

    const payload = {
      answers: questions.map((q) => {
        const a = answers[q.id] || {};
        return {
          question_id: q.id,
          answer_index: a.answer_index ?? null,
          answer_text: a.answer_text ?? "",
        };
      }),
      elapsed_sec: elapsed,
    };

    try {
      const res = await fetch(`${API_BASE}/api/sim/${sessionId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      const txt = await res.text();
      if (!res.ok) throw new Error(txt || `HTTP ${res.status}`);

      let data = null;
      try {
        data = JSON.parse(txt);
      } catch {
        data = null;
      }

      setSubmitted(true);
      setResult(data);
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } catch (e) {
      setErr(String(e?.message || e || "Errore submit"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="dmr">
        <style>{css}</style>
        <div className="dm-shell">
          <div className="dm-loading">Caricamento prova…</div>
        </div>
      </main>
    );
  }

  if (err && !questions.length) {
    return (
      <main className="dmr">
        <style>{css}</style>
        <div className="dm-shell">
          <div className="dm-error">{err}</div>
          <button className="dm-btn dm-primary" onClick={() => nav("/simulazioni/config")}>
            Torna alla configurazione <span aria-hidden="true">→</span>
            <span className="dm-shine" aria-hidden="true" />
          </button>
        </div>
      </main>
    );
  }

  const answeredCount = questions.filter((qq) => isAnswered(qq)).length;

  return (
    <main className="dmr">
      <style>{css}</style>

      <div className="dm-shell">
        {/* TOP BAR */}
        <header className="dm-top">
          <div className="dm-topLeft">
            <div className="dm-kicker">
              <span className="dm-dot" aria-hidden="true" />
              <span className="dm-brand">
                <span className="dm-dino">Dino</span>
                <span className="dm-med">Med</span>
              </span>
              <span className="dm-sep">•</span>
              <span className="dm-tag">Prova</span>
            </div>

            <div className="dm-progress">
              <div className="dm-progTxt">
                Domanda <b>{idx + 1}</b> / {total} • Risposte: <b>{answeredCount}</b> / {total}
              </div>
              <div className="dm-bar">
                <div className="dm-barFill" style={{ width: `${Math.round((answeredCount / Math.max(1, total)) * 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="dm-topRight">
            {timed ? (
              <div className={`dm-timer ${remaining <= 30 ? "isHot" : ""}`}>
                <div className="dm-timerLab">Tempo</div>
                <div className="dm-timerVal">{formatTime(remaining)}</div>
              </div>
            ) : (
              <div className="dm-timer isOff">
                <div className="dm-timerLab">Timer</div>
                <div className="dm-timerVal">Off</div>
              </div>
            )}

            <button className="dm-btn dm-soft" onClick={() => nav("/simulazioni/config")}>
              Esci
            </button>
          </div>
        </header>

        {/* QUESTION CARD */}
        <section className="dm-card">
          <div className="dm-qMeta">
            <span className="dm-pill">{q?.materia || "Materia"}</span>
            <span className="dm-pill isType">{q?.type === "scelta" ? "Crocette" : "Completamento"}</span>
            <span className="dm-pill isOpt">Optional</span>
          </div>

          <div className="dm-qText">{q?.question}</div>

          {q?.type === "scelta" ? (
            <div className="dm-opts">
              {(q?.options || []).map((opt, i) => {
                const on = answers[q.id]?.answer_index === i;
                return (
                  <button
                    key={i}
                    type="button"
                    className={`dm-opt ${on ? "isOn" : ""}`}
                    onClick={() => setChoice(q.id, i)}
                    disabled={submitted}
                  >
                    <span className="dm-optKey">{String.fromCharCode(65 + i)}</span>
                    <span className="dm-optTxt">{opt}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="dm-fill">
              <input
                className="dm-input"
                type="text"
                value={answers[q.id]?.answer_text ?? ""}
                onChange={(e) => setText(q.id, e.target.value)}
                placeholder="Scrivi la parola mancante…"
                disabled={submitted}
              />
              <div className="dm-fillHint">Consiglio: una sola parola (o numero), senza frasi.</div>
            </div>
          )}

          <div className="dm-nav">
            <button className="dm-btn dm-soft" onClick={() => go(idx - 1)} disabled={idx === 0}>
              ← Indietro
            </button>

            <div className="dm-navMid">
              <span className={`dm-state ${isAnswered(q) ? "isOk" : ""}`}>
                {isAnswered(q) ? "Segnata" : "Non segnata"}
              </span>
            </div>

            {idx < total - 1 ? (
              <button className="dm-btn dm-primary" onClick={() => go(idx + 1)}>
                Avanti →
                <span className="dm-shine" aria-hidden="true" />
              </button>
            ) : (
              <button className="dm-btn dm-primary" onClick={submit} disabled={submitting || submitted}>
                {submitting ? "Invio…" : submitted ? "Inviata" : "Termina prova"}
                <span className="dm-shine" aria-hidden="true" />
              </button>
            )}
          </div>
        </section>

        {/* QUICK JUMP */}
        <section className="dm-jump">
          <div className="dm-jumpTitle">Vai alla domanda</div>
          <div className="dm-jumpGrid">
            {questions.map((qq, i) => {
              const on = i === idx;
              const done = isAnswered(qq);
              return (
                <button
                  key={qq.id}
                  type="button"
                  className={`dm-j ${on ? "isOn" : ""} ${done ? "isDone" : ""}`}
                  onClick={() => go(i)}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </section>

        {/* RESULTS */}
        {submitted && result ? (
          <>
            <section id="dm-results" className="dm-results">
              <div className="dm-resHead">
                <div className="dm-resTitle">
                  Risultato
                  <span className={`dm-resBadge ${score30Rounded >= 18 ? "isPass" : "isFail"}`}>
                    {score30Rounded >= 18 ? "Idoneo" : "Non idoneo"}
                  </span>
                </div>
                <div className="dm-resSub">
                  Punteggio MUR: <b>{pointsRounded}</b> pt • <b>{score30Rounded}</b>/30 • {percentRounded}% corrette
                </div>
              </div>

              <div className="dm-scoreRow">
                <div className="dm-scoreCard isMain">
                  <div className="dm-scoreLabel">Punteggio</div>
                  <div className="dm-scoreBig">
                    {score30Rounded}
                    <span className="dm-scoreUnit">/30</span>
                  </div>
                  <div className="dm-scoreHint">
                    {pointsRounded} pt su {total} domande
                  </div>
                </div>

                <div className="dm-scoreCard">
                  <div className="dm-scoreLabel">Corrette</div>
                  <div className="dm-scoreVal">{correctCount}</div>
                  <div className="dm-scoreMini">+{correctCount} pt</div>
                </div>

                <div className="dm-scoreCard">
                  <div className="dm-scoreLabel">Errate</div>
                  <div className="dm-scoreVal">{wrongCount}</div>
                  <div className="dm-scoreMini">-{Math.round(wrongCount * 0.1 * 10) / 10} pt</div>
                </div>

                <div className="dm-scoreCard">
                  <div className="dm-scoreLabel">Omesse</div>
                  <div className="dm-scoreVal">{omittedCount}</div>
                  <div className="dm-scoreMini">0 pt</div>
                </div>

                <div className="dm-scoreCard">
                  <div className="dm-scoreLabel">Tempo</div>
                  <div className="dm-scoreVal">{formatTime(elapsed)}</div>
                  <div className="dm-scoreMini">{config?.duration_min ? `Timer: ${config.duration_min} min` : "Senza timer"}</div>
                </div>
              </div>

              {breakdown.length > 1 && (
                <div className="dm-break">
                  <div className="dm-breakTitle">Dettaglio per materia</div>
                  <div className="dm-breakGrid">
                    {breakdown.map((b) => (
                      <div key={b.materia} className="dm-breakCard">
                        <div className="dm-breakTop">
                          <div className="dm-breakName">{b.materia}</div>
                          <div className="dm-breakPct">{b.pct}%</div>
                        </div>
                        <div className="dm-breakRow">
                          <span>Corrette</span>
                          <b>{b.correct}</b>
                        </div>
                        <div className="dm-breakRow">
                          <span>Errate</span>
                          <b>{b.wrong}</b>
                        </div>
                        <div className="dm-breakRow">
                          <span>Omesse</span>
                          <b>{b.omitted}</b>
                        </div>
                        <div className="dm-breakRow isPts">
                          <span>Punti</span>
                          <b>{b.points}</b>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="dm-resActions">
                <button className="dm-btn dm-primary" onClick={() => nav("/simulazioni/config")}>
                  Nuova simulazione <span aria-hidden="true">→</span>
                  <span className="dm-shine" aria-hidden="true" />
                </button>
                <button className="dm-btn dm-soft" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                  Rivedi le risposte <span aria-hidden="true">↑</span>
                </button>
              </div>

              <div className="dm-resNote">
                <b>Regole punteggio:</b> +1 corretta • 0 omessa • -0,1 errata. Soglia: <b>18/30</b>.
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}

const css = `
:root{
  --dino:#22c55e; --dino2:#16a34a;
  --med:#38bdf8;  --med2:#0ea5e9;

  --ink: rgba(15,23,42,0.92);
  --ink2: rgba(15,23,42,0.70);
  --bd: rgba(15,23,42,0.10);
  --shadow: 0 18px 60px rgba(2,6,23,0.10);
}

.dmr{ max-width: 1120px; margin: 0 auto; padding: 22px; }
.dm-shell{ display:grid; gap: 14px; }

.dm-loading{
  border-radius: 24px;
  border: 1px solid var(--bd);
  background: rgba(255,255,255,0.92);
  box-shadow: 0 14px 52px rgba(2,6,23,0.08);
  padding: 18px;
  font-weight: 950;
  color: rgba(15,23,42,0.78);
}
.dm-error{
  border-radius: 18px;
  border: 1px solid rgba(185,28,28,0.22);
  background: rgba(185,28,28,0.06);
  color: #b91c1c;
  font-weight: 900;
  padding: 14px;
  white-space: pre-wrap;
}

/* Top */
.dm-top{
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
  padding: 16px;
  display:flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.dm-kicker{
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
.dm-dot{
  width: 10px; height: 10px; border-radius: 999px;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  box-shadow: 0 10px 20px rgba(2,6,23,0.10);
}
.dm-brand{ display:inline-flex; gap:0; }
.dm-dino{ color: var(--dino2); font-weight: 1000; }
.dm-med{ color: var(--med2); font-weight: 1000; }
.dm-sep{ opacity:.55; }

.dm-topLeft{ display:flex; flex-direction:column; gap: 10px; }
.dm-progress{ display:grid; gap: 8px; }
.dm-progTxt{ font-weight: 900; color: rgba(15,23,42,0.80); }
.dm-bar{ height: 10px; border-radius: 999px; background: rgba(15,23,42,0.08); overflow:hidden; }
.dm-barFill{
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
}

.dm-topRight{ display:flex; align-items:center; gap: 10px; flex-wrap: wrap; }
.dm-timer{
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.76);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
  padding: 10px 12px;
  min-width: 120px;
}
.dm-timerLab{ font-weight: 900; color: rgba(15,23,42,0.70); font-size: 0.85rem; }
.dm-timerVal{ margin-top: 4px; font-weight: 1100; color: rgba(15,23,42,0.92); font-size: 1.2rem; }
.dm-timer.isHot{ border-color: rgba(185,28,28,0.25); }
.dm-timer.isOff{ opacity: .9; }

/* Buttons */
.dm-btn{
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
.dm-btn:hover{ transform: translateY(-1px); box-shadow: 0 18px 40px rgba(2,6,23,0.14); filter: saturate(1.03); }
.dm-btn:disabled{ opacity:.70; cursor:not-allowed; }
.dm-primary{
  color:white;
  border: 1px solid rgba(255,255,255,0.18);
  background: linear-gradient(90deg, var(--dino2), var(--med2));
}
.dm-soft{
  background: linear-gradient(135deg, rgba(34,197,94,0.10), rgba(56,189,248,0.10));
}
.dm-shine{
  position:absolute; inset:0;
  background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.26) 25%, transparent 50%);
  transform: translateX(-120%);
  animation: dmShine 4.2s ease-in-out infinite;
  pointer-events:none;
}
@keyframes dmShine{
  0%, 58% { transform: translateX(-120%); }
  88%, 100% { transform: translateX(120%); }
}

/* Question card */
.dm-card{
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

.dm-qMeta{ display:flex; gap: 10px; flex-wrap: wrap; }
.dm-pill{
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.76);
  font-weight: 950;
  color: rgba(15,23,42,0.78);
}
.dm-pill.isType{
  border-color: rgba(34,197,94,0.25);
  background: rgba(34,197,94,0.08);
}
.dm-pill.isOpt{
  border-color: rgba(56,189,248,0.25);
  background: rgba(56,189,248,0.08);
}

.dm-qText{
  margin-top: 12px;
  font-weight: 1050;
  color: rgba(15,23,42,0.92);
  line-height: 1.35;
  font-size: 1.05rem;
}

/* Options */
.dm-opts{ margin-top: 12px; display:grid; gap: 10px; }
.dm-opt{
  text-align:left;
  display:flex;
  align-items:flex-start;
  gap: 10px;
  padding: 12px 12px;
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.80);
  cursor:pointer;
  font-weight: 900;
  color: rgba(15,23,42,0.86);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
}
.dm-opt:hover{ filter: saturate(1.03); }
.dm-opt.isOn{
  border-color: rgba(34,197,94,0.35);
  background: linear-gradient(135deg, rgba(34,197,94,0.14), rgba(56,189,248,0.14));
}
.dm-optKey{
  width: 30px; height: 30px; border-radius: 12px;
  display:grid; place-items:center;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.86);
  font-weight: 1100;
}
.dm-optTxt{ line-height: 1.25; }

/* Fill */
.dm-fill{ margin-top: 12px; display:grid; gap: 8px; }
.dm-input{
  padding: 14px 14px;
  border-radius: 16px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.92);
  font-weight: 950;
  color: rgba(15,23,42,0.86);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
}
.dm-fillHint{ font-weight: 850; color: rgba(15,23,42,0.62); }

/* Navigation */
.dm-nav{
  margin-top: 14px;
  display:flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  align-items:center;
}
.dm-navMid{ display:flex; align-items:center; justify-content:center; flex: 1; }
.dm-state{
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.72);
  font-weight: 950;
  color: rgba(15,23,42,0.70);
}
.dm-state.isOk{
  border-color: rgba(34,197,94,0.30);
  background: rgba(34,197,94,0.10);
  color: rgba(15,23,42,0.86);
}

/* Jump */
.dm-jump{
  border-radius: 24px;
  border: 1px solid var(--bd);
  background: rgba(255,255,255,0.92);
  box-shadow: 0 14px 52px rgba(2,6,23,0.08);
  padding: 18px;
}
.dm-jumpTitle{ font-weight: 1100; color: rgba(15,23,42,0.92); }
.dm-jumpGrid{
  margin-top: 12px;
  display:flex;
  flex-wrap: wrap;
  gap: 8px;
}
.dm-j{
  width: 40px; height: 40px;
  border-radius: 14px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.82);
  font-weight: 1000;
  color: rgba(15,23,42,0.82);
  cursor:pointer;
}
.dm-j.isDone{
  border-color: rgba(34,197,94,0.35);
  background: rgba(34,197,94,0.10);
}
.dm-j.isOn{
  border-color: rgba(56,189,248,0.40);
  background: rgba(56,189,248,0.12);
}

/* RESULTS (premium) */
.dm-results{
  margin-top: 14px;
  border-radius: 24px;
  border: 1px solid var(--bd);
  background: rgba(255,255,255,0.92);
  box-shadow: 0 14px 52px rgba(2,6,23,0.08);
  padding: 18px;
}
.dm-resHead{ display:flex; flex-direction:column; gap: 6px; }
.dm-resTitle{
  display:flex; align-items:center; gap: 10px; flex-wrap: wrap;
  font-weight: 1100; color: rgba(15,23,42,0.92);
  letter-spacing: -0.01em;
}
.dm-resBadge{
  padding: 7px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  font-weight: 1000;
  font-size: 0.86rem;
  background: rgba(255,255,255,0.80);
  color: rgba(15,23,42,0.78);
}
.dm-resBadge.isPass{
  border-color: rgba(34,197,94,0.35);
  background: linear-gradient(135deg, rgba(34,197,94,0.14), rgba(56,189,248,0.10));
}
.dm-resBadge.isFail{
  border-color: rgba(185,28,28,0.25);
  background: rgba(185,28,28,0.06);
  color: #b91c1c;
}
.dm-resSub{ font-weight: 850; color: rgba(15,23,42,0.72); }

.dm-scoreRow{
  margin-top: 14px;
  display:grid;
  grid-template-columns: 1.2fr repeat(4, minmax(0,1fr));
  gap: 10px;
}
@media (max-width: 980px){
  .dm-scoreRow{ grid-template-columns: 1fr 1fr; }
}
@media (max-width: 520px){
  .dm-scoreRow{ grid-template-columns: 1fr; }
}

.dm-scoreCard{
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.78);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
  padding: 12px;
}
.dm-scoreCard.isMain{
  background:
    radial-gradient(520px 220px at 30% -10%, rgba(34,197,94,0.10), transparent 60%),
    radial-gradient(520px 220px at 80% -10%, rgba(56,189,248,0.10), transparent 60%),
    rgba(255,255,255,0.88);
}
.dm-scoreLabel{ font-weight: 950; color: rgba(15,23,42,0.70); }
.dm-scoreBig{
  margin-top: 6px;
  font-weight: 1200;
  font-size: 34px;
  letter-spacing: -0.03em;
  color: rgba(15,23,42,0.92);
}
.dm-scoreUnit{ font-size: 16px; font-weight: 1000; opacity: .70; margin-left: 2px; }
.dm-scoreHint{ margin-top: 6px; font-weight: 850; color: rgba(15,23,42,0.70); }

.dm-scoreVal{
  margin-top: 6px;
  font-weight: 1200;
  font-size: 24px;
  color: rgba(15,23,42,0.92);
}
.dm-scoreMini{ margin-top: 6px; font-weight: 900; color: rgba(15,23,42,0.66); }

.dm-break{
  margin-top: 14px;
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.76);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
  padding: 12px;
}
.dm-breakTitle{ font-weight: 1100; color: rgba(15,23,42,0.90); }
.dm-breakGrid{
  margin-top: 10px;
  display:grid;
  grid-template-columns: repeat(3, minmax(0,1fr));
  gap: 10px;
}
@media (max-width: 980px){ .dm-breakGrid{ grid-template-columns: 1fr; } }

.dm-breakCard{
  border-radius: 16px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.86);
  padding: 12px;
}
.dm-breakTop{ display:flex; align-items:baseline; justify-content: space-between; gap: 10px; }
.dm-breakName{ font-weight: 1100; color: rgba(15,23,42,0.90); }
.dm-breakPct{
  font-weight: 1100;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  -webkit-background-clip:text;
  background-clip:text;
  color: transparent;
}
.dm-breakRow{
  margin-top: 8px;
  display:flex;
  justify-content: space-between;
  gap: 12px;
  font-weight: 900;
  color: rgba(15,23,42,0.74);
}
.dm-breakRow.isPts b{ color: rgba(15,23,42,0.92); }

.dm-resActions{ margin-top: 14px; display:flex; gap: 10px; flex-wrap: wrap; }
.dm-resNote{
  margin-top: 12px;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.72);
  font-weight: 850;
  color: rgba(15,23,42,0.72);
}
.dm-resNote b{ color: rgba(15,23,42,0.90); }
`;