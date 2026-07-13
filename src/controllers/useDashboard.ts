import { useEffect, useState } from "react";

import { useStreamContext } from "../context/useStreamContext";
import { capturarIncidencia } from "../services/alerta.service";
import { camaraService } from "../services/camara.service";
import { zonaService } from "../services/zona.service";

import type { Camara } from "../models/camara.model";
import type { Zona } from "../models/zona.model";

export const useDashboard = () => {
  const [camaras, setCamaras] = useState<Camara[]>([]);
  const [loading, setLoading] = useState(true);
  const [camaraExpandida, setCamaraExpandida] = useState<Camara | null>(null);
  const [alertasHoy, setAlertasHoy] = useState(0);
  const [alertasPendientes, setAlertasPendientes] = useState(0);
  const [capturandoIncidencia, setCapturandoIncidencia] = useState(false);
  const [mensajeCaptura, setMensajeCaptura] = useState<string | null>(null);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [zonaSeleccionada, setZonaSeleccionada] = useState<number | null>(null);
  const { frames } = useStreamContext();

  const cargarAlertas = () => {
    fetch("/alertas/stats", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("epp_token") || ""}`,
      },
    })
      .then((r) => r.json())
      .then((data) => {
        setAlertasHoy(data.data?.alertas_hoy ?? 0);
        setAlertasPendientes(data.data?.pendientes ?? 0);
      })
      .catch(() => {});
  };

  const cargarCamaras = () => {
    camaraService
      .getAll()
      .then((data) => {
        setCamaras(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    cargarCamaras();
    zonaService
      .getAll()
      .then((data) => setZonas(data))
      .catch(() => {});
    cargarAlertas();

    const intervaloAlertas = setInterval(cargarAlertas, 30000);
    const intervaloCamaras = setInterval(cargarCamaras, 30000);
    return () => {
      clearInterval(intervaloAlertas);
      clearInterval(intervaloCamaras);
    };
  }, []);

  const camarasOnline = camaras.filter(
    (c) => c.estado_conexion === "activo",
  ).length;

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
      cargarAlertas();
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
    alertasHoy,
    alertasPendientes,
    capturandoIncidencia,
    mensajeCaptura,
    zonas,
    zonaSeleccionada,
    setZonaSeleccionada,
    camarasOnline,
    capturarIncidenciaDashboard,
  };
};
