import { useCallback, useEffect, useMemo, useState } from "react";
import type { AlertaReporte } from "../models/reporte.model";
import { getReporteAlertas } from "../services/reporte.service";
import api from "../services/api";

const escaparCeldaCsv = (valor: string | number | null): string => {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  return `"${texto.replace(/"/g, '""')}"`;
};

export const useReportes = () => {
  const [data, setData] = useState<AlertaReporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filtroZona, setFiltroZona] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<string>("");
  const [filtroCamara, setFiltroCamara] = useState<string>("");

  const [alertaResolviendo, setAlertaResolviendo] = useState<AlertaReporte | null>(null);
  const [comentario, setComentario] = useState("");
  const [resolviendoLoading, setResolviendoLoading] = useState(false);
  const [resolviendoError, setResolviendoError] = useState<string | null>(null);

  const cargarReporte = useCallback(async () => {
    setError(null);
    try {
      const reporte = await getReporteAlertas();
      setData(reporte);
    } catch {
      setError("No se pudo cargar el reporte de alertas. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(cargarReporte, 0);
    return () => clearTimeout(timer);
  }, [cargarReporte]);

  const zonasUnicas = useMemo(
    () => [...new Set(data.map((a) => a.nombre_zona).filter(Boolean))],
    [data],
  );

  const camarasUnicas = useMemo(
    () => [...new Set(data.map((a) => a.codigo_camara).filter(Boolean))],
    [data],
  );

  const filteredData = useMemo(() => {
    const q = query.toLowerCase().trim();
    return data.filter((a) => {
      if (q && !`${a.nombre_zona} ${a.codigo_camara} ${a.estado_alerta ?? ""} ${a.comentario_resolucion ?? ""} ${a.resuelto_por ?? ""}`
          .toLowerCase().includes(q)) return false;
      if (filtroZona && a.nombre_zona !== filtroZona) return false;
      if (filtroEstado && a.estado_alerta !== filtroEstado) return false;
      if (filtroCamara && a.codigo_camara !== filtroCamara) return false;
      return true;
    });
  }, [data, query, filtroZona, filtroEstado, filtroCamara]);

  const stats = useMemo(() => ({
    total: data.length,
    pendientes: data.filter((a) => a.estado_alerta === "Pendiente").length,
    resueltas: data.filter((a) => a.estado_alerta === "Resuelta").length,
  }), [data]);

  const abrirModalResolucion = useCallback((alerta: AlertaReporte) => {
    setAlertaResolviendo(alerta);
    setComentario("");
    setResolviendoError(null);
  }, []);

  const cerrarModalResolucion = useCallback(() => {
    setAlertaResolviendo(null);
    setComentario("");
    setResolviendoError(null);
  }, []);

  const resolverAlerta = useCallback(async () => {
    if (!alertaResolviendo) return;
    if (!comentario.trim()) {
      setResolviendoError("El comentario es obligatorio.");
      return;
    }

    setResolviendoLoading(true);
    setResolviendoError(null);
    try {
      await api.post(
        `/resoluciones/alertas/${alertaResolviendo.id_alerta}/resolver`,
        { comentario: comentario.trim() },
      );
      cerrarModalResolucion();
      await cargarReporte();
    } catch {
      setResolviendoError("No se pudo resolver la alerta. Intenta de nuevo.");
    } finally {
      setResolviendoLoading(false);
    }
  }, [alertaResolviendo, comentario, cerrarModalResolucion, cargarReporte]);

  const exportarCsv = useCallback(() => {
    const encabezados = [
      "Fecha de detección",
      "Zona",
      "Cámara",
      "Duración (s)",
      "Estado",
      "Resolución / justificación",
      "Resuelto por",
      "Fecha de resolución",
    ];
    const filas = filteredData.map((a) => [
      a.fecha_hora_deteccion,
      a.nombre_zona,
      a.codigo_camara,
      a.segundos_transcurridos,
      a.estado_alerta,
      a.comentario_resolucion,
      a.resuelto_por,
      a.fecha_hora_resolucion,
    ]);

    const csv = [encabezados, ...filas]
      .map((fila) => fila.map(escaparCeldaCsv).join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `reporte-alertas-${new Date().toISOString().slice(0, 10)}.csv`;
    enlace.click();
    URL.revokeObjectURL(url);
  }, [filteredData]);

  return {
    data: filteredData,
    totalSinFiltrar: data.length,
    loading,
    error,
    query,
    setQuery,
    filtroZona,
    setFiltroZona,
    filtroEstado,
    setFiltroEstado,
    filtroCamara,
    setFiltroCamara,
    zonas: zonasUnicas,
    camaras: camarasUnicas,
    exportarCsv,
    stats,
    alertaResolviendo,
    comentario,
    setComentario,
    resolviendoLoading,
    resolviendoError,
    abrirModalResolucion,
    cerrarModalResolucion,
    resolverAlerta,
    recargar: cargarReporte,
  };
};