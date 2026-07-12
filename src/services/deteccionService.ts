import api from "./api";

export interface TrabajadorCompliance {
  id: number;
  casco: string;
  vestimenta_de_seguridad: string;
  mascarilla: string;
  guantes: string;
  botas: string;
  orejera: string;
  gafas_protectoras: string;
  bbox: number[];
  [key: string]: unknown;
}

export interface DeteccionItem {
  clase: string;
  confianza: number;
  caja: number[];
  color: number[] | null;
}

export interface DeteccionResult {
  detecciones: DeteccionItem[];
  trabajadores: TrabajadorCompliance[];
  infraccion: boolean;
  personas_detectadas: number;
}

export const analizarImagen = async (
  frameBase64: string,
  confianzaMinima: number = 0.5,
  iou: number = 0.45,
): Promise<DeteccionResult> => {
  const response = await api.post<DeteccionResult>("/deteccion/analizar", {
    frame_base64: frameBase64,
    confianza_minima: confianzaMinima,
    iou,
  });
  return response.data;
};
