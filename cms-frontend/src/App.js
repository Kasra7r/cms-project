import React from "react";
import { Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

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
import AdminPage from "./pages/AdminPage";

export default function App() {
  const { t } = useTranslation("common");

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
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
        <Route
          path="admin"
          element={
            <RoleRoute allowedRoles={["admin", "manager"]}>
              <AdminPage />
            </RoleRoute>
          }
        />
      </Route>

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
