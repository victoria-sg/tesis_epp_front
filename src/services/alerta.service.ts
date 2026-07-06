import api from "./api";

export interface AlertaCapturaPayload {
  id_camara: number;
  frame_base64: string;
  descripcion?: string;
}

export const capturarIncidencia = async (
  payload: AlertaCapturaPayload,
): Promise<void> => {
  const response = await api.post("/alertas/captura", payload);
  if (!response.data) {
    throw new Error("Error al guardar la captura");
  }
};
