import { Crosshair, Gauge, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type TrainingPreset = "rapido" | "balanceado" | "preciso";

export interface TrainingOverrides {
  epochs?: number;
  batch?: number;
  imgsz?: number;
  patience?: number;
  workers?: number;
  lr0?: number;
  optimizer?: string;
  augment?: boolean;
  mosaic?: number;
  dropout?: number;
}

export interface TrainingRequest {
  preset: TrainingPreset;
  overrides?: TrainingOverrides;
}

export interface ProgressInfo {
  actual: number;
  total: number;
  porcentaje: number;
  detalle: string;
}

export interface TimeInfo {
  transcurrido_seg: number;
  estimado_restante_seg: number;
}

export interface TrainingStatusEvent {
  id_clase_deteccion: number;
  operacion: "autoetiquetado" | "entrenamiento";
  estado: "en_curso" | "completado" | "error";
  progreso?: ProgressInfo;
  tiempos?: TimeInfo;
}

export interface PresetInfo {
  key: TrainingPreset;
  label: string;
  description: string;
  icon: LucideIcon;
  params: Record<string, number | string | boolean>;
  badge: string;
  tip: string;
}

export const PRESET_INFOS: Record<TrainingPreset, PresetInfo> = {
  rapido: {
    key: "rapido",
    label: "Rápido",
    description: "Entrenamiento veloz para pruebas",
    icon: Zap,
    params: { epochs: 10, imgsz: 416, batch: 16 },
    badge: "~5 min",
    tip: "Ideal para validar que el dataset funciona",
  },
  balanceado: {
    key: "balanceado",
    label: "Balanceado",
    description: "Relación calidad-velocidad ideal",
    icon: Gauge,
    params: { epochs: 30, imgsz: 640, batch: 8 },
    badge: "~30 min",
    tip: "Recomendado para la mayoría de casos",
  },
  preciso: {
    key: "preciso",
    label: "Preciso",
    description: "Máxima precisión para producción",
    icon: Crosshair,
    params: { epochs: 100, imgsz: 800, batch: 4 },
    badge: "~2-3 hrs",
    tip: "Para obtener el mejor rendimiento posible",
  },
};

export const OVERRIDE_LABELS: Record<string, string> = {
  epochs: "Épocas",
  batch: "Batch size",
  imgsz: "Tamaño de imagen",
  patience: "Paciencia (early stopping)",
  workers: "Workers",
  lr0: "Learning rate",
  optimizer: "Optimizador",
  augment: "Aumentación",
  mosaic: "Mosaic",
  dropout: "Dropout",
};
