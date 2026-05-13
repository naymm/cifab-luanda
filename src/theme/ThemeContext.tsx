import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark";

export interface ThemeColors {
  bg: string;
  card: string;
  light: string;
  border: string;
  gold: string;
  goldL: string;
  text: string;
  sub: string;
  green: string;
  red: string;
  yellow: string;
  blue: string;
}

export const DARK_COLORS: ThemeColors = {
  bg: "#060E1A",
  card: "#0C1E33",
  light: "#132944",
  border: "#1A3550",
  gold: "#C9A84C",
  goldL: "#E8C97A",
  text: "#EDF2F7",
  sub: "#7A9BBF",
  green: "#38A169",
  red: "#E53E3E",
  yellow: "#D69E2E",
  blue: "#4299E1",
};

export const LIGHT_COLORS: ThemeColors = {
  bg: "#F5F7FA",
  card: "#FFFFFF",
  light: "#EDF2F7",
  border: "#CBD5E0",
  gold: "#A0823A",
  goldL: "#C9A84C",
  text: "#1A202C",
  sub: "#4A5568",
  green: "#276749",
  red: "#9B2C2C",
  yellow: "#975A16",
  blue: "#2B6CB0",
};

interface ThemeContextValue {
  mode: ThemeMode;
  C: ThemeColors;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "cifab-theme";

function detectInitial(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage may be unavailable (private mode, etc.)
  }
  if (window.matchMedia?.("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(detectInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore
    }
    document.documentElement.dataset.theme = mode;
    document.body.style.background = mode === "dark" ? DARK_COLORS.bg : LIGHT_COLORS.bg;
    document.body.style.color = mode === "dark" ? DARK_COLORS.text : LIGHT_COLORS.text;
  }, [mode]);

  // Live-update if user changes OS preference and they haven't set an override
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    let userOverride = false;
    try {
      userOverride = !!window.localStorage.getItem(STORAGE_KEY);
    } catch {
      userOverride = false;
    }
    if (userOverride) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setModeState(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const setMode = useCallback((m: ThemeMode) => setModeState(m), []);
  const toggle = useCallback(
    () => setModeState((m) => (m === "dark" ? "light" : "dark")),
    []
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      C: mode === "dark" ? DARK_COLORS : LIGHT_COLORS,
      setMode,
      toggle,
    }),
    [mode, setMode, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme deve ser usado dentro de <ThemeProvider>");
  }
  return ctx;
}
