// src/services/api.js
import axios from "axios";

const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_URL, // ⬅️ بدون /api
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
