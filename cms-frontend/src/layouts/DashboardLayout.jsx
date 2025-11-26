// src/layouts/DashboardLayout.jsx
import React from "react";
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Stack,
  Button,
  Avatar,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  ListItemIcon,
} from "@mui/material";
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Workspaces as ProjectsIcon,
  TaskAlt as TasksIcon,
  Mail as MessagesIcon,
  Group as TeamsIcon,
  CalendarToday as CalendarIcon,
  Insights as AnalyticsIcon,
  Note as NotesIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
  SupportAgent as SupportIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";

import { useTheme } from "@mui/material/styles";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../ThemeContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import ChatBot from "../components/ChatBot";
import { useTranslation } from "react-i18next";

const drawerWidth = 260;

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { mode, toggleThemeMode } = useThemeMode();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation("common");

  const displayName = user?.name || user?.username || "User";

  // جدول مرتب‌شده جدید
  const menuItems = [
    { key: "dashboard", icon: <DashboardIcon />, path: "/dashboard" },

    { key: "profile", icon: <ProfileIcon />, path: "/dashboard/profile" },
    { key: "projects", icon: <ProjectsIcon />, path: "/dashboard/projects" },
    { key: "tasks", icon: <TasksIcon />, path: "/dashboard/tasks" },
    { key: "teams", icon: <TeamsIcon />, path: "/dashboard/teams" },
    { key: "messages", icon: <MessagesIcon />, path: "/dashboard/messages" },
    { key: "notes", icon: <NotesIcon />, path: "/dashboard/notes" },
    { key: "calendar", icon: <CalendarIcon />, path: "/dashboard/calendar" },
    { key: "analytics", icon: <AnalyticsIcon />, path: "/dashboard/analytics" },
    { key: "settings", icon: <SettingsIcon />, path: "/dashboard/settings" },
    { key: "support", icon: <SupportIcon />, path: "/dashboard/support" },

    { key: "admin", icon: <AdminIcon />, path: "/dashboard/admin" },
  ];

  const handleNav = (path) => navigate(path);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Topbar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t("appName")}
          </Typography>

          <Stack direction="row" alignItems="center" spacing={2}>
            <LanguageSwitcher />

            <IconButton onClick={toggleThemeMode} color="inherit">
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                {displayName?.[0]?.toUpperCase() || "U"}
              </Avatar>
              <Typography variant="body2">{displayName}</Typography>
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={logout}
              >
                {t("logout")}
              </Button>
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Divider />

        <List sx={{ flexGrow: 1 }}>
          {menuItems.map((item) => {
            const active =
              location.pathname === item.path ||
              (item.path !== "/dashboard" &&
                location.pathname.startsWith(item.path));

            return (
              <ListItemButton
                key={item.path}
                onClick={() => handleNav(item.path)}
                selected={active}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={t(`menu.${item.key}`)} />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      {/* Page Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { sm: `${drawerWidth}px` },
          mt: `${theme.mixins.toolbar.minHeight || 64}px`,
        }}
      >
        <Outlet />
      </Box>

      <ChatBot />
    </Box>
  );
}
