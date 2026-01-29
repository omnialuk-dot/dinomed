import { useEffect, useMemo, useState } from "react";
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
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(820px, 100%)",
          borderRadius: 18,
          background: "white",
          border: "1px solid rgba(15,23,42,0.12)",
          boxShadow: "0 24px 80px rgba(15,23,42,0.18)",
          padding: 14,
        }}
      >
        <div
          style={{
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
  titolo: "",
  descrizione: "",
  materia: "Altro",
  livello: "Base", // solo UI
  aChiServe: "",
  pagine: 1,
  tagText: "",
  filename: "",
  link: "", // solo UI, se vuoi usarlo più avanti
  pubblicata: true,
};

function tagsToText(tag) {
  if (!tag) return "";
  if (Array.isArray(tag)) return tag.join(", ");
  return String(tag);
}

export default function AdminDispense() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [current, setCurrent] = useState({ ...empty });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await api.listDispenseAll(); // richiede auth
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Errore nel caricamento dispense");
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
      [
        x.titolo,
        x.descrizione,
        x.materia,
        x.aChiServe,
        (x.tag || []).join(" "),
        x.filename,
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
    setMode("edit");
    setCurrent({
      titolo: it.titolo || "",
      descrizione: it.descrizione || "",
      materia: it.materia || "Altro",
      livello: "Base",
      aChiServe: it.aChiServe || "",
      pagine: it.pagine || 1,
      tagText: tagsToText(it.tag),
      filename: it.filename || "",
      link: "",
      pubblicata: it.pubblicata ?? true,
      id: it.id,
    });
    setOpen(true);
  }

  function buildPayload() {
    const tagArr = (current.tagText || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      titolo: current.titolo.trim(),
      materia: (current.materia || "Altro").trim(),
      descrizione: current.descrizione.trim(),
      aChiServe: current.aChiServe.trim(),
      pagine: parseInt(current.pagine, 10) || 1,
      tag: tagArr,
      filename: (current.filename || "").trim() || null,
      pubblicata: !!current.pubblicata,
    };
  }

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    setErr("");

    const payload = buildPayload();

    // validazioni base lato frontend (per UX migliore)
    if (!payload.titolo) {
      setErr("Titolo obbligatorio");
      setSaving(false);
      return;
    }
    if (!payload.aChiServe) {
      setErr("‘A chi serve’ è obbligatorio");
      setSaving(false);
      return;
    }
    if (!payload.pagine || payload.pagine < 1) {
      setErr("Numero pagine non valido");
      setSaving(false);
      return;
    }
    if (!payload.tag || payload.tag.length === 0) {
      setErr("Inserisci almeno 1 tag (separati da virgola)");
      setSaving(false);
      return;
    }

    try {
      if (mode === "create") {
        await api.createDispensa(payload);
      } else {
        await api.updateDispensa(current.id, payload);
      }
      setOpen(false);
      await load();
    } catch (e2) {
      setErr(e2.message || "Errore nel salvataggio");
    } finally {
      setSaving(false);
    }
  }

  async function onToggle(id) {
    try {
      await api.toggleDispensa(id);
      await load();
    } catch (e) {
      setErr(e.message || "Errore toggle");
    }
  }

  async function onDelete(id) {
    if (!confirm("Eliminare questa dispensa?")) return;
    try {
      await api.deleteDispensa(id);
      await load();
    } catch (e) {
      setErr(e.message || "Errore eliminazione");
    }
  }

  return (
    <section
      style={{
        borderRadius: 18,
        border: "1px solid rgba(15,23,42,0.12)",
        background: "rgba(255,255,255,0.92)",
        boxShadow: "0 18px 55px rgba(15,23,42,0.06)",
        padding: 16,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Dispense</h2>
          <div style={{ color: "rgba(15,23,42,0.65)", fontWeight: 750, marginTop: 4 }}>
            Crea, modifica, pubblica/nascondi. Tutto da qui.
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
            + Nuova dispensa
          </button>
        </div>
      </div>

      {/* Error */}
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
          <div style={{ fontWeight: 800, color: "rgba(15,23,42,0.65)" }}>
            Nessuna dispensa trovata.
          </div>
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
                        fontSize: 12,
                        padding: "4px 8px",
                        borderRadius: 999,
                        border: "1px solid rgba(15,23,42,0.12)",
                        background: it.pubblicata ? "rgba(16,185,129,0.10)" : "rgba(15,23,42,0.04)",
                        fontWeight: 900,
                      }}
                    >
                      {it.pubblicata ? "Pubblicata" : "Nascosta"}
                    </span>
                  </div>

                  <div style={{ marginTop: 4, color: "rgba(15,23,42,0.65)", fontWeight: 750 }}>
                    {it.materia} • {it.pagine} pag.
                    {it.filename ? ` • file: ${it.filename}` : ""}
                  </div>

                  {it.aChiServe ? (
                    <div style={{ marginTop: 6, color: "rgba(15,23,42,0.70)", fontWeight: 650 }}>
                      <span style={{ fontWeight: 900 }}>A chi serve:</span> {it.aChiServe}
                    </div>
                  ) : null}

                  {Array.isArray(it.tag) && it.tag.length > 0 ? (
                    <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {it.tag.slice(0, 8).map((t, idx) => (
                        <span
                          key={`${it.id}-tag-${idx}`}
                          style={{
                            fontSize: 12,
                            padding: "4px 8px",
                            borderRadius: 999,
                            border: "1px solid rgba(15,23,42,0.12)",
                            background: "rgba(37,99,235,0.06)",
                            fontWeight: 900,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                      {it.tag.length > 8 ? (
                        <span style={{ fontSize: 12, color: "rgba(15,23,42,0.55)", fontWeight: 900 }}>
                          +{it.tag.length - 8}
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  {it.descrizione ? (
                    <div style={{ marginTop: 8, color: "rgba(15,23,42,0.70)", fontWeight: 650, lineHeight: 1.35 }}>
                      {it.descrizione}
                    </div>
                  ) : null}
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

      {/* Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={mode === "create" ? "Nuova dispensa" : "Modifica dispensa"}
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
            placeholder="Descrizione (breve ma utile)"
            rows={4}
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
              value={current.pagine}
              onChange={(e) => setCurrent({ ...current, pagine: e.target.value })}
              placeholder="Pagine (es: 12)"
              type="number"
              min="1"
              required
              style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(15,23,42,0.15)" }}
            />
          </div>

          <input
            value={current.aChiServe}
            onChange={(e) => setCurrent({ ...current, aChiServe: e.target.value })}
            placeholder="A chi serve? (es: ripasso veloce, base completa, ecc.)"
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

          <input
            value={current.filename}
            onChange={(e) => setCurrent({ ...current, filename: e.target.value })}
            placeholder="Filename PDF (opzionale) es: acidi-basi.pdf"
            style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(15,23,42,0.15)" }}
          />

          <label style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 900 }}>
            <input
              type="checkbox"
              checked={!!current.pubblicata}
              onChange={(e) => setCurrent({ ...current, pubblicata: e.target.checked })}
            />
            Pubblicata (visibile agli studenti)
          </label>

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
            {saving ? "Salvataggio..." : "Salva"}
          </button>

          <div style={{ fontSize: 12, color: "rgba(15,23,42,0.55)", fontWeight: 800 }}>
            Nota: al momento salviamo in JSON locale se Mongo è disattivo. Più avanti aggiungiamo upload PDF e Mongo.
          </div>
        </form>
      </Modal>
    </section>
  );
}