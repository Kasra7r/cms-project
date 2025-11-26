import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ThemeContext = createContext();
export const useThemeMode = () => useContext(ThemeContext);

export function ThemeProvider({ children, defaultMode = "dark" }) {
  const [mode, setMode] = useState(
    () => localStorage.getItem("themeMode") || defaultMode
  );

  const toggleThemeMode = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", next);
      return next;
    });
  };

  useEffect(() => {
    document.body.setAttribute("data-theme", mode);
  }, [mode]);

  const value = useMemo(() => ({ mode, toggleThemeMode }), [mode]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
