import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");

/* ---------------- Error Boundary (anti bianco) ---------------- */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(error) {
    return { err: error };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("SimulazioniRun crash:", error, info);
  }
  render() {
    if (this.state.err) {
      return (
        <div style={inlineStyles.crashWrap}>
          <div style={inlineStyles.crashCard}>
            <div style={inlineStyles.crashTitle}>Errore nella pagina (non può essere bianco)</div>
            <div style={inlineStyles.crashSub}>
              Copia questo testo e mandamelo: ci dice ESATTAMENTE cosa sta rompendo.
            </div>
            <pre style={inlineStyles.crashPre}>
{String(this.state.err?.stack || this.state.err?.message || this.state.err || "Errore sconosciuto")}
            </pre>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button style={inlineStyles.crashBtn} onClick={() => window.location.reload()}>
                Ricarica
              </button>
              <button
                style={inlineStyles.crashBtn2}
                onClick={() => (window.location.href = "/simulazioni/config")}
              >
                Torna a Config
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---------------- Utils ---------------- */
function getQueryParam(name) {
  try {
    const u = new URL(window.location.href);
    return u.searchParams.get(name);
  } catch {
    return null;
  }
}

function clampInt(v, min, max, fallback) {
  const n = parseInt(String(v), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

/* ===========================
   SIMULAZIONI RUN (UI base)
   =========================== */
export default function SimulazioniRun() {
  return (
    <ErrorBoundary>
      <SimulazioniRunInner />
    </ErrorBoundary>
  );
}

function SimulazioniRunInner() {
  const nav = useNavigate();
  const location = useLocation();

  // session id: prima query (?s=) poi location.state
  const sessionId = useMemo(() => {
    const qs = getQueryParam("s");
    const st = location?.state?.sessionId;
    return qs || st || "";
  }, [location?.state]);

  const config = location?.state?.config || null;

  const [fatal, setFatal] = useState("");
  const [loading, setLoading] = useState(true);

  // payload sessione/domande dal backend
  const [payload, setPayload] = useState(null);

  // log errori runtime in overlay (extra)
  const [jsErr, setJsErr] = useState("");
  const didBindErr = useRef(false);

  useEffect(() => {
    if (didBindErr.current) return;
    didBindErr.current = true;

    const onErr = (e) => {
      const msg = e?.error?.stack || e?.message || "Errore JS";
      setJsErr(String(msg));
    };
    const onRej = (e) => {
      const msg = e?.reason?.stack || e?.reason?.message || e?.reason || "Promise rejection";
      setJsErr(String(msg));
    };

    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);
    return () => {
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRej);
    };
  }, []);

  // se manca sessionId, NON bianco: mostro card
  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      setFatal("Sessione mancante (sessionId). Torna alla configurazione e premi “Avvia prova”.");
    }
  }, [sessionId]);

  // carica sessione/domande (se il tuo backend ha endpoint diversi, almeno vediamo l’errore a schermo)
  useEffect(() => {
    if (!sessionId) return;

    let alive = true;

    async function run() {
      setLoading(true);
      setFatal("");

      const candidates = [
        `/api/sim/session/${encodeURIComponent(sessionId)}`,
        `/api/sim/session/${encodeURIComponent(sessionId)}/`,
        `/api/simulazioni/session/${encodeURIComponent(sessionId)}`,
        `/api/simulazioni/session/${encodeURIComponent(sessionId)}/`,
        `/api/sim/${encodeURIComponent(sessionId)}`,
        `/api/sim/${encodeURIComponent(sessionId)}/`,
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
            // se 404 provo il prossimo
            if (res.status === 404) continue;
            throw new Error(last);
          }
          let data = null;
          try {
            data = JSON.parse(txt);
          } catch {
            data = null;
          }
          if (!data) throw new Error("Risposta OK ma JSON non valido.\n" + last);

          if (!alive) return;
          setPayload(data);
          setLoading(false);
          return;
        } catch (e) {
          // continua solo se 404
          const m = String(e?.message || e || "");
          if (m.includes("[404]")) continue;
          if (!alive) return;
          setFatal(m || "Errore sconosciuto");
          setLoading(false);
          return;
        }
      }

      if (!alive) return;
      setFatal(
        "Non trovo l’endpoint per caricare la sessione.\n" +
          "Questo NON è più schermo bianco: ora vediamo cosa manca.\n\n" +
          last
      );
      setLoading(false);
    }

    run();
    return () => {
      alive = false;
    };
  }, [sessionId]);

  /* ---------------- UI base (non “bella”, ma solida) ---------------- */
  return (
    <main style={inlineStyles.page}>
      <div style={inlineStyles.card}>
        <div style={inlineStyles.topRow}>
          <div style={inlineStyles.kicker}>
            <span style={inlineStyles.dot} aria-hidden="true" />
            <span style={inlineStyles.brand}>
              <span style={inlineStyles.dino}>Dino</span>
              <span style={inlineStyles.med}>Med</span>
            </span>
            <span style={{ opacity: 0.55 }}>•</span>
            <span style={{ fontWeight: 900 }}>Prova</span>
          </div>

          <button style={inlineStyles.linkBtn} onClick={() => nav("/simulazioni/config")}>
            Torna a Config
          </button>
        </div>

        <div style={inlineStyles.meta}>
          <div><b>Route:</b> /simulazioni/run</div>
          <div><b>sessionId:</b> <code>{sessionId || "—"}</code></div>
          <div><b>API_BASE:</b> <code>{API_BASE}</code></div>
        </div>

        {jsErr ? (
          <div style={inlineStyles.errBox}>
            <b>Errore JS intercettato:</b>
            <pre style={inlineStyles.pre}>{jsErr}</pre>
          </div>
        ) : null}

        {loading ? <div style={inlineStyles.soft}>Caricamento prova…</div> : null}

        {fatal ? (
          <div style={inlineStyles.errBox}>
            <b>Errore:</b>
            <pre style={inlineStyles.pre}>{fatal}</pre>
          </div>
        ) : null}

        {!loading && !fatal && (
          <div style={inlineStyles.okBox}>
            <div style={{ fontWeight: 950 }}>✅ Sessione caricata.</div>
            <div style={{ marginTop: 8, fontWeight: 800, opacity: 0.8 }}>
              Ora incollami qui cosa contiene il payload (ti basta copiare la prima riga che vedi sotto),
              così lo trasformo nell’interfaccia “premium” completa.
            </div>
            <pre style={inlineStyles.pre}>
{JSON.stringify(
  {
    keys: payload ? Object.keys(payload) : [],
    sample: payload
      ? {
          session_id: payload.session_id || payload.id,
          sections: payload.sections ? payload.sections.length : undefined,
          questions: payload.questions ? payload.questions.length : undefined,
        }
      : null,
    hasConfigFromNav: Boolean(config),
  },
  null,
  2
)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}

/* ---------------- Inline styles (zero CSS esterno) ---------------- */
const inlineStyles = {
  page: {
    maxWidth: 1120,
    margin: "0 auto",
    padding: 22,
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
  },
  card: {
    borderRadius: 24,
    border: "1px solid rgba(15,23,42,0.10)",
    background:
      "radial-gradient(900px 320px at 12% -25%, rgba(34,197,94,0.16), transparent 60%)," +
      "radial-gradient(900px 320px at 78% -30%, rgba(56,189,248,0.16), transparent 55%), rgba(255,255,255,0.92)",
    boxShadow: "0 18px 60px rgba(2,6,23,0.10)",
    padding: 18,
  },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
  kicker: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.74)",
    fontWeight: 950,
    color: "rgba(15,23,42,0.82)",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "linear-gradient(90deg, #16a34a, #0ea5e9)",
    boxShadow: "0 10px 20px rgba(2,6,23,0.10)",
  },
  brand: { display: "inline-flex", gap: 0 },
  dino: { color: "#16a34a", fontWeight: 1000 },
  med: { color: "#0ea5e9", fontWeight: 1000 },

  linkBtn: {
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.76)",
    fontWeight: 900,
    cursor: "pointer",
  },

  meta: { marginTop: 12, fontWeight: 800, opacity: 0.8, display: "grid", gap: 6 },
  soft: { marginTop: 14, fontWeight: 900, opacity: 0.75 },

  errBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 16,
    border: "1px solid rgba(185,28,28,0.22)",
    background: "rgba(185,28,28,0.06)",
    color: "#b91c1c",
    fontWeight: 900,
  },
  okBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 16,
    border: "1px solid rgba(34,197,94,0.22)",
    background: "rgba(34,197,94,0.06)",
    color: "rgba(15,23,42,0.92)",
    fontWeight: 900,
  },
  pre: { marginTop: 10, whiteSpace: "pre-wrap", fontWeight: 800, fontSize: 12, opacity: 0.9 },

  crashWrap: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "rgba(2,6,23,0.06)",
    padding: 18,
  },
  crashCard: {
    maxWidth: 980,
    width: "100%",
    borderRadius: 18,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "white",
    boxShadow: "0 18px 60px rgba(2,6,23,0.12)",
    padding: 16,
  },
  crashTitle: { fontWeight: 1000, fontSize: 18 },
  crashSub: { marginTop: 6, opacity: 0.8, fontWeight: 800 },
  crashPre: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(2,6,23,0.04)",
    whiteSpace: "pre-wrap",
    fontSize: 12,
    fontWeight: 700,
  },
  crashBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(255,255,255,0.9)",
    fontWeight: 900,
    cursor: "pointer",
  },
  crashBtn2: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "linear-gradient(90deg, rgba(22,163,74,0.18), rgba(14,165,233,0.18))",
    fontWeight: 900,
    cursor: "pointer",
  },
};