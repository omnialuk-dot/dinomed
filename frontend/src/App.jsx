import React from "react";
import { Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Dispense from "./pages/Dispense";
import Simulazioni from "./pages/Simulazioni";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/simulazioni" element={<Simulazioni />} />
      <Route path="/dispense" element={<Dispense />} />
      <Route path="*" element={<div style={{ padding: 40, textAlign: "center" }}>404 - Pagina non trovata</div>} />
    </Routes>
  );
}
