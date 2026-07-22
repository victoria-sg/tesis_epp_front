export const colors = {
  brand: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
  },
  slate: {
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
  },
  success: {
    50: "#f0fdf4",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
  },
  danger: {
    50: "#fef2f2",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
  },
  warning: {
    50: "#fffbeb",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
  },
  purple: {
    50: "#f5f3ff",
    500: "#8b5cf6",
    600: "#7c3aed",
    700: "#6d28d9",
  },
  green: {
    50: "#f0fdf4",
    500: "#22c55e",
    600: "#16a34a",
  },
  online: "#22c55e",
  offline: "#cbd5e1",
} as const;

export const border = {
  light: "#e2e8f0",
  default: "#cbd5e1",
} as const;

export const radius = {
  xs: "0.25rem",
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
} as const;

export const shadow = {
  xs: "0 1px 2px 0 rgb(0 0 0 / 0.03)",
  sm: "0 1px 3px 0 rgb(0 0 0 / 0.06)",
  md: "0 4px 12px -2px rgb(0 0 0 / 0.08)",
  lg: "0 12px 24px -6px rgb(0 0 0 / 0.12)",
  xl: "0 20px 60px -12px rgb(0 0 0 / 0.25)",
} as const;

export const typography = {
  xs: { fontSize: 11, fontWeight: 500, color: colors.slate[500] },
  sm: { fontSize: 13, fontWeight: 400, color: colors.slate[700] },
  base: { fontSize: 15, fontWeight: 600, color: colors.slate[900] },
  lg: { fontSize: 17, fontWeight: 600, color: colors.slate[900] },
  xl: { fontSize: 22, fontWeight: 700, color: colors.slate[900] },
  "2xl": { fontSize: 24, fontWeight: 700, color: colors.slate[900] },
  "3xl": { fontSize: 28, fontWeight: 700, color: colors.slate[900] },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.slate[500],
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em" as const,
  },
  subtitle: {
    fontSize: 13,
    color: colors.slate[500],
  },
} as const;
