import { colors } from "../../styles/designTokens";

const STYLES: Record<
  string,
  { bg: string; color: string; borderColor?: string }
> = {
  activo: {
    bg: `linear-gradient(135deg, ${colors.success[500]} 0%, ${colors.success[600]} 100%)`,
    color: "#fff",
  },
  inactivo: {
    bg: "#fff",
    color: colors.slate[500],
    borderColor: colors.slate[300],
  },
  online: {
    bg: `linear-gradient(135deg, ${colors.success[500]} 0%, ${colors.success[600]} 100%)`,
    color: "#fff",
  },
  offline: {
    bg: "#fff",
    color: colors.slate[500],
    borderColor: colors.slate[300],
  },
  pendiente: {
    bg: `linear-gradient(135deg, ${colors.danger[500]} 0%, ${colors.danger[600]} 100%)`,
    color: "#fff",
  },
  resuelta: {
    bg: `linear-gradient(135deg, ${colors.success[500]} 0%, ${colors.success[600]} 100%)`,
    color: "#fff",
  },
  descartada: {
    bg: colors.slate[100],
    color: colors.slate[600],
    borderColor: colors.slate[300],
  },
  mantenimiento: {
    bg: "#fff",
    color: colors.warning[500],
    borderColor: colors.warning[500],
  },
  reproducida: {
    bg: "#fff",
    color: colors.success[500],
    borderColor: colors.success[500],
  },
  silenciada: {
    bg: colors.slate[100],
    color: colors.slate[500],
    borderColor: colors.slate[300],
  },
  expirada: {
    bg: "#fff",
    color: colors.slate[300],
    borderColor: colors.slate[300],
  },
};

interface Props {
  estado: string;
}

export const StatusBadge = ({ estado }: Props) => {
  const s = STYLES[estado.toLowerCase()] ?? STYLES.inactivo;

  return (
    <span
      className="inline-flex items-center rounded-full"
      style={{
        background: s.bg,
        color: s.color,
        border: s.borderColor ? `1px solid ${s.borderColor}` : "none",
        padding: "2px 10px",
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        fontWeight: 500,
      }}
    >
      {estado}
    </span>
  );
};
