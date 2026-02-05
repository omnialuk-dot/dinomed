import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

function fmt(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso || "";
  }
}

function clamp(v, max = 500) {
  const s = String(v ?? "");
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

export default function AdminSegnalazioni() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Filtri
  const [status, setStatus] = useState("");
  const [materia, setMateria] = useState("");
  const [from, setFrom] = useState(""); // yyyy-mm-dd
  const [to, setTo] = useState("");

  const query = useMemo(() => {
    const q = {};
    if (status) q.status = status;
    if (materia) q.materia = materia;
    // backend confronta ISO: convertiamo in ISO "pulito"
    if (from) q.date_from = `${from}T00:00:00`;
    if (to) q.date_to = `${to}T23:59:59`;
    return q;
  }, [status, materia, from, to]);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await api.listReports(query);
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (e) {
      setItems([]);
      setErr(String(e?.message || "Impossibile caricare segnalazioni"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function patch(id, payload) {
    try {
      const res = await api.updateReport(id, payload);
      const upd = res?.item;
      setItems((prev) => prev.map((x) => (x.id === id ? upd : x)));
    } catch (e) {
      alert(String(e?.message || "Update fallito"));
    }
  }

  return (
    <section style={{ paddingTop: 8 }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: 12,
        flexWrap: "wrap",
        marginBottom: 10,
      }}>
        <div>
          <h2 style={{ margin: 0 }}>Segnalazioni</h2>
          <div style={{ color: "rgba(15,23,42,0.65)", fontWeight: 800 }}>
            {loading ? "Caricamento…" : `${items.length} elementi`}
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(15,23,42,0.15)",
            background: "white",
            fontWeight: 950,
            cursor: "pointer",
          }}
        >
          Aggiorna
        </button>
      </div>

      {/* Filtri */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(160px, 1fr))",
        gap: 10,
        marginBottom: 12,
      }}>
        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontWeight: 900, color: "rgba(15,23,42,0.70)" }}>Stato</div>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(15,23,42,0.14)" }}>
            <option value="">Tutti</option>
            <option value="open">open</option>
            <option value="in_review">in_review</option>
            <option value="resolved">resolved</option>
            <option value="dismissed">dismissed</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontWeight: 900, color: "rgba(15,23,42,0.70)" }}>Materia</div>
          <select value={materia} onChange={(e) => setMateria(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(15,23,42,0.14)" }}>
            <option value="">Tutte</option>
            <option value="Chimica">Chimica</option>
            <option value="Fisica">Fisica</option>
            <option value="Biologia">Biologia</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontWeight: 900, color: "rgba(15,23,42,0.70)" }}>Da</div>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(15,23,42,0.14)" }} />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontWeight: 900, color: "rgba(15,23,42,0.70)" }}>A</div>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(15,23,42,0.14)" }} />
        </label>
      </div>

      {err ? (
        <div style={{
          padding: 12,
          borderRadius: 14,
          border: "1px solid rgba(244,63,94,0.25)",
          background: "rgba(244,63,94,0.06)",
          fontWeight: 900,
          color: "rgba(190,18,60,0.96)",
          marginBottom: 10,
        }}>{err}</div>
      ) : null}

      {/* Lista */}
      {loading ? (
        <div style={{ padding: 12, color: "rgba(15,23,42,0.70)", fontWeight: 850 }}>Caricamento…</div>
      ) : items.length === 0 ? (
        <div style={{ padding: 12, color: "rgba(15,23,42,0.70)", fontWeight: 850 }}>Nessuna segnalazione.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((r) => {
            const q = r?.question || {};
            const tipo = String(q?.tipo || "");
            const opts = Array.isArray(q?.opzioni) ? q.opzioni : [];
            const tags = Array.isArray(q?.tag) ? q.tag : [];
            return (
              <article key={r.id} style={{
                border: "1px solid rgba(15,23,42,0.12)",
                borderRadius: 18,
                background: "white",
                boxShadow: "0 18px 50px rgba(2,6,23,0.08)",
                overflow: "hidden",
              }}>
                <div style={{
                  padding: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  flexWrap: "wrap",
                  borderBottom: "1px solid rgba(15,23,42,0.08)",
                  background: "rgba(2,6,23,0.02)",
                }}>
                  <div>
                    <div style={{ fontWeight: 950, fontSize: 15 }}>
                      {q?.materia || "Materia"} • <span style={{ opacity: 0.75 }}>{tipo}</span>
                    </div>
                    <div style={{ color: "rgba(15,23,42,0.65)", fontWeight: 800, marginTop: 2 }}>
                      {fmt(r.created_at)} • <span style={{ fontWeight: 950 }}>{r.email}</span>
                    </div>
                    {tags.length ? (
                      <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {tags.slice(0, 5).map((t) => (
                          <span key={t} style={{
                            padding: "4px 8px",
                            borderRadius: 999,
                            border: "1px solid rgba(15,23,42,0.12)",
                            background: "rgba(2,6,23,0.02)",
                            fontWeight: 900,
                            fontSize: 12,
                            color: "rgba(15,23,42,0.70)",
                          }}>{t}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <select
                      value={r.status || "open"}
                      onChange={(e) => patch(r.id, { status: e.target.value })}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px solid rgba(15,23,42,0.14)",
                        fontWeight: 950,
                      }}
                    >
                      <option value="open">open</option>
                      <option value="in_review">in_review</option>
                      <option value="resolved">resolved</option>
                      <option value="dismissed">dismissed</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        const qid = q?.id;
                        if (!qid) return;
                        nav(`/admin/domande?q=${encodeURIComponent(qid)}`);
                      }}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px solid rgba(15,23,42,0.15)",
                        background: "white",
                        fontWeight: 950,
                        cursor: "pointer",
                      }}
                    >
                      Apri in Domande
                    </button>
                  </div>
                </div>

                <div style={{ padding: 14, display: "grid", gap: 10 }}>
                  <div style={{ fontWeight: 900, color: "rgba(15,23,42,0.82)" }}>
                    {clamp(q?.testo || "(testo mancante)", 900)}
                  </div>

                  {opts.length ? (
                    <div style={{ display: "grid", gap: 6 }}>
                      {opts.map((o, i) => (
                        <div key={i} style={{
                          padding: "8px 10px",
                          borderRadius: 14,
                          border: "1px solid rgba(15,23,42,0.10)",
                          background: "rgba(2,6,23,0.02)",
                          fontWeight: 850,
                          color: "rgba(15,23,42,0.80)",
                        }}>
                          <b style={{ marginRight: 8 }}>{String.fromCharCode(65 + i)}.</b> {o}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {r.user_note ? (
                    <div style={{
                      padding: 12,
                      borderRadius: 16,
                      border: "1px solid rgba(14,165,233,0.18)",
                      background: "rgba(56,189,248,0.08)",
                    }}>
                      <div style={{ fontWeight: 950, marginBottom: 4 }}>Note utente</div>
                      <div style={{ fontWeight: 850, color: "rgba(15,23,42,0.80)" }}>{r.user_note}</div>
                    </div>
                  ) : null}

                  <div style={{
                    padding: 12,
                    borderRadius: 16,
                    border: "1px solid rgba(15,23,42,0.12)",
                    background: "rgba(2,6,23,0.02)",
                  }}>
                    <div style={{ fontWeight: 950, marginBottom: 6 }}>Nota interna admin (facoltativa)</div>
                    <textarea
                      rows={3}
                      defaultValue={r.admin_note || ""}
                      placeholder="Aggiungi una nota interna…"
                      onBlur={(e) => {
                        const val = e.target.value;
                        if ((val || "") === (r.admin_note || "")) return;
                        patch(r.id, { admin_note: val });
                      }}
                      style={{
                        width: "100%",
                        resize: "vertical",
                        padding: "10px 12px",
                        borderRadius: 14,
                        border: "1px solid rgba(15,23,42,0.14)",
                        fontWeight: 850,
                      }}
                    />
                    <div style={{ marginTop: 6, fontWeight: 800, color: "rgba(15,23,42,0.55)" }}>
                      Salvataggio automatico quando esci dal campo.
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div style={{ height: 24 }} />
    </section>
  );
}
