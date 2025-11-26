// src/routes.js
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage from './pages/TasksPage';
import TeamsPage from './pages/TeamsPage';
import MessagesPage from './pages/MessagesPage';
import CalendarPage from './pages/CalendarPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NotesPage from './pages/NotesPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import AdminPage from './pages/AdminPage';

const routes = [
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/dashboard',
    element: <DashboardPage />,
    children: [
      { path: '', element: <AnalyticsPage /> },        // index (اختیاری)
      { path: 'profile', element: <ProfilePage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'teams', element: <TeamsPage /> },
      { path: 'messages', element: <MessagesPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'notes', element: <NotesPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'support', element: <SupportPage /> },
      { path: 'admin', element: <AdminPage /> },       // اگر RoleRoute می‌ذاری، همون‌جا کنترل کن
    ],
  },
];

export default routes;
