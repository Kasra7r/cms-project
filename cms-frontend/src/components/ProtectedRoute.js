import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  const location = useLocation();

  // اگر هنوز وضعیت auth نامشخصه
  if (loading) return <div style={{ padding: 24 }}>Checking session...</div>;

  // از context یا localStorage توکن بخون
  const tkn = token || localStorage.getItem("token");

  // بدون توکن → به لاگین
  if (!tkn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
