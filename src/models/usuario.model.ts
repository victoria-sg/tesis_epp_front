
export interface Usuario {
  id_usuario: number;
  id_rol: number;
  nombre: string;
  apelido: string;
  correo: string;
  cedula?: string | null;
  fecha_creacion?: string | null;
  rol_nombre?: string;
}

export interface UsuarioCreate {
  nombre: string;
  apelido: string;
  correo: string;
  id_rol: number;
  cedula: string;
}

export interface UsuarioUpdate {
  nombre?: string;
  apelido?: string;
  correo?: string;
  id_rol?: number;
  cedula?: string;
}

export const USUARIO_ESTADOS = ["activo", "inactivo"] as const;