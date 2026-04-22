import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Mode = "light" | "dark";
export type Accent = "purple" | "emerald" | "sunset" | "ocean" | "rose";

export const ACCENTS: { id: Accent; label: string; swatch: string }[] = [
  { id: "purple", label: "Royal Purple", swatch: "oklch(0.45 0.22 295)" },
  { id: "emerald", label: "Emerald", swatch: "oklch(0.55 0.18 155)" },
  { id: "sunset", label: "Sunset", swatch: "oklch(0.62 0.22 35)" },
  { id: "ocean", label: "Ocean", swatch: "oklch(0.55 0.16 230)" },
  { id: "rose", label: "Rose", swatch: "oklch(0.6 0.22 5)" },
];

const Ctx = createContext<{
  theme: Mode;
  toggle: () => void;
  accent: Accent;
  setAccent: (a: Accent) => void;
} | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Mode>("light");
  const [accent, setAccentState] = useState<Accent>("emerald");

  useEffect(() => {
    const savedTheme = localStorage.getItem("simba.theme") as Mode | null;
    const savedAccent = localStorage.getItem("simba.accent") as Accent | null;
    setTheme(
      savedTheme ??
        (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
    );
    if (savedAccent) setAccentState(savedAccent);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("simba.theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accent);
    localStorage.setItem("simba.accent", accent);
  }, [accent]);

  return (
    <Ctx.Provider
      value={{
        theme,
        toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
        accent,
        setAccent: setAccentState,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTheme must be used within ThemeProvider");
  return c;
};
