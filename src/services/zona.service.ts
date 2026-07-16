import { API_ROUTES } from "../constants/apiRoutesConstants";
import type { Zona, ZonaCreate, ZonaUpdate } from "../models/zona.model";
import { createCrudService } from "./crud.service";
import api from "./api";

const crud = createCrudService<Zona, ZonaCreate, ZonaUpdate>(
  API_ROUTES.ZONAS,
);

const calibrarEpp = async (idZona: number, idTipoEpp: number): Promise<Zona> => {
  const response = await api.post<Zona>(
    `${API_ROUTES.ZONAS}/${idZona}/epp/${idTipoEpp}/calibrar`,
  );
  return response.data;
};

export const zonaService = { ...crud, calibrarEpp };
