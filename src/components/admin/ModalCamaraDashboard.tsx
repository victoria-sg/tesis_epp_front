import { AlertTriangle, Wifi, WifiOff, X } from "lucide-react";

import type { Camara } from "../../models/camara.model";
import { Button } from "../ui/Button";
import { TransmisionVideo } from "./TransmisionVideo";

interface DashboardCameraModalProps {
  camara: Camara;
  onClose: () => void;
  puedeReportar: boolean;
  capturandoIncidencia: boolean;
  mensajeCaptura: string | null;
  onReportarIncidencia: (camaraId: number) => void;
}

export const ModalCamaraDashboard = ({
  camara,
  onClose,
  puedeReportar,
  capturandoIncidencia,
  mensajeCaptura,
  onReportarIncidencia,
}: DashboardCameraModalProps) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
      onClick={onClose}
    >
      <div
        className="flex items-center justify-between px-6 py-4 bg-black/60 backdrop-blur-sm shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="text-white font-semibold text-lg">
            {camara.codigo_camara}
          </div>
          <div className="text-slate-400 text-sm">
            {camara.zona_nombre || "Sin zona"}
          </div>
        </div>
        <button
          onClick={onClose}
          className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X size={18} className="text-white" />
        </button>
      </div>

      <div
        className="flex-1 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full max-w-4xl">
          <TransmisionVideo
            camaraId={camara.id_camara}
            label={camara.codigo_camara}
            height="h-[60vh]"
            source={
              camara.tipo_fuente === "fallback_phone"
                ? "view"
                : "rtsp"
            }
            readonly={true}
          />
        </div>
      </div>

      <div
        className="px-6 py-3 bg-black/60 backdrop-blur-sm shrink-0 flex items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          {camara.estado_conexion === "activo" ? (
            <Wifi size={14} className="text-green-500" />
          ) : (
            <WifiOff size={14} className="text-slate-600" />
          )}
          <span className="text-slate-400 text-xs">
            {camara.estado_conexion === "activo"
              ? "Online"
              : "Offline"}
          </span>
        </div>
        {camara.ip_direccion && (
          <span className="text-slate-600 text-xs font-mono">
            {camara.ip_direccion}
          </span>
        )}
        <div className="ml-auto flex items-center gap-3">
          {puedeReportar && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onReportarIncidencia(camara.id_camara)}
              disabled={capturandoIncidencia}
            >
              {capturandoIncidencia ? (
                "Capturando..."
              ) : (
                <span className="flex items-center gap-1">
                  <AlertTriangle size={14} /> Reportar incidencia
                </span>
              )}
            </Button>
          )}
          {mensajeCaptura && (
            <span
              className={`text-xs font-medium ${
                mensajeCaptura.includes("registrada")
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {mensajeCaptura}
            </span>
          )}
          <span className="text-slate-600 text-xs">
            Haz clic fuera para cerrar
          </span>
        </div>
      </div>
    </div>
  );
};
