import { Activity, Camera, Smartphone, Wifi, WifiOff } from "lucide-react";

import { ModalCamaraDashboard } from "../../components/admin/ModalCamaraDashboard";
import { TransmisionVideo } from "../../components/admin/TransmisionVideo";
import { useDashboard } from "../../controllers/useDashboard";
import { usePermission } from "../../hooks/usePermissions";
import { PERM_ALERTAS_CREAR } from "../../constants/permissionsConstants";

export const MonitoreoTiempoRealView = () => {
  const {
    camaras,
    loading,
    camaraExpandida,
    setCamaraExpandida,
    capturandoIncidencia,
    mensajeCaptura,
    camarasOnline,
    dashboardStats,
    capturarIncidenciaDashboard,
  } = useDashboard();
  const puedeReportar = usePermission(PERM_ALERTAS_CREAR);
  const camarasOffline = Math.max(0, camaras.length - camarasOnline);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-2xl font-bold text-black tracking-[-0.01em]">
            Monitoreo en tiempo real
          </div>
          <div className="text-sm text-slate-500 mt-1">
            Transmisiones activas y estado operativo de camaras en alcance
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 min-w-[320px]">
          <div className="bg-white border border-slate-200 rounded-md px-4 py-3">
            <div className="text-[11px] text-gray-500">Total</div>
            <div className="text-xl font-bold text-black">{camaras.length}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-md px-4 py-3">
            <div className="text-[11px] text-gray-500">Online</div>
            <div className="text-xl font-bold text-green-600">{camarasOnline}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-md px-4 py-3">
            <div className="text-[11px] text-gray-500">Offline</div>
            <div className="text-xl font-bold text-red-600">{camarasOffline}</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <span className="animate-pulse">Cargando camaras...</span>
        </div>
      ) : camaras.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-2 bg-white border border-slate-200 rounded-md">
          <Camera size={48} />
          <span>{dashboardStats?.mensaje || "No hay camaras configuradas"}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {camaras.map((cam) => (
            <div
              key={cam.id_camara}
              className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => setCamaraExpandida(cam)}
            >
              <div className="relative">
                <TransmisionVideo
                  camaraId={cam.id_camara}
                  label={cam.codigo_camara}
                  height="h-44"
                  source={cam.tipo_fuente === "fallback_phone" ? "view" : "rtsp"}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-full p-2">
                    <Activity size={20} className="text-white" />
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 border-t border-[#ececec]">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-black truncate">
                      {cam.codigo_camara}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {cam.zona_nombre || "Sin zona"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
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
                        <span className="text-[11px] text-gray-400">Offline</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-[11px] text-gray-400 font-mono mt-1 truncate">
                  {cam.tipo_fuente === "fallback_phone" ? (
                    <span className="flex items-center gap-1">
                      <Smartphone size={12} /> Camara virtual
                    </span>
                  ) : (
                    (cam.ip_direccion ?? "Sin IP")
                  )}
                </div>
              </div>
            </div>
          ))}
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
