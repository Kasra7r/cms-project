// src/theme.js
import { createTheme } from "@mui/material/styles";

export function createAppTheme(mode = "dark", isRTL = false) {
  const isDark = mode === "dark";

  const palette = {
    mode,
    primary: { main: "#1976d2" },
    secondary: { main: "#64b5f6" },
    background: isDark
      ? { default: "#0a192f", paper: "rgba(255,255,255,0.08)" }
      : { default: "#f4f6f8", paper: "#ffffff" },
    text: isDark
      ? { primary: "#ffffff", secondary: "#cfd8dc" }
      : { primary: "#1e2a5e", secondary: "#555" },
  };

  return createTheme({
    direction: isRTL ? "rtl" : "ltr",
    palette,
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: isRTL
        ? "Vazirmatn, IRANSans, Inter, Roboto, Helvetica, Arial, sans-serif"
        : "Inter, Roboto, Helvetica, Arial, sans-serif",
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      button: { fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: isDark
              ? "linear-gradient(135deg, #0a192f 0%, #1f2a44 50%, #2b3a55 100%)"
              : "#f4f6f8",
            color: palette.text.primary,
            minHeight: "100vh",
            overflowX: "hidden",
          },
        },
      },
    },
  });
}
