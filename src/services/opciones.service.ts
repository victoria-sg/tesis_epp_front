import api from "./api";
import { API_ROUTES } from "../constants/apiRoutesConstants";

export const opcionesService = {
  getNivelesRiesgo: async (): Promise<string[]> => {
    const response = await api.get<string[]>(
      `${API_ROUTES.OPCIONES}/niveles-riesgo`,
    );
    return Array.isArray(response.data) ? response.data : [];
  },
};
