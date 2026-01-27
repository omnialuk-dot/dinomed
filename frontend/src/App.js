import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Home } from "./pages/Home";
import { Simulazioni } from "./pages/Simulazioni";
import { Dispense } from "./pages/Dispense";
import { CosaNonStudiare } from "./pages/CosaNonStudiare";
import { ChiSiamo } from "./pages/ChiSiamo";
import { Contatti } from "./pages/Contatti";
import { Login } from "./pages/Login";
import { Admin } from "./pages/Admin";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Toaster />
          <Routes>
            {/* Login route without header/footer */}
            <Route path="/login" element={<Login />} />
            
            {/* Admin route without normal header/footer */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } 
            />
            
            {/* Public routes with header/footer */}
            <Route path="/*" element={
              <>
                <Header />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/simulazioni" element={<Simulazioni />} />
                  <Route path="/dispense" element={<Dispense />} />
                  <Route path="/cosa-non-studiare" element={<CosaNonStudiare />} />
                  <Route path="/chi-siamo" element={<ChiSiamo />} />
                  <Route path="/contatti" element={<Contatti />} />
                </Routes>
                <Footer />
              </>
            } />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
