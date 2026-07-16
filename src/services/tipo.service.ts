import { API_ROUTES } from "../constants/apiRoutesConstants";
import type {
  TipoEPP,
  TipoEPPCreate,
  TipoEPPUpdate,
} from "../models/tipo.model";
import { createCrudService } from "./crud.service";
import api from "./api";

const crud = createCrudService<
  TipoEPP,
  TipoEPPCreate,
  TipoEPPUpdate
>(API_ROUTES.TIPOS_EPP);

const uploadImages = async (
  id: number,
  tipoDataset: "positivo" | "negativo",
  files: File[],
) => {
  const formData = new FormData();
  formData.append("tipo_dataset", tipoDataset);
  files.forEach((file) => formData.append("files", file));
  const response = await api.post(`${API_ROUTES.TIPOS_EPP}/${id}/imagenes`, formData);
  return response.data;
};

const activateCustomModel = async (id: number, modeloPath: string) => {
  const formData = new FormData();
  formData.append("modelo_path", modeloPath);
  const response = await api.post(`${API_ROUTES.TIPOS_EPP}/${id}/activar-modelo`, formData);
  return response.data;
};

const autoLabel = async (id: number) => {
  const response = await api.post(`${API_ROUTES.TIPOS_EPP}/${id}/autoetiquetar`);
  return response.data;
};

const trainCustomModel = async (id: number, epochs?: number) => {
  const response = await api.post(`${API_ROUTES.TIPOS_EPP}/${id}/entrenar`, null, {
    params: { epochs },
  });
  return response.data;
};

const getTrainingTaskStatus = async (taskId: string) => {
  const response = await api.get(`${API_ROUTES.TIPOS_EPP}/tareas/${taskId}`);
  return response.data;
};

export const tipoService = {
  ...crud,
  uploadImages,
  activateCustomModel,
  autoLabel,
  trainCustomModel,
  getTrainingTaskStatus,
};
