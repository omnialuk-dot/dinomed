import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../lib/api";

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        zIndex: 9999,
        overflowY: "auto",
        padding: 16,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(980px, 100%)",
          borderRadius: 18,
          background: "white",
          border: "1px solid rgba(15,23,42,0.12)",
          boxShadow: "0 24px 80px rgba(15,23,42,0.18)",
          padding: 14,
          marginTop: 24,
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            background: "white",
            paddingBottom: 10,
            borderBottom: "1px solid rgba(15,23,42,0.08)",
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: 950, fontSize: 18 }}>{title}</div>
          <button
            onClick={onClose}
            style={{
              border: "1px solid rgba(15,23,42,0.14)",
              borderRadius: 12,
              background: "white",
              padding: "8px 10px",
              fontWeight: 900,
              cursor: "pointer",
            }}
            type="button"
          >
            Chiudi
          </button>
        </div>
        <div style={{ marginTop: 12 }}>{children}</div>
      </div>
    </div>
  );
}

const empty = {
  materia: "Chimica",
  argomentoText: "", // tag/argomenti
  tipo: "scelta",
  testo: "",
  opzioni: ["", "", "", "", ""],
  corretta_index: 0,
  risposteText: "", // completamento
  difficolta: "Base",
  spiegazione: "",
};

