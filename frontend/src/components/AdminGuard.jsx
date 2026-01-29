import { Navigate } from "react-router-dom";
import { getToken } from "../lib/api";

export default function AdminGuard({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/admin" replace />;
  return children;
}