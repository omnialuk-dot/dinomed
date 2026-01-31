import { Navigate, useLocation } from "react-router-dom";
import { getUserToken } from "../lib/userSession";

export default function UserGuard({ children }) {
  const loc = useLocation();

  // Admin libero e login libero
  if (loc.pathname.startsWith("/admin") || loc.pathname === "/login") return children;

  // Tutto il resto richiede login utente
  const token = getUserToken();
  if (!token) return <Navigate to="/login" replace />;

  return children;
}
