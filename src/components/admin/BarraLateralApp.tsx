import { LogOut, ShieldCheck } from "lucide-react";
import type { LoggedUser } from "../../models/auth.model";

interface AppSidebarProps {
  sidebarOpen: boolean;
  navItems: { path: string; label: string; icon: React.ReactNode }[];
  currentPath: string;
  gradient: string;
  color: string;
  user: LoggedUser;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const BarraLateralApp = ({
  sidebarOpen,
  navItems,
  currentPath,
  gradient,
  color,
  user,
  onNavigate,
  onLogout,
}: AppSidebarProps) => {
  return (
    <aside
      className={`${sidebarOpen ? "w-64" : "w-16"} shrink-0 h-screen bg-linear-to-b from-[#0a1628] via-[#0f2744] to-[#1a3a5c] text-white flex flex-col transition-all duration-300`}
    >
      <div
        className={`px-4 py-5 border-b border-white/10 flex items-center ${sidebarOpen ? "gap-3" : "justify-center"}`}
      >
        <div className="h-9 w-9 shrink-0 rounded-lg bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center ring-1 ring-white/20 shadow-md">
          <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.25} />
        </div>
        {sidebarOpen && (
          <div>
            <div className="text-sm font-extrabold tracking-[0.04em] leading-none">
              EPP MONITOR
            </div>
            <div className="text-[10px] text-white/55 uppercase tracking-[0.12em] mt-1">
              Sistema de Seguridad
            </div>
          </div>
        )}
      </div>

      {sidebarOpen && (
        <div className="mx-3 mt-3 mb-1 px-3 py-2 rounded-md bg-white/5 border border-white/10">
          <div className="text-[10px] text-white/45 uppercase tracking-[0.1em]">
            Módulo activo
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: color }}
            />
            <div className="text-xs font-semibold text-white">
              {user.rolLabel}
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              title={!sidebarOpen ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm font-medium ${
                active
                  ? `bg-linear-to-r ${gradient} text-white shadow-lg`
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              } ${!sidebarOpen ? "justify-center" : ""}`}
            >
              <span className="shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        {sidebarOpen ? (
          <div className="flex items-center gap-3 px-2 py-2">
            <div
              className={`h-9 w-9 rounded-full bg-linear-to-br ${gradient} text-white flex items-center justify-center shadow-md shrink-0 text-xs font-bold`}
            >
              {user.nombre[0]}
              {user.apelido[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white leading-tight">
                {user.nombre} {user.apelido}
              </div>
              <div className="text-[10px] text-white/50 uppercase tracking-[0.08em] mt-0.5">
                {user.rolLabel}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="text-white/60 hover:text-white transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full bg-linear-to-br ${gradient} text-white flex items-center justify-center shadow-md text-[11px] font-bold`}
            >
              {user.nombre[0]}
              {user.apelido[0]}
            </div>
            <button
              onClick={onLogout}
              className="text-white/60 hover:text-white transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
