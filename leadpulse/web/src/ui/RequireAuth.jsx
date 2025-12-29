import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../state/auth.jsx";

export function RequireAuth({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="p-8 text-zinc-300">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
