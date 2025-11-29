import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
  }, [token]);

  async function login(email, password) {
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      if (!data?.token) throw new Error("Invalid response");
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user || null);
      return data;
    } finally {
      setLoading(false);
    }
  }

  async function register(username, email, password) {
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/register", { username, email, password });
      return data;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
