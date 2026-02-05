import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

// ---------- utils ----------
function makeId() {
  return `q_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function textToTags(s) {
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
function pill(bg, border, color) {
  return {
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${border}`,
    background: bg,
    color,
    fontWeight: 950,
    fontSize: 12,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };
}

// ---------- Modal (SCROLL FIX) ----------
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

        // ✅ consenti scroll del contenuto
        overflowY: "auto",
        padding: 16,

        // meglio in alto quando la pagina è lunga
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

          // ✅ limite altezza + scroll interno
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

// ---------- default ----------
const emptySim = {
  titolo: "",
  descrizione: "",
  materia: "Altro",
  durata_min: 20,
  difficolta: "Base",
  tagText: "",
  pubblicata: true,
  domande: [],
};

// ---------- domanda builders (ID FIX) ----------
function newDomandaScelta() {
  return {
    qid: makeId(), // ✅ ID unico
    tipo: "scelta",
    testo: "",
    opzioni: ["", ""],
    corretta: 0,
    spiegazione: "",
  };
}
function newDomandaComp() {
  return {
    qid: makeId(), // ✅ ID unico
    tipo: "completamento",
    testo: "",
    risposteText: "", // UI only
    spiegazione: "",
  };
}

export default function AdminSimulazioni() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [current, setCurrent] = useState({ ...emptySim });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await api.listSimulazioniAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Errore nel caricamento simulazioni");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((x) =>
      [x.titolo, x.descrizione, x.materia, x.difficolta, (x.tag || []).join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [items, q]);

  function openCreate() {
    setMode("create");
    setCurrent({ ...emptySim, domande: [] });
    setOpen(true);
  }

  function openEdit(it) {
    const domande = Array.isArray(it.domande) ? it.domande : [];

    // ✅ normalizzo e assegno qid a tutte (anche se vecchie)
    const domUI = domande.map((d) => {
      const tipo = (d.tipo || "scelta") === "completamento" ? "completamento" : "scelta";
      if (tipo === "completamento") {
        return {
          qid: d.qid || makeId(),
          tipo: "completamento",
          testo: d.testo || "",
          risposteText: Array.isArray(d.risposte) ? d.risposte.join(", ") : "",
          spiegazione: d.spiegazione || "",
        };
      }
      return {
        qid: d.qid || makeId(),
        tipo: "scelta",
        testo: d.testo || "",
        opzioni: Array.isArray(d.opzioni) ? d.opzioni : ["", ""],
        corretta: Number.isFinite(d.corretta) ? d.corretta : 0,
        spiegazione: d.spiegazione || "",
      };
    });

    setMode("edit");
    setCurrent({
      titolo: it.titolo || "",
      descrizione: it.descrizione || "",
      materia: it.materia || "Altro",
      durata_min: it.durata_min || 20,
      difficolta: it.difficolta || "Base",
      tagText: tagsToText(it.tag),
      pubblicata: it.pubblicata ?? true,
      domande: domUI,
      id: it.id,
    });
    setOpen(true);
  }

  function buildPayload() {
    const tagArr = textToTags(current.tagText);

    const domande = (current.domande || []).map((d) => {
      if (d.tipo === "completamento") {
        const risposte = (d.risposteText || "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);
        return {
          qid: d.qid,
          tipo: "completamento",
          testo: (d.testo || "").trim(),
          risposte,
          spiegazione: (d.spiegazione || "").trim() || null,
        };
      }
      const opzioni = (d.opzioni || []).map((x) => String(x || "").trim());
      return {
        qid: d.qid,
        tipo: "scelta",
        testo: (d.testo || "").trim(),
        opzioni,
        corretta: Number(d.corretta),
        spiegazione: (d.spiegazione || "").trim() || null,
      };
    });

    return {
      titolo: current.titolo.trim(),
      materia: (current.materia || "Altro").trim(),
      descrizione: current.descrizione.trim(),
      durata_min: parseInt(current.durata_min, 10) || 20,
      difficolta: (current.difficolta || "Base").trim(),
      tag: tagArr,
      pubblicata: !!current.pubblicata,
      domande,
    };
  }

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    setErr("");

    const payload = buildPayload();

    // validazioni base (UX)
    const fail = (msg) => {
      setErr(msg);
      setSaving(false);
      throw new Error(msg);
    };

    if (!payload.titolo) return fail("Titolo obbligatorio");
    if (!payload.descrizione) return fail("Descrizione obbligatoria");
    if (!payload.materia) return fail("Materia obbligatoria");
    if (!payload.durata_min || payload.durata_min < 1) return fail("Durata non valida");
    if (!payload.tag || payload.tag.length === 0) return fail("Inserisci almeno 1 tag");

    for (let i = 0; i < payload.domande.length; i++) {
      const d = payload.domande[i];
      const n = i + 1;
      if (!d.testo) return fail(`Domanda #${n}: testo obbligatorio`);

      if (d.tipo === "scelta") {
        const ops = (d.opzioni || []).filter((x) => String(x).trim());
        if (ops.length < 2) return fail(`Domanda #${n}: servono almeno 2 opzioni`);
        if (!Number.isInteger(d.corretta)) return fail(`Domanda #${n}: seleziona la corretta`);
        if (d.corretta < 0 || d.corretta >= ops.length) return fail(`Domanda #${n}: corretta fuori range`);
      } else {
        if (!d.risposte || d.risposte.length < 1)
          return fail(`Domanda #${n}: inserisci almeno 1 risposta valida`);
      }
    }

    try {
      if (mode === "create") {
        await api.createSimulazione(payload);
      } else {
        await api.updateSimulazione(current.id, payload);
      }
      setOpen(false);
      await load();
    } catch (e2) {
      setErr(e2.message || "Errore nel salvataggio simulazione");
    } finally {
      setSaving(false);
    }
  }

  async function onToggle(id) {
    try {
      await api.toggleSimulazione(id);
      await load();
    } catch (e) {
      setErr(e.message || "Errore toggle");
    }
  }

  async function onDelete(id) {
    if (!confirm("Eliminare questa simulazione?")) return;
    try {
      await api.deleteSimulazione(id);
      await load();
    } catch (e) {
      setErr(e.message || "Errore eliminazione");
    }
  }

  function addDomanda(tipo) {
    const next = tipo === "completamento" ? newDomandaComp() : newDomandaScelta();
    setCurrent((c) => ({ ...c, domande: [...(c.domande || []), next] }));
  }

  function removeDomanda(qid) {
    setCurrent((c) => ({
      ...c,
      domande: (c.domande || []).filter((d) => d.qid !== qid),
    }));
  }

  function moveDomanda(idx, dir) {
    setCurrent((c) => {
      const arr = [...(c.domande || [])];
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return c;
      const tmp = arr[idx];
      arr[idx] = arr[j];
      arr[j] = tmp;
      return { ...c, domande: arr };
    });
  }

  function updateDomanda(qid, patch) {
    setCurrent((c) => {
      const arr = [...(c.domande || [])];
      const i = arr.findIndex((x) => x.qid === qid);
      if (i === -1) return c;
      arr[i] = { ...arr[i], ...patch };
      return { ...c, domande: arr };
    });
  }

  return (
    <section
      style={{
        borderRadius: 18,
        border: "1px solid rgba(15,23,42,0.12)",
        background: "rgba(255,255,255,0.92)",
        boxShadow: "0 18px 55px rgba(15,23,42,0.06)",
        padding: 16,
        marginTop: 12,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0 }}>Simulazioni</h2>
          <div style={{ color: "rgba(15,23,42,0.65)", fontWeight: 750, marginTop: 4 }}>
            Crea simulazioni vere: timer + domande (scelta / completamento).
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca (titolo, materia, tag...)"
            style={{
              padding: 10,
              borderRadius: 12,
              border: "1px solid rgba(15,23,42,0.15)",
              minWidth: 260,
            }}
          />
          <button
            onClick={openCreate}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "none",
              background: "#2563eb",
              color: "white",
              fontWeight: 950,
              cursor: "pointer",
            }}
            type="button"
          >
            + Nuova simulazione
          </button>
        </div>
      </div>

      {err ? (
        <div
          style={{
            marginTop: 10,
            borderRadius: 14,
            border: "1px solid rgba(239,68,68,0.35)",
            background: "rgba(239,68,68,0.08)",
            padding: 10,
            fontWeight: 800,
            whiteSpace: "pre-wrap",
          }}
        >
          ⚠️ {err}
        </div>
      ) : null}

      {/* List */}
      <div style={{ marginTop: 12 }}>
        {loading ? (
          <div style={{ fontWeight: 800, color: "rgba(15,23,42,0.65)" }}>Caricamento…</div>
        ) : filtered.length === 0 ? (
          <div style={{ fontWeight: 800, color: "rgba(15,23,42,0.65)" }}>Nessuna simulazione trovata.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {filtered.map((it) => (
              <div
                key={it.id}
                style={{
                  borderRadius: 16,
                  border: "1px solid rgba(15,23,42,0.12)",
                  background: "white",
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div
                      style={{
                        fontWeight: 950,
                        color: "#0f172a",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 520,
                      }}
                    >
                      {it.titolo}
                    </div>

                    <span
                      style={{
                        ...pill(
                          it.pubblicata ? "rgba(16,185,129,0.10)" : "rgba(15,23,42,0.04)",
                          "rgba(15,23,42,0.12)",
                          "rgba(15,23,42,0.85)"
                        ),
                      }}
                    >
                      {it.pubblicata ? "Pubblicata" : "Nascosta"}
                    </span>
                  </div>

                  <div style={{ marginTop: 4, color: "rgba(15,23,42,0.65)", fontWeight: 750 }}>
                    {it.materia} • {it.difficolta} • {it.durata_min} min • domande:{" "}
                    {Array.isArray(it.domande) ? it.domande.length : 0}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={() => onToggle(it.id)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 12,
                      border: "1px solid rgba(15,23,42,0.14)",
                      background: "white",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                    type="button"
                  >
                    {it.pubblicata ? "Nascondi" : "Pubblica"}
                  </button>

                  <button
                    onClick={() => openEdit(it)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 12,
                      border: "1px solid rgba(15,23,42,0.14)",
                      background: "white",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                    type="button"
                  >
                    Modifica
                  </button>

                  <button
                    onClick={() => onDelete(it.id)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 12,
                      border: "1px solid rgba(239,68,68,0.25)",
                      background: "rgba(239,68,68,0.06)",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                    type="button"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal create/edit */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={mode === "create" ? "Nuova simulazione" : "Modifica simulazione"}
      >
        <form onSubmit={onSave} style={{ display: "grid", gap: 10 }}>
          <input
            value={current.titolo}
            onChange={(e) => setCurrent({ ...current, titolo: e.target.value })}
            placeholder="Titolo"
            required
            style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(15,23,42,0.15)" }}
          />

          <textarea
            value={current.descrizione}
            onChange={(e) => setCurrent({ ...current, descrizione: e.target.value })}
            placeholder="Descrizione (cosa valuta, cosa aspettarsi)"
            rows={3}
            required
            style={{
              padding: 12,
              borderRadius: 14,
              border: "1px solid rgba(15,23,42,0.15)",
              resize: "vertical",
            }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
            <input
              value={current.materia}
              onChange={(e) => setCurrent({ ...current, materia: e.target.value })}
              placeholder="Materia (es: Chimica)"
              required
              style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(15,23,42,0.15)" }}
            />
            <input
              value={current.durata_min}
              onChange={(e) => setCurrent({ ...current, durata_min: e.target.value })}
              placeholder="Durata (minuti)"
              type="number"
              min="1"
              required
              style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(15,23,42,0.15)" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
            <input
              value={current.difficolta}
              onChange={(e) => setCurrent({ ...current, difficolta: e.target.value })}
              placeholder="Difficoltà (Base/Intermedio/Avanzato)"
              required
              style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(15,23,42,0.15)" }}
            />
            <input
              value={current.tagText}
              onChange={(e) => setCurrent({ ...current, tagText: e.target.value })}
              placeholder="Tag (separati da virgola) es: acidi, basi, ph"
              required
              style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(15,23,42,0.15)" }}
            />
          </div>

          <label style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 900 }}>
            <input
              type="checkbox"
              checked={!!current.pubblicata}
              onChange={(e) => setCurrent({ ...current, pubblicata: e.target.checked })}
            />
            Pubblicata (visibile agli studenti)
          </label>

          {/* DOMANDE BUILDER */}
          <div
            style={{
              marginTop: 6,
              borderRadius: 16,
              border: "1px solid rgba(15,23,42,0.12)",
              background: "rgba(15,23,42,0.02)",
              padding: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 950, fontSize: 14 }}>
                Domande{" "}
                <span style={{ color: "rgba(15,23,42,0.55)", fontWeight: 900 }}>
                  ({(current.domande || []).length})
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => addDomanda("scelta")}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 12,
                    border: "1px solid rgba(15,23,42,0.14)",
                    background: "white",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  + Aggiungi (Scelta)
                </button>
                <button
                  type="button"
                  onClick={() => addDomanda("completamento")}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 12,
                    border: "1px solid rgba(15,23,42,0.14)",
                    background: "white",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  + Aggiungi (Completamento)
                </button>
              </div>
            </div>

            {(current.domande || []).length === 0 ? (
              <div style={{ marginTop: 10, color: "rgba(15,23,42,0.65)", fontWeight: 800 }}>
                Nessuna domanda ancora. Aggiungine una con i bottoni qui sopra.
              </div>
            ) : (
              <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                {(current.domande || []).map((d, idx) => (
                  <div
                    key={d.qid} // ✅ KEY UNICO (fix “Domanda #1” duplicata)
                    style={{
                      borderRadius: 16,
                      border: "1px solid rgba(15,23,42,0.12)",
                      background: "white",
                      padding: 12,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 950 }}>Domanda #{idx + 1}</span>
                        <span
                          style={pill(
                            d.tipo === "scelta" ? "rgba(37,99,235,0.08)" : "rgba(16,185,129,0.10)",
                            "rgba(15,23,42,0.12)",
                            "rgba(15,23,42,0.85)"
                          )}
                        >
                          {d.tipo === "scelta" ? "Scelta multipla" : "Completamento"}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => moveDomanda(idx, -1)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 12,
                            border: "1px solid rgba(15,23,42,0.14)",
                            background: "white",
                            fontWeight: 900,
                            cursor: "pointer",
                          }}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveDomanda(idx, +1)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 12,
                            border: "1px solid rgba(15,23,42,0.14)",
                            background: "white",
                            fontWeight: 900,
                            cursor: "pointer",
                          }}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeDomanda(d.qid)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 12,
                            border: "1px solid rgba(239,68,68,0.25)",
                            background: "rgba(239,68,68,0.06)",
                            fontWeight: 900,
                            cursor: "pointer",
                          }}
                        >
                          Rimuovi
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={d.testo}
                      onChange={(e) => updateDomanda(d.qid, { testo: e.target.value })}
                      placeholder="Testo domanda..."
                      rows={3}
                      style={{
                        marginTop: 10,
                        width: "100%",
                        padding: 12,
                        borderRadius: 14,
                        border: "1px solid rgba(15,23,42,0.15)",
                        resize: "vertical",
                      }}
                    />

                    {d.tipo === "scelta" ? (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontWeight: 950, marginBottom: 8 }}>Opzioni (scegli la corretta)</div>

                        <div style={{ display: "grid", gap: 8 }}>
                          {(d.opzioni || []).map((opt, j) => (
                            <div key={`${d.qid}-${j}`} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <input
                                type="radio"
                                name={`corr-${d.qid}`} // ✅ radio group unico per domanda
                                checked={Number(d.corretta) === j}
                                onChange={() => updateDomanda(d.qid, { corretta: j })}
                              />
                              <input
                                value={opt}
                                onChange={(e) => {
                                  const ops = [...(d.opzioni || [])];
                                  ops[j] = e.target.value;
                                  updateDomanda(d.qid, { opzioni: ops });
                                }}
                                placeholder={`Opzione ${j + 1}`}
                                style={{
                                  flex: 1,
                                  padding: 10,
                                  borderRadius: 12,
                                  border: "1px solid rgba(15,23,42,0.15)",
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  let ops = [...(d.opzioni || [])];
                                  if (ops.length <= 2) return;
                                  ops = ops.filter((_, k) => k !== j);
                                  let corr = Number.isInteger(d.corretta) ? d.corretta : 0;
                                  if (corr >= ops.length) corr = ops.length - 1;
                                  updateDomanda(d.qid, { opzioni: ops, corretta: corr });
                                }}
                                style={{
                                  padding: "8px 10px",
                                  borderRadius: 12,
                                  border: "1px solid rgba(15,23,42,0.14)",
                                  background: "white",
                                  fontWeight: 900,
                                  cursor: "pointer",
                                }}
                                title="Rimuovi opzione (minimo 2)"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>

                        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            type="button"
                            onClick={() => updateDomanda(d.qid, { opzioni: [...(d.opzioni || []), ""] })}
                            style={{
                              padding: "8px 10px",
                              borderRadius: 12,
                              border: "1px solid rgba(15,23,42,0.14)",
                              background: "white",
                              fontWeight: 900,
                              cursor: "pointer",
                            }}
                          >
                            + Aggiungi opzione
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontWeight: 950, marginBottom: 8 }}>
                          Risposte accettate (separate da virgola)
                        </div>
                        <input
                          value={d.risposteText || ""}
                          onChange={(e) => updateDomanda(d.qid, { risposteText: e.target.value })}
                          placeholder="es: 6.022e23, 6,022×10^23, numero di Avogadro"
                          style={{
                            width: "100%",
                            padding: 10,
                            borderRadius: 12,
                            border: "1px solid rgba(15,23,42,0.15)",
                          }}
                        />
                        <div
                          style={{
                            marginTop: 6,
                            color: "rgba(15,23,42,0.60)",
                            fontWeight: 800,
                            fontSize: 12,
                          }}
                        >
                          Tip: useremo confronto case-insensitive nella prova.
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontWeight: 950, marginBottom: 8 }}>Spiegazione (opzionale)</div>
                      <textarea
                        value={d.spiegazione || ""}
                        onChange={(e) => updateDomanda(d.qid, { spiegazione: e.target.value })}
                        placeholder="Spiega perché la risposta è corretta (apparirà nella correzione)."
                        rows={2}
                        style={{
                          width: "100%",
                          padding: 12,
                          borderRadius: 14,
                          border: "1px solid rgba(15,23,42,0.15)",
                          resize: "vertical",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: 12,
              borderRadius: 14,
              border: "none",
              background: "#0f172a",
              color: "white",
              fontWeight: 950,
              cursor: "pointer",
            }}
          >
            {saving ? "Salvataggio..." : "Salva simulazione"}
          </button>

          <div style={{ fontSize: 12, color: "rgba(15,23,42,0.55)", fontWeight: 800 }}>
            Dopo il salvataggio: apparirà nella pagina “Simulazioni” (solo se Pubblicata).
          </div>
        </form>
      </Modal>
    </section>
  );
}