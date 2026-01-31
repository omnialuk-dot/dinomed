import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");

/* =========================
   Helpers
   ========================= */
function clampInt(v, min, max, fallback) {
  const n = parseInt(String(v), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}
function safeJsonParse(txt) {
  try {
    return JSON.parse(txt);
  } catch {
    return null;
  }
}
function normType(q) {
  const t =
    q?.tipo ||
    q?.type ||
    q?.question_type ||
    q?.format ||
    (q?.options ? "scelta" : q?.blank || q?.missing ? "completamento" : null);
  if (!t) return "scelta";
  const s = String(t).toLowerCase();
  if (s.includes("comp")) return "completamento";
  if (s.includes("fill")) return "completamento";
  if (s.includes("open")) return "completamento";
  if (s.includes("short")) return "completamento";
  return "scelta";
}
function getText(q) {
  return (
    q?.testo ||
    q?.text ||
    q?.question ||
    q?.prompt ||
    q?.stem ||
    q?.domanda ||
    ""
  );
}
function getSubject(q) {
  return q?.materia || q?.subject || q?.section || q?.area || "Materia";
}
function getOptions(q) {
  const opts = q?.opzioni || q?.options || q?.choices || q?.answers || null;
  if (!opts) return [];
  if (Array.isArray(opts)) return opts;
  // in caso siano oggetti {A:"..",B:".."}
  if (typeof opts === "object") {
    const keys = Object.keys(opts);
    return keys.map((k) => ({ key: k, text: opts[k] }));
  }
  return [];
}
function normalizeOptions(opts) {
  // rende sempre array di {key, text}
  return (opts || []).map((o, i) => {
    if (typeof o === "string") return { key: String.fromCharCode(65 + i), text: o };
    if (o && typeof o === "object") {
      const key = o.key || o.letter || o.label || String.fromCharCode(65 + i);
      const text = o.text || o.value || o.option || o.answer || "";
      return { key: String(key), text: String(text) };
    }
    return { key: String.fromCharCode(65 + i), text: String(o ?? "") };
  });
}
function normalizeCorrect(q) {
  // supporta diverse forme: "A", 0, "testo", {key:"A"} ecc.
  const c = q?.corretta ?? q?.correct ?? q?.answer ?? q?.correct_answer ?? q?.solution ?? null;
  if (c === null || c === undefined) return null;
  if (typeof c === "number") return c; // index
  if (typeof c === "string") return c.trim();
  if (typeof c === "object") {
    if (c.key) return String(c.key).trim();
    if (c.value) return String(c.value).trim();
  }
  return null;
}
function murScore({ correct, wrong, blank }) {
  // +1 corrette, -0.1 errate, 0 omesse
  const raw = correct * 1 + wrong * -0.1 + blank * 0;
  // evita roba tipo 17.999999
  return Math.round(raw * 1000) / 1000;
}
function to30(score, total) {
  if (!total || total <= 0) return null;
  // scala semplice: se total=31, max=31 -> /30 = score * 30/31
  const v = (score * 30) / total;
  return Math.round(v * 100) / 100;
}
function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

/* =========================
   Component
   ========================= */
export default function SimulazioniRun() {
  const nav = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [fatal, setFatal] = useState("");
  const [session, setSession] = useState(null);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qidOrIndex]: value }
  const [finishing, setFinishing] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(null); // seconds or null
  const timerRef = useRef(null);

  // Banner error per argomenti ecc. (dal backend)
  const [banner, setBanner] = useState("");

  const sessionId = useMemo(() => {
    const sp = new URLSearchParams(window.location.search);
    return (
      sp.get("s") ||
      sp.get("session") ||
      sp.get("id") ||
      location?.state?.sessionId ||
      location?.state?.id ||
      ""
    );
  }, [location]);

  const storageKey = useMemo(() => (sessionId ? `dinomed_sim_${sessionId}` : ""), [sessionId]);

  // Load saved answers
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const obj = safeJsonParse(raw);
      if (obj?.answers && typeof obj.answers === "object") setAnswers(obj.answers);
      if (Number.isFinite(obj?.idx)) setIdx(obj.idx);
    } catch {}
  }, [storageKey]);

  // Persist answers
  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ answers, idx, savedAt: Date.now() }));
    } catch {}
  }, [answers, idx, storageKey]);

  // Fetch session
  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setFatal("");
      setBanner("");

      if (!sessionId) {
        setLoading(false);
        setFatal("Sessione mancante. Torna alla configurazione e riprova.");
        return;
      }

      const candidates = [
        `/api/sim/session/${sessionId}`,
        `/api/sim/session/${sessionId}/`,
        `/api/simulazioni/session/${sessionId}`,
        `/api/simulazioni/session/${sessionId}/`,
        `/api/sim/${sessionId}`,
        `/api/sim/${sessionId}/`,
        `/api/simulazioni/${sessionId}`,
        `/api/simulazioni/${sessionId}/`,
      ];

      let last = "";
      for (const path of candidates) {
        try {
          const res = await fetch(`${API_BASE}${path}`, {
            headers: { Accept: "application/json" },
          });
          const txt = await res.text();
          last = `[${res.status}] ${path}\n${txt || "(empty)"}`;

          if (!res.ok) {
            if (res.status === 404) continue;
            throw new Error(last);
          }

          const data = safeJsonParse(txt) ?? {};
          if (!alive) return;

          // Normalize shape: may be {session_id, duration_min, questions, order}
          const questions = Array.isArray(data?.questions) ? data.questions : Array.isArray(data?.domande) ? data.domande : [];
          const durationMin =
            Number.isFinite(data?.duration_min)
              ? data.duration_min
              : Number.isFinite(data?.durationMin)
              ? data.durationMin
              : 0;

          const order = Array.isArray(data?.order)
            ? data.order
            : Array.isArray(data?.materie)
            ? data.materie
            : null;

          const normalized = {
            ...data,
            session_id: data?.session_id || data?.sessionId || sessionId,
            duration_min: durationMin,
            questions,
            order,
          };

          if (!questions.length) {
            setFatal("Sessione trovata ma non contiene domande. Torna alla configurazione e riprova.");
            setLoading(false);
            return;
          }

          setSession(normalized);
          setLoading(false);

          // Timer init
          if (durationMin && durationMin > 0) {
            // se già c'è un remaining dal backend, usalo
            const remaining =
              Number.isFinite(data?.remaining_sec) ? data.remaining_sec : Number.isFinite(data?.remaining) ? data.remaining : null;

            const initSec = remaining ?? Math.max(0, Math.floor(durationMin * 60));
            setTimeLeft(initSec);
          } else {
            setTimeLeft(null);
          }
          return;
        } catch (e) {
          if (String(e?.message || "").includes("[404]")) continue;
          setLoading(false);
          setFatal(String(e?.message || e || "Errore sconosciuto"));
          return;
        }
      }

      setLoading(false);
      setFatal("Impossibile caricare la sessione (endpoint non trovato).");
    }

    load();
    return () => {
      alive = false;
    };
  }, [sessionId]);

  // Timer tick
  useEffect(() => {
    if (timeLeft === null) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t === null) return null;
        if (t <= 1) return 0;
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [timeLeft]);

  // Auto-finish when time reaches 0
  useEffect(() => {
    if (timeLeft === 0 && session && !finishing) {
      // termina automaticamente
      finishExam(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, session]);

  const questions = useMemo(() => session?.questions || [], [session]);

  const q = questions[idx] || null;

  const qId = useMemo(() => {
    // usa id se c'è, altrimenti indice
    return q?.id ?? q?.qid ?? q?.question_id ?? `q_${idx}`;
  }, [q, idx]);

  const qType = useMemo(() => (q ? normType(q) : "scelta"), [q]);

  const qText = useMemo(() => (q ? getText(q) : ""), [q]);

  const qSubject = useMemo(() => (q ? getSubject(q) : ""), [q]);

  const options = useMemo(() => normalizeOptions(getOptions(q)), [q]);

  const currentAnswer = useMemo(() => answers[qId] ?? "", [answers, qId]);

  const progress = useMemo(() => {
    const total = questions.length;
    const answered = Object.keys(answers).filter((k) => {
      const v = answers[k];
      if (v === null || v === undefined) return false;
      if (typeof v === "string") return v.trim() !== "";
      return true;
    }).length;
    return { total, answered };
  }, [questions.length, answers]);

  const perSubject = useMemo(() => {
    // per materia: totale / risposte
    const map = {};
    questions.forEach((qq, i) => {
      const m = getSubject(qq);
      if (!map[m]) map[m] = { total: 0, answered: 0, start: i, end: i };
      map[m].total += 1;
      map[m].end = i;
      const id = qq?.id ?? qq?.qid ?? qq?.question_id ?? `q_${i}`;
      const v = answers[id];
      const ok = typeof v === "string" ? v.trim() !== "" : v !== null && v !== undefined && v !== "";
      if (ok) map[m].answered += 1;
    });
    return map;
  }, [questions, answers]);

  const brandLine = useMemo(() => {
    const isTimed = session?.duration_min && session.duration_min > 0;
    return isTimed ? `Timer attivo` : `Senza timer`;
  }, [session]);

  function setAnswer(val) {
    setBanner(""); // appena selezioni, pulisce eventuali banner
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  }

  function clearAnswer() {
    setBanner("");
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
  }

  function nextQ() {
    setBanner("");
    setIdx((i) => Math.min(questions.length - 1, i + 1));
  }

  function prevQ() {
    setBanner("");
    setIdx((i) => Math.max(0, i - 1));
  }

  function jumpTo(i) {
    setBanner("");
    setIdx(clampInt(i, 0, questions.length - 1, 0));
    setShowMap(false);
  }

  async function finishExam(auto = false) {
    if (!session || finishing) return;
    setFinishing(true);
    setBanner("");

    // prepara risposte in forma stabile
    const payloadAnswers = questions.map((qq, i) => {
      const id = qq?.id ?? qq?.qid ?? qq?.question_id ?? `q_${i}`;
      const type = normType(qq);
      const val = answers[id];

      return {
        id,
        materia: getSubject(qq),
        type,
        answer: val ?? "",
      };
    });

    const body = {
      session_id: session?.session_id || sessionId,
      answers: payloadAnswers,
      auto_finish: Boolean(auto),
    };

    const candidates = [
      "/api/sim/finish",
      "/api/sim/finish/",
      "/api/simulazioni/finish",
      "/api/simulazioni/finish/",
      "/api/sim/end",
      "/api/sim/end/",
      "/api/simulazioni/end",
      "/api/simulazioni/end/",
    ];

    // 1) prova a chiedere al backend la correzione (preferibile)
    let last = "";
    for (const path of candidates) {
      try {
        const res = await fetch(`${API_BASE}${path}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(body),
        });
        const txt = await res.text();
        last = `[${res.status}] ${path}\n${txt || "(empty)"}`;

        if (!res.ok) {
          if (res.status === 404) continue;
          throw new Error(last);
        }

        const data = safeJsonParse(txt) || {};

        // salva risultato e vai alla pagina risultato
        try {
          localStorage.setItem(`${storageKey}_result`, JSON.stringify({ data, at: Date.now() }));
        } catch {}

        nav("/simulazioni/risultato", {
          state: {
            sessionId: session?.session_id || sessionId,
            result: data,
            meta: {
              total: questions.length,
              duration_min: session?.duration_min || 0,
            },
          },
        });
        return;
      } catch (e) {
        if (String(e?.message || "").includes("[404]")) continue;
        setBanner(String(e?.message || e || "Errore durante la consegna"));
        setFinishing(false);
        return;
      }
    }

    // 2) fallback: calcolo locale SOLO se il backend invia “corrette”
    // (Se non c’è, non possiamo conoscere le soluzioni in front)
    const local = localGrade();
    if (!local.can) {
      setBanner("Non posso correggere da qui (soluzioni non disponibili). Riprova oppure abilita l’endpoint /finish nel backend.");
      setFinishing(false);
      return;
    }

    nav("/simulazioni/risultato", {
      state: {
        sessionId: session?.session_id || sessionId,
        result: local.result,
        meta: {
          total: questions.length,
          duration_min: session?.duration_min || 0,
        },
      },
    });
  }

  function localGrade() {
    // prova a correggere usando campi "corretta/correct/answer" presenti nelle domande
    let can = true;
    let correct = 0;
    let wrong = 0;
    let blank = 0;

    const detail = questions.map((qq, i) => {
      const id = qq?.id ?? qq?.qid ?? qq?.question_id ?? `q_${i}`;
      const type = normType(qq);
      const user = answers[id];

      const corr = normalizeCorrect(qq);
      if (corr === null) can = false;

      const isBlank = user === undefined || user === null || (typeof user === "string" && user.trim() === "");
      if (isBlank) {
        blank += 1;
        return { id, materia: getSubject(qq), ok: null, user: "", correct: corr };
      }

      let ok = false;

      if (type === "scelta") {
        // user può essere "A" o index o testo
        if (typeof corr === "number") {
          // corr è index
          const userIdx =
            typeof user === "number"
              ? user
              : typeof user === "string"
              ? (user.length === 1 && /[A-Z]/i.test(user) ? user.toUpperCase().charCodeAt(0) - 65 : null)
              : null;
          ok = userIdx !== null && userIdx === corr;
        } else if (typeof corr === "string") {
          const c = corr.trim();
          const u = String(user).trim();
          // match lettera o match testo
          ok = u.toUpperCase() === c.toUpperCase() || u === c;
        }
      } else {
        // completamento: confronto “pulito”
        const u = String(user || "").trim().toLowerCase();
        const c = String(corr || "").trim().toLowerCase();
        ok = u !== "" && c !== "" && u === c;
      }

      if (ok) correct += 1;
      else wrong += 1;

      return { id, materia: getSubject(qq), ok, user: user ?? "", correct: corr };
    });

    const score = murScore({ correct, wrong, blank });
    const vote30 = to30(score, questions.length);

    return {
      can,
      result: {
        correct,
        wrong,
        blank,
        score,
        vote30,
        details: detail,
        total: questions.length,
        scoring: { correct: 1, wrong: -0.1, blank: 0 },
        source: "local",
      },
    };
  }

  // Small UX: banner per argomenti non selezionati ecc.
  // Se il backend ti manda error tipo "disponibili 0", lo mostriamo qui.
  // (Se stai facendo validate lato frontend altrove, qui resta compatibile.)
  function showFriendlyError(msg) {
    setBanner(msg);
    // porta su l’utente al banner
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Render states
  if (loading) {
    return (
      <main className="sr">
        <style>{css}</style>
        <div className="sr-shell">
          <div className="sr-top">
            <Brand />
          </div>
          <div className="sr-card sr-center">
            <div className="sr-spinner" aria-hidden="true" />
            <div className="sr-loadingTxt">Caricamento prova…</div>
            <div className="sr-muted">Sto preparando le domande.</div>
          </div>
        </div>
      </main>
    );
  }

  if (fatal) {
    return (
      <main className="sr">
        <style>{css}</style>
        <div className="sr-shell">
          <div className="sr-top">
            <Brand />
          </div>
          <div className="sr-card">
            <div className="sr-errTitle">Impossibile avviare la prova</div>
            <div className="sr-errText">{fatal}</div>
            <div className="sr-row">
              <button className="sr-btn sr-primary" onClick={() => nav("/simulazioni/config")}>
                Torna alla configurazione →
              </button>
              <button className="sr-btn sr-soft" onClick={() => window.location.reload()}>
                Ricarica
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!session || !q) {
    return (
      <main className="sr">
        <style>{css}</style>
        <div className="sr-shell">
          <div className="sr-top">
            <Brand />
          </div>
          <div className="sr-card">
            <div className="sr-errTitle">Prova vuota</div>
            <div className="sr-errText">Non ho trovato domande da mostrare. Torna alla configurazione e riprova.</div>
            <button className="sr-btn sr-primary" onClick={() => nav("/simulazioni/config")}>
              Torna alla configurazione →
            </button>
          </div>
        </div>
      </main>
    );
  }

  const subjectBadge = qSubject;
  const total = questions.length;
  const qNumber = idx + 1;

  const answeredThis = (() => {
    const v = answers[qId];
    if (v === undefined || v === null) return false;
    if (typeof v === "string") return v.trim() !== "";
    return true;
  })();

  const donePct = Math.round((progress.answered / Math.max(1, progress.total)) * 100);

  return (
    <main className="sr">
      <style>{css}</style>

      <div className="sr-shell">
        {/* Top bar */}
        <header className="sr-top">
          <Brand />

          <div className="sr-topRight">
            <div className="sr-pill">
              <span className="sr-dot" aria-hidden="true" />
              {brandLine}
            </div>

            {timeLeft !== null && (
              <div className={`sr-timer ${timeLeft <= 60 ? "isHot" : ""}`}>
                <span className="sr-timerLab">Tempo</span>
                <span className="sr-timerVal">{formatTime(timeLeft)}</span>
              </div>
            )}

            <button className="sr-mapBtn" type="button" onClick={() => setShowMap((v) => !v)}>
              Domande
              <span className="sr-mapMini">
                {progress.answered}/{progress.total}
              </span>
            </button>
          </div>
        </header>

        {/* Banner */}
        {banner ? (
          <div className="sr-banner">
            <div className="sr-bannerTitle">Attenzione</div>
            <div className="sr-bannerText">{banner}</div>
          </div>
        ) : null}

        {/* Main layout */}
        <section className="sr-grid">
          {/* Question */}
          <div className="sr-card sr-q">
            <div className="sr-qTop">
              <div className="sr-metaLeft">
                <div className="sr-badge">{subjectBadge}</div>
                <div className="sr-qCount">
                  Domanda <b>{qNumber}</b> / {total}
                </div>
              </div>

              <div className="sr-metaRight">
                <div className={`sr-status ${answeredThis ? "isOn" : ""}`}>
                  {answeredThis ? "Risposta salvata ✓" : "Non risposta"}
                </div>
              </div>
            </div>

            <div className="sr-question">
              {qText ? qText : <span className="sr-muted">Testo domanda mancante.</span>}
            </div>

            {/* Answer area */}
            {qType === "scelta" ? (
              <div className="sr-opts">
                {options.length ? (
                  options.map((o) => {
                    const on = String(currentAnswer) === String(o.key) || String(currentAnswer) === String(o.text);
                    return (
                      <button
                        key={o.key}
                        type="button"
                        className={`sr-opt ${on ? "isOn" : ""}`}
                        onClick={() => setAnswer(o.key)}
                      >
                        <span className="sr-optKey">{o.key}</span>
                        <span className="sr-optTxt">{o.text}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="sr-muted">Opzioni non disponibili.</div>
                )}
              </div>
            ) : (
              <div className="sr-fill">
                <div className="sr-fillLab">Completa la risposta</div>
                <input
                  className="sr-input"
                  type="text"
                  placeholder="Scrivi qui la parola mancante…"
                  value={typeof currentAnswer === "string" ? currentAnswer : String(currentAnswer ?? "")}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                <div className="sr-fillHint">Suggerimento: usa una sola parola (senza frasi lunghe).</div>
              </div>
            )}

            {/* Actions */}
            <div className="sr-actions">
              <button className="sr-btn sr-soft" type="button" onClick={clearAnswer}>
                Cancella
              </button>

              <div className="sr-nav">
                <button className="sr-btn sr-soft" type="button" onClick={prevQ} disabled={idx === 0}>
                  ← Indietro
                </button>
                <button className="sr-btn sr-soft" type="button" onClick={nextQ} disabled={idx === total - 1}>
                  Avanti →
                </button>
              </div>

              <button
                className="sr-btn sr-primary"
                type="button"
                onClick={() => {
                  // UX: se l’utente è in "Scelgo io" e non ha argomenti, quel controllo dovrebbe stare in Config.
                  // Qui facciamo solo una consegna pulita.
                  finishExam(false);
                }}
                disabled={finishing}
              >
                {finishing ? "Consegna…" : "Termina prova"}
                <span className="sr-shine" aria-hidden="true" />
              </button>
            </div>

            {/* Progress */}
            <div className="sr-progress">
              <div className="sr-progressTop">
                <div className="sr-progressTitle">Avanzamento</div>
                <div className="sr-progressVal">
                  {progress.answered}/{progress.total} • {donePct}%
                </div>
              </div>
              <div className="sr-bar">
                <div className="sr-barFill" style={{ width: `${donePct}%` }} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="sr-card sr-side">
            <div className="sr-sideTitle">Riepilogo materie</div>
            <div className="sr-sideList">
              {Object.keys(perSubject).map((m) => (
                <div key={m} className="sr-sideRow">
                  <div className="sr-sideName">{m}</div>
                  <div className="sr-sideCount">
                    {perSubject[m].answered}/{perSubject[m].total}
                  </div>
                </div>
              ))}
            </div>

            <div className="sr-sideHint">
              Tip: se non sai una domanda, <b>saltala</b>. Nel MUR una risposta errata vale −0,1.
            </div>

            <div className="sr-scoreBox">
              <div className="sr-scoreTitle">Scoring MUR</div>
              <div className="sr-scoreRow">
                <span>Corretta</span>
                <b>+1</b>
              </div>
              <div className="sr-scoreRow">
                <span>Errata</span>
                <b>−0,1</b>
              </div>
              <div className="sr-scoreRow">
                <span>Omessa</span>
                <b>0</b>
              </div>
              <div className="sr-scoreNote">Il punteggio finale viene calcolato alla consegna.</div>
            </div>
          </aside>
        </section>

        {/* Map drawer */}
        {showMap && (
          <div className="sr-mapBackdrop" onClick={() => setShowMap(false)} role="presentation">
            <div className="sr-map" onClick={(e) => e.stopPropagation()} role="presentation">
              <div className="sr-mapTop">
                <div className="sr-mapTitle">Navigazione domande</div>
                <button className="sr-x" onClick={() => setShowMap(false)}>
                  ✕
                </button>
              </div>

              <div className="sr-mapGrid">
                {questions.map((qq, i) => {
                  const id = qq?.id ?? qq?.qid ?? qq?.question_id ?? `q_${i}`;
                  const v = answers[id];
                  const ok = typeof v === "string" ? v.trim() !== "" : v !== null && v !== undefined && v !== "";
                  const active = i === idx;
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`sr-num ${ok ? "isDone" : ""} ${active ? "isActive" : ""}`}
                      onClick={() => jumpTo(i)}
                      title={`${getSubject(qq)} • Domanda ${i + 1}`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <div className="sr-mapFoot">
                <div className="sr-mapLegend">
                  <span className="sr-leg"><i className="sr-legDot isDone" /> risposte</span>
                  <span className="sr-leg"><i className="sr-legDot isActive" /> attuale</span>
                </div>

                <button className="sr-btn sr-primary sr-mapFinish" onClick={() => finishExam(false)} disabled={finishing}>
                  {finishing ? "Consegna…" : "Termina prova"}
                  <span className="sr-shine" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );

  function Brand() {
    return (
      <div className="sr-brand">
        <span className="sr-dotBrand" aria-hidden="true" />
        <span className="sr-b1">Dino</span>
        <span className="sr-b2">Med</span>
        <span className="sr-sep">•</span>
        <span className="sr-bTag">Prova</span>
      </div>
    );
  }
}

/* =========================
   CSS premium (inline)
   ========================= */
const css = `
:root{
  --dino:#22c55e;
  --dino2:#16a34a;
  --med:#38bdf8;
  --med2:#0ea5e9;

  --ink: rgba(15,23,42,0.92);
  --ink2: rgba(15,23,42,0.72);
  --bd: rgba(15,23,42,0.10);
  --shadow: 0 18px 60px rgba(2,6,23,0.10);
}

.sr{ max-width: 1200px; margin:0 auto; padding: 18px; }
.sr-shell{ display:grid; gap: 14px; }

.sr-top{
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 14px;
  border-radius: 24px;
  border: 1px solid var(--bd);
  background:
    radial-gradient(900px 320px at 12% -25%, rgba(34,197,94,0.16), transparent 60%),
    radial-gradient(900px 320px at 78% -30%, rgba(56,189,248,0.16), transparent 55%),
    rgba(255,255,255,0.90);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: var(--shadow);
}
.sr-brand{
  display:inline-flex; align-items:center; gap: 8px;
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.74);
  font-weight: 1000;
  color: rgba(15,23,42,0.82);
}
.sr-dotBrand{
  width: 10px; height: 10px; border-radius: 999px;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
  box-shadow: 0 10px 20px rgba(2,6,23,0.10);
}
.sr-b1{ color: var(--dino2); }
.sr-b2{ color: var(--med2); }
.sr-sep{ opacity: .55; padding: 0 2px; }
.sr-bTag{ font-weight: 950; }

.sr-topRight{ display:flex; align-items:center; gap: 10px; flex-wrap: wrap; justify-content:flex-end; }
.sr-pill{
  display:inline-flex; align-items:center; gap: 8px;
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.74);
  font-weight: 900;
  color: rgba(15,23,42,0.74);
}
.sr-dot{
  width: 8px; height: 8px; border-radius: 999px;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
}
.sr-timer{
  display:inline-flex; align-items:baseline; gap: 10px;
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.86);
  font-weight: 1000;
  color: rgba(15,23,42,0.86);
}
.sr-timer.isHot{
  border-color: rgba(185,28,28,0.22);
  background: rgba(185,28,28,0.06);
}
.sr-timerLab{ font-weight: 900; color: rgba(15,23,42,0.65); }
.sr-timerVal{ font-weight: 1100; letter-spacing: .02em; }

.sr-mapBtn{
  display:inline-flex; align-items:center; gap: 10px;
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: linear-gradient(135deg, rgba(34,197,94,0.10), rgba(56,189,248,0.10));
  font-weight: 1000;
  color: rgba(15,23,42,0.84);
  cursor:pointer;
  box-shadow: 0 14px 30px rgba(2,6,23,0.08);
}
.sr-mapMini{
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.78);
  border: 1px solid rgba(15,23,42,0.10);
  font-weight: 1000;
}

.sr-banner{
  border-radius: 20px;
  border: 1px solid rgba(185,28,28,0.22);
  background: rgba(185,28,28,0.06);
  padding: 12px 14px;
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
}
.sr-bannerTitle{ font-weight: 1100; color: #b91c1c; }
.sr-bannerText{ margin-top: 6px; font-weight: 900; color: rgba(127,29,29,0.92); white-space: pre-wrap; }

.sr-grid{
  display:grid;
  grid-template-columns: 1.25fr .75fr;
  gap: 14px;
}
@media (max-width: 980px){
  .sr-grid{ grid-template-columns: 1fr; }
}

.sr-card{
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

.sr-center{ display:grid; place-items:center; gap: 10px; min-height: 240px; text-align:center; }
.sr-spinner{
  width: 38px; height: 38px; border-radius: 999px;
  border: 4px solid rgba(15,23,42,0.10);
  border-top-color: rgba(14,165,233,0.80);
  animation: spin 0.9s linear infinite;
}
@keyframes spin{ to { transform: rotate(360deg); } }
.sr-loadingTxt{ font-weight: 1100; color: rgba(15,23,42,0.90); }
.sr-muted{ font-weight: 850; color: rgba(15,23,42,0.62); }

.sr-qTop{
  display:flex; align-items:center; justify-content: space-between; gap: 12px;
}
.sr-metaLeft{ display:flex; align-items:center; gap: 10px; flex-wrap: wrap; }
.sr-badge{
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.78);
  font-weight: 1000;
  color: rgba(15,23,42,0.82);
}
.sr-qCount{ font-weight: 900; color: rgba(15,23,42,0.70); }
.sr-status{
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.68);
  font-weight: 950;
  color: rgba(15,23,42,0.65);
}
.sr-status.isOn{
  border-color: rgba(34,197,94,0.30);
  background: rgba(34,197,94,0.10);
  color: rgba(22,163,74,0.95);
}

.sr-question{
  margin-top: 14px;
  padding: 14px 14px;
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.86);
  font-weight: 950;
  color: rgba(15,23,42,0.90);
  line-height: 1.35;
}

.sr-opts{ margin-top: 12px; display:grid; gap: 10px; }
.sr-opt{
  display:flex; gap: 12px; align-items:flex-start;
  padding: 12px 12px;
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.86);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
  cursor:pointer;
  transition: transform .12s ease, box-shadow .12s ease;
  text-align:left;
}
.sr-opt:hover{ transform: translateY(-1px); box-shadow: 0 18px 40px rgba(2,6,23,0.10); }
.sr-opt.isOn{
  border-color: rgba(34,197,94,0.35);
  background: linear-gradient(135deg, rgba(34,197,94,0.14), rgba(56,189,248,0.12));
}
.sr-optKey{
  width: 34px; height: 34px;
  border-radius: 14px;
  display:grid; place-items:center;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.90);
  font-weight: 1100;
  color: rgba(15,23,42,0.86);
  flex: 0 0 auto;
}
.sr-optTxt{ font-weight: 900; color: rgba(15,23,42,0.84); line-height: 1.35; }

