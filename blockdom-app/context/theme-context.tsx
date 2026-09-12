"use client";

import React, {
  useEffect,
  createContext,
  useContext,
  useSyncExternalStore,
} from "react";

type Theme = "light" | "dark";

type ThemeContextProviderProps = {
  children: React.ReactNode;
};

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

/**
 * The theme lives in localStorage, which is an external store, so it is read
 * through useSyncExternalStore rather than copied into state by an effect.
 * The effect version rendered "light" on the first pass and the real theme on
 * the second, which is both a wasted render and a visible flash for anyone who
 * had chosen dark.
 */
const listeners = new Set<() => void>();

const subscribe = (onStoreChange: () => void) => {
  listeners.add(onStoreChange);
  // `storage` only fires for *other* tabs, so toggleTheme notifies this one.
  window.addEventListener("storage", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
};

const readTheme = (): Theme => {
  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

// Neither localStorage nor the media query exists while prerendering, and
// "light" is what the old useState default put in the markup.
const serverTheme = (): Theme => "light";

export default function ThemeContextProvider({
  children,
}: ThemeContextProviderProps) {
  const theme = useSyncExternalStore(subscribe, readTheme, serverTheme);

  // Pushing the current theme at the document is the one thing that genuinely
  // belongs in an effect: it synchronises React's state with something outside
  // it. It used to be repeated in every branch that set the theme instead.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    window.localStorage.setItem("theme", theme === "light" ? "dark" : "light");
    listeners.forEach((listener) => listener());
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error("useTheme must be used within a ThemeContextProvider");
  }
  return context;
}
