import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Alcune pagine legacy usano QS.parse / QS.stringify senza import.
// Qui definiamo una versione minima basata su URLSearchParams per evitare crash.
if (typeof globalThis.QS === "undefined") {
  globalThis.QS = {
    parse: (input = "") => {
      const s = String(input || "");
      const query = s.startsWith("?") ? s.slice(1) : s;
      const params = new URLSearchParams(query);
      const out = {};
      for (const [k, v] of params.entries()) out[k] = v;
      return out;
    },
    stringify: (obj = {}) => {
      const params = new URLSearchParams();
      Object.entries(obj || {}).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        params.set(k, String(v));
      });
      return params.toString();
    },
  };
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);