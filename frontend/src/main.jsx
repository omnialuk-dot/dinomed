import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
// --- QS shim (compat) ---
// Alcune pagine legacy usano QS.parse/stringify senza import.
// Qui definiamo una versione minima basata su URLSearchParams per evitare crash ("QS is not defined").

    parse: (input = "") => {
      const s = String(input || "");
      const raw = s.startsWith("?") ? s.slice(1) : s;
      const sp = new URLSearchParams(raw);
      const out = {};
      for (const [k, v] of sp.entries()) {
        // supporta ripetizione chiavi come array
        if (out[k] === undefined) out[k] = v;
        else if (Array.isArray(out[k])) out[k].push(v);
        else out[k] = [out[k], v];
      }
      return out;
    },
    stringify: (obj = {}) => {
      const sp = new URLSearchParams();
      Object.entries(obj || {}).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        if (Array.isArray(v)) v.forEach((x) => sp.append(k, String(x)));
        else sp.set(k, String(v));
      });
      return sp.toString();
    },
  };
}

// Rende disponibile QS anche come globalThis.QS (necessario per moduli ESM)
if (typeof globalThis !== "undefined" && typeof window !== "undefined" && window.QS) {
  globalThis.QS = window.QS;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);