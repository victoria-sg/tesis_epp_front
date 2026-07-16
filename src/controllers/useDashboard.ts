import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { useStreamContext } from "../context/useStreamContext";
import { capturarIncidencia } from "../services/alerta.service";
import api from "../services/api";
import { camaraService } from "../services/camara.service";
import { zonaService } from "../services/zona.service";
import {
  PERM_CAMARAS_VER,
  PERM_MONITOREO_TIEMPO_REAL_VER,
  PERM_ZONAS_VER,
} from "../constants/permissionsConstants";

import type { Camara } from "../models/camara.model";
import type { Zona } from "../models/zona.model";
import type { RootState } from "../store";

export interface DashboardStats {
  mensaje?: string | null;
  zonas_alcance: { id_zona: number; nombre_zona: string }[];
  alertas_por_dia: { dia: string; alertas: number }[];
  cumplimiento_tendencia: { dia: string; alertas: number }[];
  alertas_por_hora: { hora: string; alertas: number }[];
  horas_mayor_incidencia: { hora: string; alertas: number }[];
  alertas_por_zona: {
    id_zona: number;
    zona: string;
    alertas: number;
    nivel_riesgo: string;
  }[];
  semaforo_zonas: {
    id_zona: number;
    zona: string;
    alertas: number;
    nivel_riesgo: string;
    cumplimiento: number;
  }[];
  alertas_por_estado: { estado: string; alertas: number }[];
  epp_incumplido: { epp: string; alertas: number }[];
  resumen: {
    total: number;
    pendientes: number;
    resueltas: number;
    descartadas: number;
    hoy: number;
    mes_actual: number;
    semana_actual: number;
    semana_anterior: number;
    cumplimiento_general: number;
    tiempo_promedio_resolucion_min: number;
    zonas_criticas: { zona: string; alertas: number; nivel_riesgo: string }[];
    epp_mas_incumplido: string;
  };
  camaras: { total: number; activas: number; desconectadas: number };
  admin: {
    zonas_configuradas: number;
    usuarios_por_rol: { rol: string; usuarios: number }[];
    epp_por_zona: { id_zona: number; zona: string; epp_configurados: number }[];
  };
  supervisor: {
    zonas_supervisadas: { id_zona: number; nombre_zona: string }[];
  };
  ultimas_alertas: { id: number; camara: number; estado: string; fecha: string | null }[];
}

export const useDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [camaras, setCamaras] = useState<Camara[]>([]);
  const [loading, setLoading] = useState(true);
  const [camaraExpandida, setCamaraExpandida] = useState<Camara | null>(null);
  const [capturandoIncidencia, setCapturandoIncidencia] = useState(false);
  const [mensajeCaptura, setMensajeCaptura] = useState<string | null>(null);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [zonaSeleccionada, setZonaSeleccionada] = useState<number | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { frames } = useStreamContext();

  const cargarDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { rango: "7d" };
      if (zonaSeleccionada) params.id_zona = zonaSeleccionada;
      const statsResponse = await api.get<DashboardStats>("/stats/dashboard", {
        params,
      });

      const statsData = statsResponse.data;
      const permisos = user?.permisos ?? [];
      const puedeCargarCamaras =
        permisos.includes(PERM_CAMARAS_VER) ||
        permisos.includes(PERM_MONITOREO_TIEMPO_REAL_VER);
      const puedeCargarZonas = permisos.includes(PERM_ZONAS_VER);
      const [camarasData, zonasData] = await Promise.all([
        puedeCargarCamaras ? camaraService.getAll().catch(() => []) : [],
        puedeCargarZonas ? zonaService.getAll().catch(() => []) : [],
      ]);
      const idsAlcance = new Set(statsData.zonas_alcance.map((z) => z.id_zona));
      const camarasFiltradas =
        user?.rol === "supervisor"
          ? camarasData.filter((camara) => idsAlcance.has(camara.id_zona))
          : zonaSeleccionada
            ? camarasData.filter((camara) => camara.id_zona === zonaSeleccionada)
            : camarasData;

      setStats(statsData);
      setCamaras(camarasFiltradas);
      setZonas(
        !puedeCargarZonas
          ? statsData.zonas_alcance.map((zona) => ({
              id_zona: zona.id_zona,
              nombre_zona: zona.nombre_zona,
            }))
          : user?.rol === "supervisor"
          ? zonasData.filter((zona) => idsAlcance.has(zona.id_zona))
          : zonasData,
      );
    } catch {
      setStats(null);
      setCamaras([]);
    } finally {
      setLoading(false);
    }
  }, [user?.permisos, user?.rol, zonaSeleccionada]);

  useEffect(() => {
    cargarDashboard();
    const intervalo = setInterval(cargarDashboard, 30000);
    return () => clearInterval(intervalo);
  }, [cargarDashboard]);

  const capturarIncidenciaDashboard = async (camaraId: number) => {
    const frame = frames[camaraId];
    if (!frame) {
      setMensajeCaptura("Sin imagen disponible");
      setTimeout(() => setMensajeCaptura(null), 3000);
      return;
    }
    setCapturandoIncidencia(true);
    try {
      await capturarIncidencia({
        id_camara: camaraId,
        frame_base64: frame,
        descripcion: "Incidencia reportada desde el Dashboard",
      });
      setMensajeCaptura("Incidencia registrada");
      await cargarDashboard();
    } catch {
      setMensajeCaptura("Error al registrar");
    } finally {
      setCapturandoIncidencia(false);
      setTimeout(() => setMensajeCaptura(null), 3000);
    }
  };

  return {
    camaras,
    loading,
    camaraExpandida,
    setCamaraExpandida,
    alertasHoy: stats?.resumen.hoy ?? 0,
    alertasPendientes: stats?.resumen.pendientes ?? 0,
    capturandoIncidencia,
    mensajeCaptura,
    zonas,
    zonaSeleccionada,
    setZonaSeleccionada,
    camarasOnline: stats?.camaras.activas ?? 0,
    dashboardStats: stats,
    capturarIncidenciaDashboard,
  };
};
