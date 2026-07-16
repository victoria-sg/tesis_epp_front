export interface Usuario {
  id_usuario: number;
  id_rol: number;
  nombre: string;
  apelido: string;
  correo: string;
  cedula?: string | null;
  fecha_creacion?: string | null;
  rol_nombre?: string;
  zonas_asignadas?: { id_zona: number; nombre_zona: string }[];
}

export interface UsuarioCreate {
  nombre: string;
  apelido: string;
  correo: string;
  id_rol: number;
  cedula: string;
  zonas_asignadas?: number[];
}

export interface UsuarioUpdate {
  nombre?: string;
  apelido?: string;
  correo?: string;
  id_rol?: number;
  cedula?: string;
  zonas_asignadas?: number[];
}

export const USUARIO_ESTADOS = ["activo", "inactivo"] as const;