.sr-fill{ margin-top: 12px; }
.sr-fillLab{ font-weight: 1100; color: rgba(15,23,42,0.88); }
.sr-input{
  margin-top: 8px;
  width:100%;
  padding: 14px 14px;
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.92);
  font-weight: 1000;
  color: rgba(15,23,42,0.86);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
}
.sr-input:focus{ outline:none; border-color: rgba(14,165,233,0.40); }
.sr-fillHint{ margin-top: 8px; font-weight: 850; color: rgba(15,23,42,0.62); }

.sr-actions{
  margin-top: 14px;
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.sr-nav{ display:flex; gap: 10px; flex-wrap: wrap; }

.sr-btn{
  position: relative;
  overflow:hidden;
  display:inline-flex;
  align-items:center;
  justify-content:center;
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
.sr-btn:hover{ transform: translateY(-1px); box-shadow: 0 18px 40px rgba(2,6,23,0.14); filter: saturate(1.03); }
.sr-btn:disabled{ opacity:.70; cursor:not-allowed; }
.sr-primary{
  color:white;
  border: 1px solid rgba(255,255,255,0.18);
  background: linear-gradient(90deg, var(--dino2), var(--med2));
}
.sr-soft{
  background: rgba(255,255,255,0.72);
}
.sr-shine{
  position:absolute; inset:0;
  background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.26) 25%, transparent 50%);
  transform: translateX(-120%);
  animation: shine 4.2s ease-in-out infinite;
  pointer-events:none;
}
@keyframes shine{
  0%, 58% { transform: translateX(-120%); }
  88%, 100% { transform: translateX(120%); }
}

