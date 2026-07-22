import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { forwardRef } from "react";
import { DesplegableNotificaciones } from "./DesplegableNotificaciones";

interface NotificacionAlerta {
  id_alerta: number;
  id_camara: number;
  detalle_infraccion: string;
  fecha_hora_deteccion: string | null;
  estado_alerta: string;
}

interface AppHeaderProps {
  sidebarOpen: boolean;
  searchQuery: string;
  onToggleSidebar: () => void;
  onSearchChange: (value: string) => void;
  notificaciones: NotificacionAlerta[];
  notificacionesOpen: boolean;
  onToggleNotificaciones: () => void;
  onClearNotificaciones: () => void;
  onNavigateReportes: () => void;
}

export const EncabezadoApp = forwardRef<HTMLDivElement, AppHeaderProps>(
  (
    {
      sidebarOpen,
      searchQuery,
      onToggleSidebar,
      onSearchChange,
      notificaciones,
      notificacionesOpen,
      onToggleNotificaciones,
      onClearNotificaciones,
      onNavigateReportes,
    },
    ref,
  ) => {
    return (
      <header className="bg-white border-b border-slate-200 px-4 h-14 flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="h-8 w-8 rounded-md border border-slate-300 hover:border-brand-500 hover:bg-brand-50 flex items-center justify-center transition-colors shrink-0"
          title={sidebarOpen ? "Ocultar menú" : "Mostrar menú"}
        >
          {sidebarOpen ? (
            <ChevronLeft size={15} className="text-slate-500" />
          ) : (
            <ChevronRight size={15} className="text-slate-500" />
          )}
        </button>

        <div className="relative flex-1 max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            placeholder="Buscar en el sistema…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md bg-slate-100 focus:bg-white border border-transparent focus:border-brand-500 outline-none transition-colors text-sm text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100">
            <span className="h-1.5 w-1.5 rounded-full bg-linear-to-r from-success-500 to-success-600 animate-pulse shadow-sm shadow-success-500/50" />
            Sistema en línea
          </span>
          <DesplegableNotificaciones
            ref={ref}
            notificaciones={notificaciones}
            notificacionesOpen={notificacionesOpen}
            onToggle={onToggleNotificaciones}
            onClear={onClearNotificaciones}
            onNavigateReportes={onNavigateReportes}
          />
        </div>
      </header>
    );
  },
);

EncabezadoApp.displayName = "AppHeader";
