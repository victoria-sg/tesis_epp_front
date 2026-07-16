export interface ClaseDeteccion {
  id_clase_deteccion: number;
  nombre_visible: string;
  codigo_positivo: string;
  codigo_negativo?: string | null;
  tiene_negativo: boolean;
  origen: "sistema" | "modelo_principal" | "personalizada";
  estado_entrenamiento: string;
  modelo_path?: string | null;
  activa: boolean;
  solo_lectura: boolean;
}

export interface ClaseDeteccionCreate {
  nombre_visible: string;
  codigo_positivo: string;
  codigo_negativo?: string | null;
  tiene_negativo: boolean;
  activa?: boolean;
}
