import { API_ROUTES } from "../constants/apiRoutesConstants";
import type { ClaseDeteccion, ClaseDeteccionCreate } from "../models/claseDeteccion.model";
import api from "./api";

export const claseDeteccionService = {
  getAll: async (): Promise<ClaseDeteccion[]> => {
    const response = await api.get<
      ClaseDeteccion[] | { data?: ClaseDeteccion[] }
    >(`${API_ROUTES.CLASES_DETECCION}/`);
    const payload = response.data;
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
  },
  create: async (data: ClaseDeteccionCreate): Promise<ClaseDeteccion> => {
    const response = await api.post<ClaseDeteccion>(`${API_ROUTES.CLASES_DETECCION}/`, data);
    return response.data;
  },
  uploadImages: async (
    id: number,
    tipoDataset: "positivo" | "negativo",
    files: File[],
  ) => {
    const formData = new FormData();
    formData.append("tipo_dataset", tipoDataset);
    files.forEach((file) => formData.append("files", file));
    const response = await api.post(`${API_ROUTES.CLASES_DETECCION}/${id}/imagenes`, formData);
    return response.data;
  },
  autoLabel: async (id: number) => {
    const response = await api.post(`${API_ROUTES.CLASES_DETECCION}/${id}/autoetiquetar`);
    return response.data;
  },
  train: async (id: number, epochs?: number) => {
    const params: Record<string, unknown> = {};
    if (epochs !== undefined) params.epochs = epochs;
    const response = await api.post(`${API_ROUTES.CLASES_DETECCION}/${id}/entrenar`, undefined, { params });
    return response.data;
  },
  getTaskStatus: async (taskId: string) => {
    const response = await api.get(`${API_ROUTES.CLASES_DETECCION}/tareas/${taskId}`);
    return response.data;
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`${API_ROUTES.CLASES_DETECCION}/${id}`);
  },
};
