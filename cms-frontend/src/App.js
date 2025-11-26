import React from "react";
import { Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";

// صفحات عمومی
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// ساختار داشبورد و مسیرهای محافظت‌شده
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute"; // 🔹 اضافه شد

// صفحات داخلی داشبورد
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import ProjectsPage from "./pages/ProjectsPage";
import TasksPage from "./pages/TasksPage";
import TeamsPage from "./pages/TeamsPage";
import MessagesPage from "./pages/MessagesPage";
import CalendarPage from "./pages/CalendarPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import NotesPage from "./pages/NotesPage";
import SettingsPage from "./pages/SettingsPage";
import SupportPage from "./pages/SupportPage";
import AdminPage from "./pages/AdminPage"; // 🔹 اضافه شد

export default function App() {
  const { t } = useTranslation("common");

  return (
    <Routes>
      {/* مسیرهای عمومی */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* داشبورد (محافظت‌شده) */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* مسیر اصلی /dashboard */}
        <Route index element={<DashboardPage />} />

        {/* صفحات داخلی */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="support" element={<SupportPage />} />

        {/* 🔐 صفحه مدیریت کاربران فقط برای مدیر یا منیجر */}
        <Route
          path="admin"
          element={
            <RoleRoute allowedRoles={["admin", "manager"]}>
              <AdminPage />
            </RoleRoute>
          }
        />
      </Route>

      {/* صفحه ۴۰۴ */}
      <Route
        path="*"
        element={
          <h1 style={{ padding: 24 }}>
            {t("pageNotFound") || "Page Not Found"}
          </h1>
        }
      />
    </Routes>
  );
}
