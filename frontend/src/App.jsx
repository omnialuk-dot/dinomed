import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SiteHeader from "./components/SiteHeader";

import Home from "./pages/Home";
import Dispense from "./pages/Dispense";
import ChiSiamo from "./pages/ChiSiamo";
import Contatti from "./pages/Contatti";
import SimulazioniRun from "./pages/SimulazioniRun.jsx";
import SimulazioniConfig from "./pages/SimulazioniConfig.jsx";
import SimulazioniRisultato from "./pages/SimulazioniRisultato.jsx";

import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import AdminGuard from "./components/AdminGuard";

export default function App() {
  return (
    <BrowserRouter>
      <SiteHeader />

      <Routes>
        {/* PUBBLICO */}
        <Route path="/" element={<Home />} />
        <Route path="/dispense" element={<Dispense />} />
        <Route path="/simulazioni" element={<Simulazioni />} />
        <Route path="/chi-siamo" element={<ChiSiamo />} />
        <Route path="/simulazioni/config" element={<SimulazioniConfig />} />
        <Route path="/simulazioni/run" element={<SimulazioniRun />} />
        <Route path="/simulazioni/risultato" element={<SimulazioniRisultato />} />
        <Route path="/contatti" element={<Contatti />} />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/panel"
          element={
            <AdminGuard>
              <AdminPanel />
            </AdminGuard>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}