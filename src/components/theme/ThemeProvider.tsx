"use client";

import * as React from "react";

type Theme = "theme-slate" | "theme-warm";
type Mode = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

const THEME_KEY = "cv-theme";
const MODE_KEY = "cv-mode";

function applyTheme(theme: Theme, mode: Mode) {
  const root = document.documentElement;
  root.classList.remove("theme-slate", "theme-warm");
  root.classList.add(theme);

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldUseDark = mode === "dark" || (mode === "system" && prefersDark);
  root.classList.toggle("dark", shouldUseDark);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>("theme-slate");
  const [mode, setModeState] = React.useState<Mode>("system");

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const storedTheme = window.localStorage.getItem(THEME_KEY);
    const storedMode = window.localStorage.getItem(MODE_KEY);
    const isValidTheme = storedTheme === "theme-slate" || storedTheme === "theme-warm";
    const nextTheme: Theme = isValidTheme ? storedTheme : "theme-slate";

    if (!isValidTheme) {
      window.localStorage.setItem(THEME_KEY, "theme-slate");
    }

    setTheme(nextTheme);
    setModeState(
      storedMode === "light" || storedMode === "dark" || storedMode === "system"
        ? storedMode
        : "system"
    );
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    applyTheme(theme, mode);
    window.localStorage.setItem(THEME_KEY, theme);
    window.localStorage.setItem(MODE_KEY, mode);
  }, [theme, mode]);

  React.useEffect(() => {
    if (typeof window === "undefined" || mode !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme(theme, "system");

    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }

    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, [mode, theme]);

  const toggleTheme = React.useCallback(() => {
    setTheme((current) => (current === "theme-slate" ? "theme-warm" : "theme-slate"));
  }, []);

  const setMode = React.useCallback((nextMode: Mode) => {
    setModeState(nextMode);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
