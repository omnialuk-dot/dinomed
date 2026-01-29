import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SiteHeader from "./components/SiteHeader";

import Home from "./pages/Home";
import Dispense from "./pages/Dispense";
import Simulazioni from "./pages/Simulazioni";

import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import AdminGuard from "./components/AdminGuard";

export default function App() {
  return (
    <BrowserRouter>
      <SiteHeader />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dispense" element={<Dispense />} />
        <Route path="/simulazioni" element={<Simulazioni />} />

        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/panel"
          element={
            <AdminGuard>
              <AdminPanel />
            </AdminGuard>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}