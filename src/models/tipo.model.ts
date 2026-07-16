
export interface TipoEPP {
  id_tipo_epp: number;
  id_rol?: number | null;
  id_clase_deteccion?: number | null;
  nombre_epp: string;
  descripcion?: string | null;
  clase_yolo: string;
  activo: boolean;
  usar_modelo_principal: boolean;
  clase_positiva?: string | null;
  clase_negativa?: string | null;
  usar_modelo_personalizado: boolean;
  modelo_personalizado_path?: string | null;
  estado_entrenamiento: string;
  modo_alerta: string;
}

export interface TipoEPPCreate {
  id_rol?: number | null;
  id_clase_deteccion?: number | null;
  nombre_epp: string;
  descripcion?: string | null;
  clase_yolo?: string | null;
  activo?: boolean;
  usar_modelo_principal?: boolean;
  clase_positiva?: string | null;
  clase_negativa?: string | null;
  usar_modelo_personalizado?: boolean;
  modelo_personalizado_path?: string | null;
  estado_entrenamiento?: string;
  modo_alerta?: string;
}

export interface TipoEPPUpdate {
  id_clase_deteccion?: number | null;
  nombre_epp?: string;
  descripcion?: string | null;
  clase_yolo?: string | null;
  activo?: boolean;
  usar_modelo_principal?: boolean;
  clase_positiva?: string | null;
  clase_negativa?: string | null;
  usar_modelo_personalizado?: boolean;
  modelo_personalizado_path?: string | null;
  estado_entrenamiento?: string;
  modo_alerta?: string;
}
