import { createContext, useContext } from "react";

/* Same palette as the website (Tailwind slate + brand orange + navy). */
export const slate = {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617",
};

export const palette = {
    emerald50: "#ecfdf5",
    emerald100: "#d1fae5",
    emerald500: "#10b981",
    emerald600: "#059669",
    emerald700: "#047857",
    emerald800: "#065f46",
    red50: "#fef2f2",
    red500: "#ef4444",
    red600: "#dc2626",
    red700: "#b91c1c",
    amber50: "#fffbeb",
    amber200: "#fde68a",
    amber400: "#fbbf24",
    amber500: "#f59e0b",
    amber800: "#92400e",
    blue50: "#eff6ff",
    blue500: "#3b82f6",
    blue700: "#1d4ed8",
    violet600: "#7c3aed",
    white: "#ffffff",
};

export const TONES: Record<string, { soft: string; fg: string; solid: string }> = {
    red: { soft: "#fef2f2", fg: "#ef4444", solid: "#ef4444" },
    blue: { soft: "#eff6ff", fg: "#3b82f6", solid: "#3b82f6" },
    green: { soft: "#ecfdf5", fg: "#10b981", solid: "#10b981" },
    emerald: { soft: "#ecfdf5", fg: "#10b981", solid: "#10b981" },
    purple: { soft: "#f5f3ff", fg: "#8b5cf6", solid: "#8b5cf6" },
    teal: { soft: "#f0fdfa", fg: "#14b8a6", solid: "#14b8a6" },
    orange: { soft: "#fff7ed", fg: "#f97316", solid: "#f97316" },
    amber: { soft: "#fffbeb", fg: "#f59e0b", solid: "#f59e0b" },
    rose: { soft: "#fff1f2", fg: "#f43f5e", solid: "#f43f5e" },
    slate: { soft: "#f8fafc", fg: "#64748b", solid: "#64748b" },
};

function hexToRgb(hex: string): [number, number, number] | null {
    const m = hex.trim().replace("#", "");
    const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
    if (!/^[0-9a-f]{6}$/i.test(full)) return null;
    const n = parseInt(full, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** color-mix(in srgb, a p%, b) — the website derives its brand shades the same way. */
export function mix(a: string, b: string, p: number): string {
    const x = hexToRgb(a);
    const y = hexToRgb(b);
    if (!x || !y) return a;
    const c = x.map((v, i) => Math.round(v * p + y[i] * (1 - p)));
    return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export function alpha(hex: string, a: number): string {
    const x = hexToRgb(hex);
    if (!x) return hex;
    return `rgba(${x[0]},${x[1]},${x[2]},${a})`;
}

export type Theme = ReturnType<typeof makeTheme>;

export function makeTheme(brandColor = "#f97316", navyColor = "#021424") {
    const brand = hexToRgb(brandColor) ? brandColor : "#f97316";
    const navy = hexToRgb(navyColor) ? navyColor : "#021424";
    return {
        brand,
        brand50: mix(brand, "#ffffff", 0.08),
        brand100: mix(brand, "#ffffff", 0.16),
        brand200: mix(brand, "#ffffff", 0.32),
        brand300: mix(brand, "#ffffff", 0.55),
        brand400: mix(brand, "#ffffff", 0.8),
        brand600: mix(brand, "#000000", 0.88),
        brand700: mix(brand, "#000000", 0.74),
        navy,
        navy800: mix(navy, "#ffffff", 0.85),
    };
}

export const ThemeContext = createContext<Theme>(makeTheme());
export const useTheme = () => useContext(ThemeContext);

/* Fonts (loaded in the root layout). Android needs one family per weight. */
export const FONT = {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semibold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
    extrabold: "Inter_800ExtraBold",
    black: "Inter_900Black",
    script: "Kalam_700Bold",
} as const;
export type Weight = keyof typeof FONT;

export const shadow = {
    sm: { shadowColor: "#0f172a", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    md: { shadowColor: "#0f172a", shadowOpacity: 0.1, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
    lg: { shadowColor: "#0f172a", shadowOpacity: 0.16, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 10 },
};
