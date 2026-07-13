import {
  Activity,
  AlertTriangle,
  Camera,
  Check,
  ShieldCheck,
  Smartphone,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { GraficosDashboard } from "../../components/admin/GraficosDashboard";
import { ModalCamaraDashboard } from "../../components/admin/ModalCamaraDashboard";
import { TransmisionVideo } from "../../components/admin/TransmisionVideo";
import { CustomSelect } from "../../components/form/CustomSelect";
import { useDashboard } from "../../controllers/useDashboard";
import { usePermission } from "../../hooks/usePermissions";
import { PERM_ALERTAS_CREAR } from "../../constants/permissionsConstants";

import type { RootState } from "../../store";

export const DashboardView = () => {
  const {
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
  } = useDashboard();

  const { user } = useSelector((state: RootState) => state.auth);
  const puedeReportar = usePermission(PERM_ALERTAS_CREAR);

  return (
    <div>
      <div className="mb-6">
        <div className="text-2xl font-bold text-black tracking-[-0.01em]">
          Dashboard
        </div>
        <div className="text-subtitle mt-1">
          Monitoreo en vivo de todas las zonas del sistema
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-[#e5e5e5] rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-label">
              Cámaras Online
            </span>
            <div className="h-8 w-8 rounded-md bg-green-50 flex items-center justify-center">
              <Camera size={16} className="text-green-600" />
            </div>
          </div>
          <div className="text-number">
            {camarasOnline}
          </div>
          <div className="mt-1 text-small">
            de <span className="font-medium">{camaras.length}</span> totales
          </div>
        </div>

        <div className="bg-white border border-[#e5e5e5] rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-label">
              Alertas Hoy
            </span>
            <div className="h-8 w-8 rounded-md bg-red-50 flex items-center justify-center">
              <AlertTriangle size={16} className="text-red-600" />
            </div>
          </div>
          <div className="text-number">
            {alertasHoy}
          </div>
          <div
            className={`mt-1 text-small ${alertasPendientes > 0 ? "text-red-600" : "text-green-600"}`}
          >
            {alertasPendientes > 0 ? (
              <span className="flex items-center gap-1">
                <AlertTriangle size={14} /> {alertasPendientes} pendiente
                {alertasPendientes !== 1 ? "s" : ""}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Check size={14} /> Sin infracciones
              </span>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#e5e5e5] rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-label">
              Zonas
            </span>
            <div className="h-8 w-8 rounded-md bg-blue-50 flex items-center justify-center">
              <Activity size={16} className="text-blue-600" />
            </div>
          </div>
          <div className="text-number">
            {new Set(camaras.map((c) => c.id_zona)).size}
          </div>
          <div className="mt-1 text-small">
            zonas activas
          </div>
        </div>

        <div className="bg-white border border-[#e5e5e5] rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-label">
              Sistema
            </span>
            <div className="h-8 w-8 rounded-md bg-blue-50 flex items-center justify-center">
              <ShieldCheck size={16} className="text-blue-600" />
            </div>
          </div>
          <div className="text-number">
            Operativo
          </div>
          <div className="mt-1 text-small">
            100% disponibilidad
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="text-section-title">
          Transmisión en Vivo
        </div>
        <span className="text-small">
          {camarasOnline} cámara{camarasOnline !== 1 ? "s" : ""} activa
          {camarasOnline !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <span className="animate-pulse">Cargando cámaras...</span>
        </div>
      ) : camaras.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-[#6b6b6b] gap-2">
          <Camera size={48} />
          <span>No hay cámaras configuradas</span>
          <Link
            to="/admin/camaras"
            className="text-blue-500 text-sm hover:underline"
          >
            Configurar cámaras
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {camaras.map((cam) => (
            <div
              key={cam.id_camara}
              className="bg-white border border-[#e5e5e5] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => setCamaraExpandida(cam)}
            >
              <div className="relative">
                <TransmisionVideo
                  camaraId={cam.id_camara}
                  label={cam.codigo_camara}
                  height="h-44"
                  source={
                    cam.tipo_fuente === "fallback_phone" ? "view" : "rtsp"
                  }
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-full p-2">
                    <Camera size={20} className="text-white" />
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 border-t border-[#ececec]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-black">
                      {cam.codigo_camara}
                    </div>
                    <div className="text-xs text-gray-500">
                      {cam.zona_nombre || "Sin zona"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {cam.estado_conexion === "activo" ? (
                      <>
                        <Wifi size={14} className="text-green-500" />
                        <span className="text-[11px] text-green-600 font-medium">
                          Online
                        </span>
                      </>
                    ) : (
                      <>
                        <WifiOff size={14} className="text-gray-300" />
                        <span className="text-[11px] text-gray-400">
                          Offline
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-[11px] text-gray-300 font-mono mt-1">
                  {cam.tipo_fuente === "fallback_phone" ? (
                    <span className="flex items-center gap-1">
                      <Smartphone size={12} /> Cámara virtual
                    </span>
                  ) : (
                    (cam.ip_direccion ?? "")
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {user && (
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <div className="text-section-title">
              Estadísticas
            </div>
            {zonas.length > 0 && (
              <CustomSelect
                value={zonaSeleccionada ?? ""}
                onChange={(v) => setZonaSeleccionada(v ? Number(v) : null)}
                options={zonas.map((z) => ({ value: z.id_zona, label: z.nombre_zona }))}
                placeholder="Todas las zonas"
                className="h-8"
              />
            )}
            <span className="text-xs-muted bg-[#f5f5f5] px-2 py-0.5 rounded-full">
              {user.rolLabel}
            </span>
          </div>
          <GraficosDashboard rol={user.rol} idZona={zonaSeleccionada} />
        </div>
      )}

      {camaraExpandida && (
        <ModalCamaraDashboard
          camara={camaraExpandida}
          onClose={() => setCamaraExpandida(null)}
          puedeReportar={puedeReportar}
          capturandoIncidencia={capturandoIncidencia}
          mensajeCaptura={mensajeCaptura}
          onReportarIncidencia={capturarIncidenciaDashboard}
        />
      )}
    </div>
  );
};
