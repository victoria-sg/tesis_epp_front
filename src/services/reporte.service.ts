import { API_ROUTES } from "../constants/apiRoutesConstants";
import type { AlertaReporte } from "../models/reporte.model";
import type { ReporteTurno, ReporteTurnoEmitido } from "../models/reporte.model";
import api from "./api";

export const getReporteAlertas = async (): Promise<AlertaReporte[]> => {
  const response = await api.get<AlertaReporte[]>(
    `${API_ROUTES.ALERTAS}/reporte`,
  );
  return response.data;
};

export const getReporteTurno = async (params?: {
  fecha_inicio?: string;
  fecha_fin?: string;
}): Promise<ReporteTurno> => {
  const response = await api.get<ReporteTurno>(
    `${API_ROUTES.ALERTAS}/reporte-turno`,
    { params },
  );
  return response.data;
};

export const emitirReporteTurno = async (params?: {
  fecha_inicio?: string;
  fecha_fin?: string;
}): Promise<ReporteTurnoEmitido> => {
  const response = await api.post<ReporteTurnoEmitido>(
    `${API_ROUTES.ALERTAS}/reporte-turno/emitir`,
    null,
    { params },
  );
  return response.data;
};

export const getReportesEmitidos = async (): Promise<ReporteTurnoEmitido[]> => {
  const response = await api.get<ReporteTurnoEmitido[]>(
    `${API_ROUTES.ALERTAS}/reportes-emitidos`,
  );
  return response.data;
};
