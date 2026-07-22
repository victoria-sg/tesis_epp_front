export type Rol = "supervisor" | "sso" | "admin";

export const ROL_LABELS: Record<Rol, string> = {
  supervisor: "SUPERVISOR DE TURNO",
  sso: "JEFE DE PLANTA",
  admin: "ADMINISTRADOR TI",
};

export const ROL_MAP: Record<string, Rol> = {
  Administrador: "admin",
  "Supervisor de Turno": "supervisor",
  "Encargado SSO": "sso",
  "Encargado de Planta": "sso",
  "Jefe de Planta": "sso",
};

export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface UsuarioFromBackend {
  id_usuario: number;
  nombre: string;
  apelido: string;
  correo: string;
  rol: string;
  permisos: string[];
  primer_inicio_sesion: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  usuario: UsuarioFromBackend;
}

export interface SolicitarRecuperacionRequest {
  correo: string;
}

export interface RestablecerPasswordRequest {
  token: string;
  nueva_contrasena: string;
}

export interface MensajeResponse {
  mensaje: string;
}

export interface LoggedUser {
  id_usuario: number;
  nombre: string;
  apelido: string;
  correo: string;
  rol: Rol;
  rolLabel: string;
  permisos: string[];
  primer_inicio_sesion: boolean;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  usuario: UsuarioFromBackend;
}

export interface CambiarPasswordPrimerInicioRequest {
  password_actual: string;
  nueva_contrasena: string;
}

export const AVAILABLE_ROLES: { rol: Rol; rolLabel: string }[] = [
  { rol: "supervisor", rolLabel: ROL_LABELS.supervisor },
  { rol: "sso", rolLabel: ROL_LABELS.sso },
  { rol: "admin", rolLabel: ROL_LABELS.admin },
];

export interface RoleStyle {
  gradient: string;
  ring: string;
  badgeBg: string;
  badgeText: string;
  icon: string;
  hex: string;
}

export const ROLE_STYLES: Record<Rol, RoleStyle> = {
  supervisor: {
    gradient: "from-brand-500 to-brand-600",
    ring: "hover:ring-brand-500/30 hover:border-brand-500",
    badgeBg: "bg-brand-50",
    badgeText: "text-brand-600",
    icon: "/supervisor.jpeg",
    hex: "#2563eb",
  },
  sso: {
    gradient: "from-warning-500 to-warning-600",
    ring: "hover:ring-warning-500/30 hover:border-warning-500",
    badgeBg: "bg-warning-50",
    badgeText: "text-warning-600",
    icon: "/jefe.jpeg",
    hex: "#f97316",
  },
  admin: {
    gradient: "from-purple-500 to-purple-700",
    ring: "hover:ring-purple-500/30 hover:border-purple-500",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-700",
    icon: "/administrador.jpeg",
    hex: "#7c3aed",
  },
};

export interface RoleInfo {
  title: string;
  subtitle: string;
  desc: string;
  perks: string[];
}

export const ROLE_INFO: Record<Rol, RoleInfo> = {
  supervisor: {
    title: "Supervisor de Turno",
    subtitle: "Operación en tiempo real",
    desc: "Monitorea alertas activas, mapa de calor y respuesta en planta.",
    perks: ["Alertas en vivo", "Mapa de zonas", "Justificación"],
  },
  sso: {
    title: "Jefe de Planta",
    subtitle: "Cumplimiento y reportes",
    desc: "Analiza KPIs de cumplimiento, tendencias históricas y auditoría exportable.",
    perks: ["KPIs globales", "Tendencias", "Exportar auditoría"],
  },
  admin: {
    title: "Administrador de TI",
    subtitle: "Configuración del sistema",
    desc: "Gestiona matriz EPP × Zona, hardware IP, calibración de IA y usuarios.",
    perks: ["Matriz EPP", "Hardware", "Usuarios"],
  },
};