import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SiteHeader from "./components/SiteHeader";
import UserGuard from "./components/UserGuard";

import Home from "./pages/Home";
import Dispense from "./pages/Dispense";
import Simulazioni from "./pages/Simulazioni";
import ChiSiamo from "./pages/ChiSiamo";
import Contatti from "./pages/Contatti";
import Profilo from "./pages/Profilo";
import ProfiloProva from "./pages/ProfiloProva.jsx";
import Login from "./pages/Login";
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

      <UserGuard>
        <Routes>
          {/* LOGIN (LIBERO) */}
          <Route path="/login" element={<Login />} />

          {/* PUBBLICO (ma protetto da login utente) */}
          <Route path="/" element={<Home />} />
          <Route path="/dispense" element={<Dispense />} />
          <Route path="/simulazioni" element={<Simulazioni />} />
          <Route path="/chi-siamo" element={<ChiSiamo />} />
          <Route path="/profilo" element={<Profilo />} />
          <Route path="/profilo/prove/:id" element={<ProfiloProva />} />
          <Route path="/simulazioni/config" element={<SimulazioniConfig />} />
          <Route path="/simulazioni/run" element={<SimulazioniRun />} />
          <Route path="/simulazioni/risultato" element={<SimulazioniRisultato />} />
          <Route path="/contatti" element={<Contatti />} />

          {/* ADMIN (LIBERO) */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/panel"
            element={
              <AdminGuard>
                <AdminPanel />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/domande"
            element={
              <AdminGuard>
                <AdminPanel />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/dispense"
            element={
              <AdminGuard>
                <AdminPanel />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/segnalazioni"
            element={
              <AdminGuard>
                <AdminPanel />
              </AdminGuard>
            }
          />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UserGuard>
    </BrowserRouter>
  );
}
