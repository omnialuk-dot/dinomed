import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../lib/api";

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@dinomed.local");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await api.login(email.trim(), password);
      setToken(res.token);
      nav("/admin/panel", { replace: true });
    } catch (e2) {
      setErr(e2.message || "Login fallito");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
      <section style={{
        width: "min(520px, 100%)",
        borderRadius: 18,
        border: "1px solid rgba(15,23,42,0.12)",
        background: "rgba(255,255,255,0.92)",
        boxShadow: "0 18px 55px rgba(15,23,42,0.08)",
        padding: 16
      }}>
        <h1 style={{ margin: 0, fontWeight: 900, color: "#0f172a" }}>Admin DinoMed</h1>
        <p style={{ marginTop: 6, marginBottom: 12, color: "rgba(15,23,42,0.65)", fontWeight: 700 }}>
          Accesso riservato.
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(15,23,42,0.15)" }}
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(15,23,42,0.15)" }}
          />

          {err ? (
            <div style={{
              borderRadius: 14,
              border: "1px solid rgba(239,68,68,0.35)",
              background: "rgba(239,68,68,0.08)",
              padding: 10,
              fontWeight: 800
            }}>
              ⚠️ {err}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: 12,
              borderRadius: 14,
              border: "none",
              cursor: "pointer",
              fontWeight: 900,
              background: "#2563eb",
              color: "white"
            }}
          >
            {loading ? "Accesso..." : "Entra →"}
          </button>
        </form>
      </section>
    </main>
  );
}