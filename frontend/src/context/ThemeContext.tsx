// context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

/**
 * Every theme lives in the same warm, natural family — cream paper,
 * bark/umber covers, and a sage or olive accent — but each one shifts
 * the mix so the book still feels like a different physical object.
 */
export type ThemeName = "linen" | "sage" | "walnut" | "moss" | "clay" | "olive";

interface Theme {
  name: ThemeName;
  label: string;
  swatch: string; // single color used for the little theme-picker dot
  colors: {
    background: string;     /* Desk/Environment background color */
    cover: string;          /* Hardcover binding wrap */
    surface: string;        /* Inside paper sheet base tone */
    surfaceAlt: string;     /* Input fields background tone */
    primary: string;        /* Brand/Action color */
    secondary: string;      /* Accent framing outlines */
    accent: string;         /* Notification/Highlight color */
    text: string;           /* Crisp dark book ink */
    textSecondary: string;  /* Labels, secondary text */
    textMuted: string;      /* Index/marginal notes metadata */
    border: string;         /* Subtle paper dividers */
    input: string;          /* Active form inputs */
    error: string;
    success: string;
    muted: string;
    shadow: string;
    pageShadow: string;
  };
  typography: {
    fontFamily: string;
    headingFont: string;
  };
}

const typography = {
  fontFamily: "'Georgia', 'Times New Roman', serif",
  headingFont: "'Garamond', 'Georgia', serif",
};

const themes: Record<ThemeName, Theme> = {
  linen: {
    name: "linen",
    label: "Linen",
    swatch: "#c9a876",
    colors: {
      background: "#ece4d6",
      cover: "#8a6a45",
      surface: "#fbf8f2",
      surfaceAlt: "#f3ecdf",
      primary: "#7a5b38",
      secondary: "#a98a5c",
      accent: "#5f7a52",
      text: "#2b2418",
      textSecondary: "#5c5140",
      textMuted: "#8c8069",
      border: "#e3d8c4",
      input: "#ffffff",
      error: "#a5453a",
      success: "#4f7a4b",
      muted: "#b7ab90",
      shadow: "rgba(60, 45, 20, 0.18)",
      pageShadow: "rgba(60, 45, 20, 0.10)",
    },
    typography,
  },
  sage: {
    name: "sage",
    label: "Sage",
    swatch: "#7c9473",
    colors: {
      background: "#e6e8dd",
      cover: "#4c5c3f",
      surface: "#fbfaf4",
      surfaceAlt: "#eef0e4",
      primary: "#4c5c3f",
      secondary: "#7c9473",
      accent: "#a9773f",
      text: "#232619",
      textSecondary: "#4f5842",
      textMuted: "#828a72",
      border: "#dde1d0",
      input: "#ffffff",
      error: "#a5453a",
      success: "#4c5c3f",
      muted: "#b4bba6",
      shadow: "rgba(30, 40, 20, 0.18)",
      pageShadow: "rgba(30, 40, 20, 0.10)",
    },
    typography,
  },
  walnut: {
    name: "walnut",
    label: "Walnut",
    swatch: "#5c3a21",
    colors: {
      background: "#e2dace",
      cover: "#3c2413",
      surface: "#faf6ee",
      surfaceAlt: "#efe6d6",
      primary: "#5c3a21",
      secondary: "#8c6f4f",
      accent: "#6e8058",
      text: "#221a10",
      textSecondary: "#544532",
      textMuted: "#8a7a63",
      border: "#e0d3ba",
      input: "#ffffff",
      error: "#a5453a",
      success: "#5c7a4b",
      muted: "#bfae90",
      shadow: "rgba(40, 25, 10, 0.22)",
      pageShadow: "rgba(40, 25, 10, 0.12)",
    },
    typography,
  },
  moss: {
    name: "moss",
    label: "Moss",
    swatch: "#3f5a3a",
    colors: {
      background: "#dfe4d6",
      cover: "#28381f",
      surface: "#f8faf2",
      surfaceAlt: "#eaefe0",
      primary: "#3f5a3a",
      secondary: "#6b8a5f",
      accent: "#a9773f",
      text: "#1c2417",
      textSecondary: "#465241",
      textMuted: "#7c8874",
      border: "#dbe2cd",
      input: "#ffffff",
      error: "#a5453a",
      success: "#3f5a3a",
      muted: "#aebba1",
      shadow: "rgba(15, 30, 10, 0.22)",
      pageShadow: "rgba(15, 30, 10, 0.12)",
    },
    typography,
  },
  clay: {
    name: "clay",
    label: "Clay",
    swatch: "#a9622f",
    colors: {
      background: "#ebe0cf",
      cover: "#7a4423",
      surface: "#fdf8ef",
      surfaceAlt: "#f2e6d2",
      primary: "#9a5a2a",
      secondary: "#c78a4d",
      accent: "#5f7a52",
      text: "#2a1d10",
      textSecondary: "#5c4a34",
      textMuted: "#8f7d63",
      border: "#e8d8bc",
      input: "#ffffff",
      error: "#a5453a",
      success: "#5f7a52",
      muted: "#c9b795",
      shadow: "rgba(70, 35, 10, 0.2)",
      pageShadow: "rgba(70, 35, 10, 0.1)",
    },
    typography,
  },
  olive: {
    name: "olive",
    label: "Olive",
    swatch: "#6b6b3a",
    colors: {
      background: "#e5e2cf",
      cover: "#4a4a24",
      surface: "#faf9ee",
      surfaceAlt: "#eeecd8",
      primary: "#5c5c30",
      secondary: "#8c8c50",
      accent: "#9a5a2a",
      text: "#232314",
      textSecondary: "#525233",
      textMuted: "#87866a",
      border: "#e0ddc4",
      input: "#ffffff",
      error: "#a5453a",
      success: "#5c7a4b",
      muted: "#bdbb98",
      shadow: "rgba(35, 35, 10, 0.2)",
      pageShadow: "rgba(35, 35, 10, 0.1)",
    },
    typography,
  },
};

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  themes: Record<ThemeName, Theme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    const saved = localStorage.getItem("theme") as ThemeName;
    return saved && Object.keys(themes).includes(saved) ? saved : "linen";
  });

  useEffect(() => {
    localStorage.setItem("theme", themeName);
  }, [themeName]);

  const theme = themes[themeName];

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme: setThemeName, themes }}>
      <div style={{
        background: theme.colors.background,
        minHeight: "100vh",
        transition: "background 0.4s ease",
      }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}