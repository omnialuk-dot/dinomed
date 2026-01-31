import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";
import { setUserSession } from "../lib/userSession";

export default function Login() {
  const nav = useNavigate();
  const [err, setErr] = useState("");
  const clientId = useMemo(() => import.meta.env.VITE_GOOGLE_CLIENT_ID || "", []);

  useEffect(() => {
    setErr("");
    if (!clientId) {
      setErr("Manca VITE_GOOGLE_CLIENT_ID su Vercel.");
      return;
    }

    const boot = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (resp) => {
          try {
            const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id_token: resp.credential }),
            });
            if (!res.ok) throw new Error("login_failed");
            const data = await res.json();
            if (!data?.token) throw new Error("no_token");

            setUserSession({ token: data.token, user: data.user });
            nav("/profilo", { replace: true });
          } catch {
            setErr("Accesso fallito. Riprova.");
          }
        },
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { theme: "outline", size: "large", shape: "pill", width: 320 }
      );
    };

    const t = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(t);
        boot();
      }
    }, 100);

    return () => clearInterval(t);
  }, [clientId, nav]);

  return (
    <main style={{ padding: 28, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ margin: 0 }}>Accedi</h1>

      <section style={{
        marginTop: 16,
        borderRadius: 18,
        padding: 18,
        background: "rgba(255,255,255,0.75)",
        border: "1px solid rgba(15,23,42,0.10)",
        boxShadow: "0 18px 50px rgba(2,6,23,0.10)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}>
        <div style={{ fontWeight: 700, color: "rgba(2,6,23,0.75)" }}>
          Per usare DinoMed è necessario un account.
        </div>

        <div style={{ marginTop: 14 }}>
          <div id="googleBtn" />
        </div>

        {err ? <div style={{ marginTop: 12, color: "#b91c1c", fontWeight: 700 }}>{err}</div> : null}
      </section>
    </main>
  );
}