function toTags(s) {
  return (s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function tagsToText(tag) {
  if (!tag) return "";
  if (Array.isArray(tag)) return tag.join(", ");
  return String(tag);
}

function letter(idx) {
  return String.fromCharCode(65 + idx);
}

export default function AdminDomande() {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [current, setCurrent] = useState({ ...empty });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await api.listDomandeAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Errore nel caricamento domande");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Deep link: /admin/domande?q=<question_id>
  useEffect(() => {
    if (!items.length) return;
    const sp = new URLSearchParams(location?.search || "");
    const want = (sp.get("q") || "").trim();
    if (!want) return;
    const found = items.find((x) => String(x.id) === String(want));
    if (!found) return;
    openEdit(found);
    // pulisci la query per evitare ri-aperture
    sp.delete("q");
    const next = sp.toString();
    const url = `${location.pathname}${next ? `?${next}` : ""}`;
    window.history.replaceState({}, "", url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, location?.search]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((x) =>
      [
        x.id,
        x.materia,
        x.tipo,
        x.testo,
        (x.tag || x.tags || []).join(" "),
        (x.opzioni || []).join(" "),
        x.corretta,
        x.corretta_index,
        (x.risposte || []).join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [items, q]);

  function openCreate() {
    setMode("create");
    setCurrent({ ...empty });
    setOpen(true);
  }

  function openEdit(it) {
    const tipo = it.tipo === "completamento" ? "completamento" : "scelta";
    setMode("edit");
    setCurrent({
      id: it.id,
      materia: it.materia || "Chimica",
      argomentoText: tagsToText(it.tag || it.tags),
      tipo,
      testo: it.testo || "",
      opzioni: Array.isArray(it.opzioni) ? it.opzioni.slice(0, 5).concat(["", "", "", "", ""]).slice(0, 5) : ["", "", "", "", ""],
      corretta_index:
        Number.isFinite(it.corretta_index)
          ? it.corretta_index
          : typeof it.corretta === "string"
          ? Math.max(0, Math.min(4, it.corretta.trim().toUpperCase().charCodeAt(0) - 65))
          : 0,
      risposteText: Array.isArray(it.risposte) ? it.risposte.join(", ") : it.risposta || "",
      difficolta: it.difficolta || "Base",
      spiegazione: it.spiegazione || "",
    });
    setOpen(true);
  }

  function buildPayload() {
    const base = {
      materia: current.materia,
      tipo: current.tipo,
      testo: (current.testo || "").trim(),
      tag: toTags(current.argomentoText),
      spiegazione: (current.spiegazione || "").trim() || null,
      difficolta: (current.difficolta || "Base").trim(),
    };
    if (current.tipo === "scelta") {
      const opzioni = (current.opzioni || []).map((x) => String(x || "").trim());
      return {
        ...base,
        opzioni,
        corretta_index: Number(current.corretta_index) || 0,
      };
    }
    const risposte = (current.risposteText || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    return {
      ...base,
      risposte,
    };
  }

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    setErr("");

    const payload = buildPayload();
    if (!payload.testo) {
      setErr("Testo domanda obbligatorio");
      setSaving(false);
      return;
    }
    if (!payload.materia) {
      setErr("Materia obbligatoria");
      setSaving(false);
      return;
    }
    if (payload.tipo === "scelta") {
      if (!Array.isArray(payload.opzioni) || payload.opzioni.length !== 5 || payload.opzioni.some((x) => !x)) {
        setErr("Inserisci 5 opzioni valide");
        setSaving(false);
        return;
      }
      if (payload.corretta_index < 0 || payload.corretta_index > 4) {
        setErr("Risposta corretta non valida");
        setSaving(false);
        return;
      }
    } else {
      if (!Array.isArray(payload.risposte) || payload.risposte.length === 0) {
        setErr("Inserisci almeno 1 risposta corretta (separata da virgola)");
        setSaving(false);
        return;
      }
    }

    try {
      if (mode === "create") {
        await api.createDomanda(payload);
      } else {
        await api.updateDomanda(current.id, payload);
      }
      setOpen(false);
      await load();
    } catch (e2) {
      setErr(e2.message || "Errore nel salvataggio");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    if (!confirm("Eliminare questa domanda?")) return;
    try {
      await api.deleteDomanda(id);
      await load();
    } catch (e) {
      setErr(e.message || "Errore eliminazione");
    }
  }

  const card = {
    border: "1px solid rgba(15,23,42,0.10)",
    borderRadius: 16,
    background: "white",
    padding: 12,
    boxShadow: "0 18px 50px rgba(15,23,42,0.08)",
  };

  const btn = (primary = false) => ({
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.14)",
    background: primary ? "rgba(37,99,235,0.10)" : "white",
    fontWeight: 950,
    cursor: "pointer",
  });

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 1000, fontSize: 18 }}>Banca Domande</div>
          <div style={{ color: "rgba(15,23,42,0.65)", fontWeight: 800 }}>
            CRUD completo (materia, argomento/tag, tipo, risposta corretta).
          </div>
        </div>
        <button onClick={openCreate} style={btn(true)} type="button">
          + Nuova domanda
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cerca per testo, materia, tag, opzioni..."
          style={{
            flex: "1 1 320px",
            padding: "12px 12px",
            borderRadius: 12,
            border: "1px solid rgba(15,23,42,0.14)",
            fontWeight: 800,
          }}
        />
        <button onClick={load} style={btn(false)} type="button">
          Aggiorna
        </button>
      </div>

      {err ? (
        <div
          style={{
            padding: "12px 12px",
            borderRadius: 14,
            border: "1px solid rgba(185,28,28,0.22)",
            background: "rgba(185,28,28,0.06)",
            fontWeight: 900,
            color: "rgba(127,29,29,0.92)",
            whiteSpace: "pre-wrap",
          }}
        >
          {err}
        </div>
      ) : null}

      {loading ? (
        <div style={card}>Caricamento…</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {filtered.map((it) => {
            const tipo = it.tipo === "completamento" ? "completamento" : "scelta";
            const tags = it.tag || it.tags || [];
            return (
              <div key={it.id} style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <span
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        border: "1px solid rgba(15,23,42,0.12)",
                        background: "rgba(15,23,42,0.04)",
                        fontWeight: 950,
                        fontSize: 12,
                      }}
                    >
                      {it.materia}
                    </span>
                    <span
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        border: "1px solid rgba(37,99,235,0.20)",
                        background: "rgba(37,99,235,0.06)",
                        fontWeight: 950,
                        fontSize: 12,
                      }}
                    >
                      {tipo === "scelta" ? "Crocette" : "Completamento"}
                    </span>
                    {tags.length ? (
                      <span style={{ color: "rgba(15,23,42,0.65)", fontWeight: 850, fontSize: 12 }}>
                        {tags.join(" • ")}
                      </span>
                    ) : null}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => openEdit(it)} style={btn(false)} type="button">
                      Modifica
                    </button>
                    <button
                      onClick={() => onDelete(it.id)}
                      style={{ ...btn(false), borderColor: "rgba(185,28,28,0.22)", background: "rgba(185,28,28,0.06)" }}
                      type="button"
                    >
                      Elimina
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 10, fontWeight: 950 }}>{it.testo}</div>

                {tipo === "scelta" ? (
                  <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                    {(it.opzioni || []).slice(0, 5).map((o, i) => {
                      const ci = Number.isFinite(it.corretta_index)
                        ? it.corretta_index
                        : typeof it.corretta === "string"
                        ? it.corretta.trim().toUpperCase().charCodeAt(0) - 65
                        : -1;
                      const ok = i === ci;
                      return (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "flex-start",
                            padding: "8px 10px",
                            borderRadius: 12,
                            border: `1px solid ${ok ? "rgba(34,197,94,0.28)" : "rgba(15,23,42,0.10)"}`,
                            background: ok ? "rgba(34,197,94,0.06)" : "rgba(15,23,42,0.02)",
                            fontWeight: 850,
                          }}
                        >
                          <div style={{ width: 26, fontWeight: 1000 }}>{letter(i)}</div>
                          <div style={{ flex: 1 }}>{o}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ marginTop: 10, color: "rgba(15,23,42,0.72)", fontWeight: 850 }}>
                    Risposte corrette: {(it.risposte || []).join(", ") || "—"}
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 ? <div style={card}>Nessuna domanda trovata.</div> : null}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={mode === "create" ? "Nuova domanda" : "Modifica domanda"}
      >
        <form onSubmit={onSave} style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 950, marginBottom: 6 }}>Materia</div>
              <select
                value={current.materia}
                onChange={(e) => setCurrent((p) => ({ ...p, materia: e.target.value }))}
                style={{ width: "100%", padding: "12px 12px", borderRadius: 12, border: "1px solid rgba(15,23,42,0.14)", fontWeight: 850 }}
              >
                <option>Chimica</option>
                <option>Fisica</option>
                <option>Biologia</option>
              </select>
            </div>
            <div>
              <div style={{ fontWeight: 950, marginBottom: 6 }}>Tipo domanda</div>
              <select
                value={current.tipo}
                onChange={(e) => setCurrent((p) => ({ ...p, tipo: e.target.value }))}
                style={{ width: "100%", padding: "12px 12px", borderRadius: 12, border: "1px solid rgba(15,23,42,0.14)", fontWeight: 850 }}
              >
                <option value="scelta">Crocette</option>
                <option value="completamento">Completamento</option>
              </select>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 950, marginBottom: 6 }}>Argomento / Tag (separa con virgola)</div>
            <input
              value={current.argomentoText}
              onChange={(e) => setCurrent((p) => ({ ...p, argomentoText: e.target.value }))}
              placeholder="es. Reazioni organiche, Acidi-basi"
              style={{ width: "100%", padding: "12px 12px", borderRadius: 12, border: "1px solid rgba(15,23,42,0.14)", fontWeight: 850 }}
            />
          </div>

          <div>
            <div style={{ fontWeight: 950, marginBottom: 6 }}>Testo domanda</div>
            <textarea
              value={current.testo}
              onChange={(e) => setCurrent((p) => ({ ...p, testo: e.target.value }))}
              rows={4}
              style={{ width: "100%", padding: "12px 12px", borderRadius: 12, border: "1px solid rgba(15,23,42,0.14)", fontWeight: 850, resize: "vertical" }}
            />
          </div>

          {current.tipo === "scelta" ? (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 950 }}>Opzioni (5)</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ fontWeight: 900, color: "rgba(15,23,42,0.65)" }}>Corretta</div>
                  <select
                    value={current.corretta_index}
                    onChange={(e) => setCurrent((p) => ({ ...p, corretta_index: Number(e.target.value) }))}
                    style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(15,23,42,0.14)", fontWeight: 900 }}
                  >
                    {[0, 1, 2, 3, 4].map((i) => (
                      <option key={i} value={i}>
                        {letter(i)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {current.opzioni.map((val, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "56px 1fr", gap: 10, alignItems: "center" }}>
                    <div style={{ fontWeight: 1000, color: "rgba(15,23,42,0.70)" }}>{letter(i)}</div>
                    <input
                      value={val}
                      onChange={(e) => {
                        const v = e.target.value;
                        setCurrent((p) => {
                          const next = { ...p, opzioni: [...(p.opzioni || [])] };
                          next.opzioni[i] = v;
                          return next;
                        });
                      }}
                      style={{ width: "100%", padding: "12px 12px", borderRadius: 12, border: "1px solid rgba(15,23,42,0.14)", fontWeight: 850 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 950, marginBottom: 6 }}>Risposta/e corretta/e (separa con virgola)</div>
              <input
                value={current.risposteText}
                onChange={(e) => setCurrent((p) => ({ ...p, risposteText: e.target.value }))}
                placeholder="es. a, accelerazione"
                style={{ width: "100%", padding: "12px 12px", borderRadius: 12, border: "1px solid rgba(15,23,42,0.14)", fontWeight: 850 }}
              />
            </div>
          )}

          <div>
            <div style={{ fontWeight: 950, marginBottom: 6 }}>Spiegazione (opzionale)</div>
            <textarea
              value={current.spiegazione}
              onChange={(e) => setCurrent((p) => ({ ...p, spiegazione: e.target.value }))}
              rows={3}
              style={{ width: "100%", padding: "12px 12px", borderRadius: 12, border: "1px solid rgba(15,23,42,0.14)", fontWeight: 850, resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" onClick={() => setOpen(false)} style={btn(false)}>
              Annulla
            </button>
            <button type="submit" style={btn(true)} disabled={saving}>
              {saving ? "Salvataggio…" : "Salva"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
