export const colors = {
  text: {
    primary: "#000000",
    secondary: "#6b6b6b",
    tertiary: "#9ca3af",
    muted: "#b0b0b0",
    white: "#ffffff",
    disabled: "#9a9a9a",
  },
  bg: {
    page: "#f5f5f5",
    card: "#ffffff",
    hover: "#fafafa",
    muted: "#f5f5f5",
    skeleton: "#ececec",
  },
  border: {
    light: "#ececec",
    default: "#e5e5e5",
    medium: "#d4d4d4",
  },
  brand: {
    50: "#eff6ff",
    100: "#dbeafe",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
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
  red: {
    50: "#fef2f2",
    500: "#ef4444",
    600: "#dc2626",
    400: "#f87171",
  },
  yellow: {
    500: "#eab308",
  },
  status: {
    online: "#059669",
    offline: "#9ca3af",
    danger: "#dc2626",
    success: "#10b981",
    warning: "#eab308",
  },
  role: {
    supervisor: "#3b82f6",
    sso: "#10b981",
    admin: "#8b5cf6",
  },
  gradient: {
    primary: "linear-gradient(to right, #3b82f6, #2563eb)",
    secondary: "linear-gradient(to right, #8b5cf6, #7c3aed)",
    success: "linear-gradient(to right, #10b981, #059669)",
    danger: "linear-gradient(to right, #ef4444, #dc2626)",
  },
} as const;

export const gradientClasses = {
  primary: "from-[#3b82f6] to-[#2563eb]",
  secondary: "from-[#8b5cf6] to-[#7c3aed]",
  success: "from-[#10b981] to-[#059669]",
  danger: "from-[#ef4444] to-[#dc2626]",
} as const;

export const shadowClasses = {
  primary: "shadow-lg shadow-blue-500/30",
  secondary: "shadow-lg shadow-purple-500/30",
  success: "shadow-lg shadow-green-500/30",
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: 700, color: colors.text.primary, fontVariantNumeric: "tabular-nums" as const },
  h2: { fontSize: 24, fontWeight: 700, color: colors.text.primary },
  h3: { fontSize: 17, fontWeight: 600, color: colors.text.primary },
  h4: { fontSize: 15, fontWeight: 600, color: colors.text.primary },
  h5: { fontSize: 13, fontWeight: 500, color: colors.text.primary },
  subtitle: { fontSize: 13, color: colors.text.secondary },
  small: { fontSize: 12, color: colors.text.secondary },
  xs: { fontSize: 11, color: colors.text.secondary },
  label: {
    fontSize: 11,
    color: colors.text.secondary,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em" as const,
    fontWeight: 500,
  },
  number: {
    fontSize: 28,
    fontWeight: 700,
    color: colors.text.primary,
    fontVariantNumeric: "tabular-nums" as const,
  },
  numberMd: {
    fontSize: 22,
    fontWeight: 700,
    color: colors.text.primary,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: colors.text.primary,
  },
  tableTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: colors.text.primary,
  },
  tableCount: {
    color: colors.text.secondary,
    fontWeight: 400,
  },
} as const;

export const borderRadius = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  full: "9999px",
} as const;

export const spacing = {
  cardPadding: "1.25rem",
  sectionGap: "1.5rem",
  gridGap: "1rem",
} as const;
