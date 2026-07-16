export interface Zona {
  id_zona: number;
  nombre_zona: string;
  nivel_riesgo?: string | null;
  tiempo_toleracia_segundo?: number | null;
  epp_ids?: number[];
  epps?: Array<{
    id_tipo_epp: number;
    nombre_epp: string;
    clase_yolo?: string | null;
    estado_calibracion?: "pendiente" | "validado";
  }>;
}

export interface ZonaCreate {
  nombre_zona: string;
  nivel_riesgo?: string | null;
  tiempo_toleracia_segundo?: number | null;
  epp_ids?: number[];
}

export interface ZonaUpdate {
  nombre_zona?: string;
  nivel_riesgo?: string | null;
  tiempo_toleracia_segundo?: number | null;
  epp_ids?: number[];
}

export const ZONA_NIVELES_RIESGO = ["bajo", "medio", "alto"] as const;

export const inferirNivelRiesgo = (
  cantidadEpp: number,
  toleranciaSegundos?: number | null,
): "bajo" | "medio" | "alto" => {
  const tolerancia = Number(toleranciaSegundos ?? 0);
  const eppScore =
    cantidadEpp >= 5 ? 3 : cantidadEpp >= 3 ? 2 : cantidadEpp >= 1 ? 1 : 0;
  const toleranciaScore =
    tolerancia > 0 && tolerancia <= 30
      ? 3
      : tolerancia <= 60
        ? 2
        : tolerancia <= 120
          ? 1
          : 0;
  const score = eppScore + toleranciaScore;

  if (score >= 5) return "alto";
  if (score >= 3) return "medio";
  return "bajo";
};

export const NIVEL_RIESGO_CONFIG = {
  alto: {
    label: "Alto",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700 border border-red-200",
  },
  medio: {
    label: "Medio",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    dot: "bg-yellow-500",
    badge: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  },
  bajo: {
    label: "Bajo",
    color: "#059669",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-700 border border-green-200",
  },
} as const;
