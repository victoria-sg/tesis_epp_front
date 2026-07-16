
export const API_ROUTES = {
  USUARIOS: "/usuarios",
  ROLES: "/roles",
  ZONAS: "/zonas",
  CAMARAS: "/camaras",
  TIPOS_EPP: "/tipos-epp",
  CLASES_DETECCION: "/clases-deteccion",

  PERMISOS: "/permisos",

  ALERTAS: "/alertas",
  RESOLUCIONES: "/resoluciones",
  CONTEOS: "/conteos",
  OPCIONES: "/opciones",
} as const;


export const APP_ROUTES = {
  DASHBOARD: "/dashboard",
  USUARIOS: "/admin/usuarios",
  ROLES: "/admin/roles",
  ZONAS: "/admin/zonas",
  CAMARAS: "/admin/camaras",
  TIPOS_EPP: "/admin/tipos-epp",
  CLASES_DETECCION: "/admin/clases-deteccion",
  MONITOREO_TIEMPO_REAL: "/admin/monitoreo-tiempo-real",
  ALERTAS: "/admin/alertas",
  REPORTES_TURNO: "/admin/reportes-turno",
  REPORTES: "/admin/reportes",
  DETECCION: "/admin/deteccion",
} as const;


export const SIDEBAR_ITEMS = [
  { path: APP_ROUTES.DASHBOARD, label: "Dashboard", icon: "LayoutDashboard" },
  { path: APP_ROUTES.USUARIOS, label: "Usuarios", icon: "Users" },
  { path: APP_ROUTES.ROLES, label: "Roles", icon: "Shield" },
  { path: APP_ROUTES.ZONAS, label: "Zonas", icon: "MapPin" },
  { path: APP_ROUTES.CAMARAS, label: "Cámaras", icon: "Camera" },
  { path: APP_ROUTES.CLASES_DETECCION, label: "Clases", icon: "ScanSearch" },
  { path: APP_ROUTES.TIPOS_EPP, label: "Tipos de EPP", icon: "Shirt" },
] as const;
