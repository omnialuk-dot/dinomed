import { useEffect, useState } from "react";
import { api, clearToken } from "../lib/api";
import { useNavigate } from "react-router-dom";
import AdminDispense from "./AdminDispense";

export default function AdminPanel() {
  const nav = useNavigate();
  const [me, setMe] = useState(null);

  useEffect(() => {
    api.me()
      .then(setMe)
      .catch(() => {
        clearToken();
        nav("/admin", { replace: true });
      });
  }, [nav]);

  function logout() {
    clearToken();
    nav("/admin", { replace: true });
  }

  return (
    <main style={{ padding: 16 }}>
      {/* TOP BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "flex-end",
          marginBottom: 12,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Dashboard Admin</h1>
          <div style={{ color: "rgba(15,23,42,0.65)", fontWeight: 800 }}>
            {me ? `Loggato come ${me.email}` : "Caricamento..."}
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(15,23,42,0.15)",
            background: "white",
            fontWeight: 950,
            cursor: "pointer",
          }}
          type="button"
        >
          Logout
        </button>
      </div>

      {/* CONTENUTO: DISPENSE */}
      <AdminDispense />
    </main>
  );
}