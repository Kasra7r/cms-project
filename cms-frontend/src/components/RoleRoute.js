import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: 24 }}>Checking permissions...</div>;
  if (!user?.token) return <Navigate to="/login" replace state={{ from: location }} />;

  const roles = Array.isArray(user.roles) ? user.roles.map((r) => (typeof r === "string" ? r : r?.name)).filter(Boolean) : [];
  if (allowedRoles.length && !allowedRoles.some((r) => roles.includes(r))) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <h2>⛔ Access Denied</h2>
        <p>You are not authorized to view this page.</p>
      </div>
    );
  }

  return children;
}