.sr-progress{
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(15,23,42,0.08);
}
.sr-progressTop{
  display:flex; justify-content: space-between; gap: 12px; align-items:center;
}
.sr-progressTitle{ font-weight: 1100; color: rgba(15,23,42,0.90); }
.sr-progressVal{ font-weight: 950; color: rgba(15,23,42,0.72); }
.sr-bar{
  margin-top: 10px;
  height: 12px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.80);
  overflow:hidden;
}
.sr-barFill{
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--dino2), var(--med2));
}

.sr-sideTitle{ font-weight: 1100; color: rgba(15,23,42,0.92); }
.sr-sideList{ margin-top: 10px; display:grid; gap: 8px; }
.sr-sideRow{
  display:flex; align-items:center; justify-content: space-between; gap: 10px;
  padding: 10px 10px;
  border-radius: 16px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.82);
}
.sr-sideName{ font-weight: 1000; color: rgba(15,23,42,0.86); }
.sr-sideCount{ font-weight: 950; color: rgba(15,23,42,0.70); }

.sr-sideHint{
  margin-top: 12px;
  font-weight: 850;
  color: rgba(15,23,42,0.70);
  line-height: 1.35;
}

.sr-scoreBox{
  margin-top: 14px;
  border-radius: 18px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.74);
  box-shadow: 0 14px 30px rgba(2,6,23,0.06);
  padding: 12px;
}
.sr-scoreTitle{ font-weight: 1100; color: rgba(15,23,42,0.90); }
.sr-scoreRow{ margin-top: 8px; display:flex; justify-content: space-between; gap: 10px; font-weight: 950; color: rgba(15,23,42,0.78); }
.sr-scoreNote{ margin-top: 10px; font-weight: 850; color: rgba(15,23,42,0.62); line-height: 1.35; }

