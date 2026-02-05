import { useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL } from "../api";
import { setUserSession } from "../lib/userSession";

export default function Login() {
  const [err, setErr] = useState("");
  const [ready, setReady] = useState(false);

  const clientId = useMemo(() => import.meta.env.VITE_GOOGLE_CLIENT_ID || "", []);
  const initedRef = useRef(false);
  const handlingRef = useRef(false);

  useEffect(() => {
    setErr("");
    setReady(false);

    if (!clientId) {
      setErr("Manca VITE_GOOGLE_CLIENT_ID su Vercel.");
      return;
    }

    let cancelled = false;

    const bootOnce = () => {
      if (cancelled) return;
      if (initedRef.current) return;
      if (!window.google?.accounts?.id) return;

      initedRef.current = true;
      setReady(true);

      window.google.accounts.id.initialize({
        client_id: clientId,
        // In mobile, a full reload after login is the most reliable way
        callback: async (resp) => {
          if (handlingRef.current) return;
          handlingRef.current = true;

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

            // Hard redirect avoids rare mobile race conditions with SPA navigation
            window.location.replace("/");
          } catch {
            handlingRef.current = false;
            setErr("Accesso fallito. Riprova.");
          }
        },
      });

      const btnEl = document.getElementById("googleBtn");
      if (btnEl) {
        btnEl.innerHTML = "";
        window.google.accounts.id.renderButton(btnEl, {
          theme: "outline",
          size: "large",
          shape: "pill",
          width: 320,
        });
      }
    };

    const waitForGIS = () => {
      if (cancelled) return;
      if (window.google?.accounts?.id) {
        bootOnce();
        return;
      }
      setTimeout(waitForGIS, 120);
    };

    waitForGIS();

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  return (
    <main style={{ padding: 28, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ margin: 0 }}>Accedi</h1>

      <section
        style={{
          marginTop: 16,
          borderRadius: 18,
          padding: 18,
          background: "rgba(255,255,255,0.75)",
          border: "1px solid rgba(15,23,42,0.10)",
          boxShadow: "0 18px 50px rgba(2,6,23,0.10)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ fontSize: 15, opacity: 0.9 }}>
          Per entrare in DinoMed, accedi con Google.
        </div>

        <div style={{ marginTop: 14 }}>
          {!ready ? (
            <div style={{ opacity: 0.75, fontSize: 14 }}>Caricamento accesso Google…</div>
          ) : null}
          <div id="googleBtn" style={{ marginTop: ready ? 0 : 10 }} />
        </div>

        {err ? (
          <div style={{ marginTop: 12, color: "#b91c1c", fontSize: 14 }}>
            {err}
          </div>
        ) : null}
      </section>
    </main>
  );
}
