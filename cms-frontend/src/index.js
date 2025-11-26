// src/index.js
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";

import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import App from "./App";
import "./index.css";

// i18n
import "./i18n";
import i18n from "./i18n";
import { I18nextProvider } from "react-i18next";

// تم
import { ThemeProvider, useThemeMode } from "./ThemeContext";
import { createAppTheme } from "./theme";
import RTLProvider from "./theme/RTLProvider";

// تاریخ
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/fa";
import "dayjs/locale/de";
import "dayjs/locale/fr";

// احراز هویت
import { AuthProvider } from "./context/AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

function ThemedShell({ children }) {
  const { mode } = useThemeMode();
  const lang = i18n.language || "en";
  const isRTL = lang === "fa";

  const theme = React.useMemo(
    () => createAppTheme(mode, isRTL),
    [mode, isRTL]
  );

  React.useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");

    const onLangChange = () => {
      const newLang = i18n.language || "en";
      const rtl = newLang === "fa";
      document.documentElement.setAttribute("lang", newLang);
      document.documentElement.setAttribute("dir", rtl ? "rtl" : "ltr");
    };

    window.addEventListener("languageChanged", onLangChange);
    return () => window.removeEventListener("languageChanged", onLangChange);
  }, [lang, isRTL]);

  return (
    <RTLProvider isRTL={isRTL}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={lang}>
          {children}
        </LocalizationProvider>
      </MuiThemeProvider>
    </RTLProvider>
  );
}

function Root() {
  return (
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
        <ThemeProvider defaultMode="dark">
          <Router>
            <AuthProvider>
              <ThemedShell>
                <App />
              </ThemedShell>
            </AuthProvider>
          </Router>
        </ThemeProvider>
      </Suspense>
    </I18nextProvider>
  );
}

root.render(<Root />);