.sr-mapBackdrop{
  position: fixed;
  inset: 0;
  background: rgba(2,6,23,0.35);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display:grid;
  place-items:center;
  padding: 14px;
  z-index: 50;
}
.sr-map{
  width: min(720px, 100%);
  border-radius: 24px;
  border: 1px solid rgba(15,23,42,0.12);
  background: rgba(255,255,255,0.92);
  box-shadow: 0 22px 80px rgba(2,6,23,0.30);
  padding: 14px;
}
.sr-mapTop{ display:flex; align-items:center; justify-content: space-between; gap: 10px; }
.sr-mapTitle{ font-weight: 1100; color: rgba(15,23,42,0.92); }
.sr-x{
  width: 38px; height: 38px;
  border-radius: 14px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.86);
  cursor:pointer;
  font-weight: 1100;
}
.sr-mapGrid{
  margin-top: 12px;
  display:grid;
  grid-template-columns: repeat(10, minmax(0,1fr));
  gap: 8px;
}
@media (max-width: 520px){
  .sr-mapGrid{ grid-template-columns: repeat(7, minmax(0,1fr)); }
}
.sr-num{
  height: 40px;
  border-radius: 14px;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.86);
  font-weight: 1000;
  color: rgba(15,23,42,0.82);
  cursor:pointer;
}
.sr-num.isDone{
  border-color: rgba(34,197,94,0.35);
  background: linear-gradient(135deg, rgba(34,197,94,0.14), rgba(56,189,248,0.10));
}
.sr-num.isActive{
  outline: 2px solid rgba(14,165,233,0.35);
}

.sr-mapFoot{
  margin-top: 12px;
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.sr-mapLegend{ display:flex; gap: 12px; align-items:center; }
.sr-leg{ display:inline-flex; gap: 8px; align-items:center; font-weight: 900; color: rgba(15,23,42,0.70); }
.sr-legDot{
  width: 12px; height: 12px; border-radius: 999px; display:inline-block;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.86);
}
.sr-legDot.isDone{
  background: linear-gradient(135deg, rgba(34,197,94,0.18), rgba(56,189,248,0.12));
  border-color: rgba(34,197,94,0.35);
}
.sr-legDot.isActive{
  background: rgba(14,165,233,0.18);
  border-color: rgba(14,165,233,0.35);
}
.sr-mapFinish{
  min-width: 220px;
}
`;