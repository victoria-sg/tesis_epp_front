import { AlarmClock, Bell } from "lucide-react";
import { forwardRef } from "react";

interface NotificacionAlerta {
  id_alerta: number;
  id_camara: number;
  detalle_infraccion: string;
  fecha_hora_deteccion: string | null;
  estado_alerta: string;
}

interface NotificationDropdownProps {
  notificaciones: NotificacionAlerta[];
  notificacionesOpen: boolean;
  onToggle: () => void;
  onClear: () => void;
  onNavigateReportes: () => void;
}

export const DesplegableNotificaciones = forwardRef<
  HTMLDivElement,
  NotificationDropdownProps
>(({ notificaciones, notificacionesOpen, onToggle, onClear, onNavigateReportes }, ref) => {
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onToggle}
        className="relative h-9 w-9 rounded-md border border-[#d4d4d4] hover:border-[#ef4444] flex items-center justify-center transition-colors"
      >
        <Bell size={15} className="text-gray-500" />
        {notificaciones.length > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-md">
            {notificaciones.length > 99 ? "99+" : notificaciones.length}
          </span>
        )}
      </button>
      {notificacionesOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#e5e5e5] rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-3 border-b border-[#ececec] flex items-center justify-between">
            <span className="text-sm font-semibold text-black">
              Alertas recientes
            </span>
            <button
              onClick={onClear}
              className="text-[10px] text-blue-600 hover:underline"
            >
              Limpiar
            </button>
          </div>
          {notificaciones.length === 0 ? (
            <div className="px-4 py-8 text-center text-[12px] text-gray-500">
              No hay alertas nuevas
            </div>
          ) : (
            notificaciones.slice(0, 10).map((n) => (
              <div
                key={n.id_alerta}
                className="px-4 py-3 border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors cursor-pointer"
                onClick={onNavigateReportes}
              >
                <div className="flex items-start gap-2">
                  <AlarmClock
                    size={14}
                    className="text-red-500 mt-0.5 shrink-0"
                  />
                  <div>
                    <div className="text-xs font-medium text-black leading-snug">
                      {n.detalle_infraccion || "Infracción detectada"}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      {n.fecha_hora_deteccion
                        ? new Date(n.fecha_hora_deteccion).toLocaleString(
                            "es-EC",
                            { timeZone: "America/Guayaquil" },
                          )
                        : "—"}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
});

DesplegableNotificaciones.displayName = "NotificationDropdown";
