
import {
  PERM_USUARIOS_VER, PERM_USUARIOS_CREAR, PERM_USUARIOS_EDITAR, PERM_USUARIOS_ELIMINAR,
  PERM_ROLES_VER, PERM_ROLES_CREAR, PERM_ROLES_EDITAR, PERM_ROLES_ELIMINAR,
  PERM_ZONAS_VER, PERM_ZONAS_CREAR, PERM_ZONAS_EDITAR, PERM_ZONAS_ELIMINAR,
  PERM_CAMARAS_VER, PERM_CAMARAS_CREAR, PERM_CAMARAS_EDITAR, PERM_CAMARAS_ELIMINAR,
  PERM_ALERTAS_VER, PERM_ALERTAS_CREAR, PERM_ALERTAS_EDITAR, PERM_ALERTAS_ELIMINAR, PERM_ALERTAS_JUSTIFICAR,
  PERM_REPORTES_VER, PERM_REPORTES_EXPORTAR,
  PERM_TIPOS_EPP_VER,
  PERM_DASHBOARD_VER,
  PERM_DETECCION_VER,
  PERM_USAR_CAMARA_FALLBACK,
} from "../constants/permissionsConstants";

export interface Rol {
  id_rol: number;
  nombre_rol: string;
  descripcion?: string | null;
}

export interface RolCreate {
  nombre_rol: string;
  descripcion?: string | null;
}

export interface RolUpdate {
  nombre_rol?: string;
  descripcion?: string | null;
}

export interface RolConPermisos extends Rol {
  permisos: number[];
}

export interface GrupoPermiso {
  grupo: string;
  etiqueta: string;
  permisos: { id: number; descripcion: string; etiqueta: string }[];
}

export const GRUPOS_PERMISOS: GrupoPermiso[] = [
  {
    grupo: "USUARIOS",
    etiqueta: "Usuarios",
    permisos: [
      { id: 1,  descripcion: PERM_USUARIOS_VER,      etiqueta: "Ver" },
      { id: 2,  descripcion: PERM_USUARIOS_CREAR,    etiqueta: "Crear" },
      { id: 3,  descripcion: PERM_USUARIOS_EDITAR,   etiqueta: "Editar" },
      { id: 4,  descripcion: PERM_USUARIOS_ELIMINAR, etiqueta: "Eliminar" },
    ],
  },
  {
    grupo: "ROLES",
    etiqueta: "Roles",
    permisos: [
      { id: 5,  descripcion: PERM_ROLES_VER,      etiqueta: "Ver" },
      { id: 6,  descripcion: PERM_ROLES_CREAR,    etiqueta: "Crear" },
      { id: 7,  descripcion: PERM_ROLES_EDITAR,   etiqueta: "Editar" },
      { id: 8,  descripcion: PERM_ROLES_ELIMINAR, etiqueta: "Eliminar" },
    ],
  },
  {
    grupo: "ZONAS",
    etiqueta: "Zonas",
    permisos: [
      { id: 9,  descripcion: PERM_ZONAS_VER,      etiqueta: "Ver" },
      { id: 10, descripcion: PERM_ZONAS_CREAR,    etiqueta: "Crear" },
      { id: 11, descripcion: PERM_ZONAS_EDITAR,   etiqueta: "Editar" },
      { id: 12, descripcion: PERM_ZONAS_ELIMINAR, etiqueta: "Eliminar" },
    ],
  },
  {
    grupo: "CAMARAS",
    etiqueta: "Cámaras",
    permisos: [
      { id: 13, descripcion: PERM_CAMARAS_VER,      etiqueta: "Ver" },
      { id: 14, descripcion: PERM_CAMARAS_CREAR,    etiqueta: "Crear" },
      { id: 15, descripcion: PERM_CAMARAS_EDITAR,   etiqueta: "Editar" },
      { id: 16, descripcion: PERM_CAMARAS_ELIMINAR, etiqueta: "Eliminar" },
    ],
  },
  {
    grupo: "ALERTAS",
    etiqueta: "Alertas",
    permisos: [
      { id: 17, descripcion: PERM_ALERTAS_VER,        etiqueta: "Ver" },
      { id: 18, descripcion: PERM_ALERTAS_CREAR,      etiqueta: "Crear" },
      { id: 19, descripcion: PERM_ALERTAS_EDITAR,     etiqueta: "Editar" },
      { id: 20, descripcion: PERM_ALERTAS_ELIMINAR,   etiqueta: "Eliminar" },
      { id: 21, descripcion: PERM_ALERTAS_JUSTIFICAR, etiqueta: "Justificar" },
    ],
  },
  {
    grupo: "REPORTES",
    etiqueta: "Reportes",
    permisos: [
      { id: 22, descripcion: PERM_REPORTES_VER,      etiqueta: "Ver" },
      { id: 23, descripcion: PERM_REPORTES_EXPORTAR, etiqueta: "Exportar" },
    ],
  },
  {
    grupo: "TIPOS_EPP",
    etiqueta: "Tipos de EPP",
    permisos: [
      { id: 24, descripcion: PERM_TIPOS_EPP_VER, etiqueta: "Ver" },
    ],
  },
  {
    grupo: "DASHBOARD",
    etiqueta: "Dashboard",
    permisos: [
      { id: 25, descripcion: PERM_DASHBOARD_VER, etiqueta: "Ver" },
    ],
  },
  {
    grupo: "DETECCION",
    etiqueta: "Detección",
    permisos: [
      { id: 26, descripcion: PERM_DETECCION_VER, etiqueta: "Ver" },
    ],
  },
  {
    grupo: "FALLBACK",
    etiqueta: "Cámara fallback (teléfono)",
    permisos: [
      { id: 27, descripcion: PERM_USAR_CAMARA_FALLBACK, etiqueta: "Usar" },
    ],
  },
];

export const PERMISOS_DISPONIBLES = GRUPOS_PERMISOS.flatMap((g) => g.permisos);

export function getPermisosByGrupo(grupo: string): string[] {
  const g = GRUPOS_PERMISOS.find((gp) => gp.grupo === grupo);
  return g ? g.permisos.map((p) => p.descripcion) : [];
}

export function getGrupoFromPermiso(codigo: string): string | null {
  for (const g of GRUPOS_PERMISOS) {
    if (g.permisos.some((p) => p.descripcion === codigo)) return g.grupo;
  }
  return null;
}