import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center text-neutral-500 text-sm">Carregando…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
