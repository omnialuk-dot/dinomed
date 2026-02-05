import { useEffect, useState } from "react";
import { api, clearToken } from "../lib/api";
import { useLocation, useNavigate } from "react-router-dom";
import AdminDispense from "./AdminDispense";
import AdminDomande from "./AdminDomande";
import AdminSegnalazioni from "./AdminSegnalazioni";

export default function AdminPanel() {
  const nav = useNavigate();
  const location = useLocation();
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState("dispense"); // dispense | domande | segnalazioni

  useEffect(() => {
    api.me()
      .then(setMe)
      .catch(() => {
        clearToken();
        nav("/admin", { replace: true });
      });
  }, [nav]);

  // route alias: /admin/domande e /admin/dispense
  useEffect(() => {
    const p = location?.pathname || "";
    if (p.startsWith("/admin/domande")) setTab("domande");
    if (p.startsWith("/admin/dispense")) setTab("dispense");
    if (p.startsWith("/admin/segnalazioni")) setTab("segnalazioni");
  }, [location?.pathname]);

  function logout() {
    clearToken();
    nav("/admin", { replace: true });
  }

  const tabBtn = (key, label) => (
    <button
      onClick={() => setTab(key)}
      type="button"
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(15,23,42,0.14)",
        background: tab === key ? "rgba(37,99,235,0.10)" : "white",
        fontWeight: 950,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

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

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        {tabBtn("dispense", "Dispense")}
        {tabBtn("domande", "Domande")}
        {tabBtn("segnalazioni", "Segnalazioni")}
      </div>

      {/* Contenuto */}
      {tab === "dispense" ? <AdminDispense /> : tab === "domande" ? <AdminDomande /> : <AdminSegnalazioni />}
    </main>
  );
}