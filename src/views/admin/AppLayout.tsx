import {
  Bell,
  Camera,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  MapPin,
  Radio,
  Scan,
  ScanSearch,
  Search,
  Shield,
  Shirt,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { BarraLateralApp } from "../../components/admin/BarraLateralApp";
import { DesplegableNotificaciones } from "../../components/admin/DesplegableNotificaciones";

import { StreamProvider } from "../../context/StreamContext";
import { NotificacionVinculacion } from "../../components/admin/NotificacionVinculacion";
import {
  APP_CAMBIAR_CONTRASENA,
  APP_LOGIN,
} from "../../constants/authRoutesConstants";
import {
  PERM_DASHBOARD_VER, PERM_USUARIOS_VER, PERM_ROLES_VER,
  PERM_ZONAS_VER, PERM_CAMARAS_VER, PERM_TIPOS_EPP_VER,
  PERM_REPORTES_VER, PERM_DETECCION_VER,
  PERM_ALERTAS_VER, PERM_MONITOREO_TIEMPO_REAL_VER,
  PERM_REPORTES_TURNO_VER, PERM_CLASES_DETECCION_VER,
} from "../../constants/permissionsConstants";
import { APP_ROUTES } from "../../constants/apiRoutesConstants";
import { SIO_EVENT_NUEVA_ALERTA } from "../../constants/socketEvents";
import { fetchClassInfo } from "../../utils/detectionColors";
import { useAuthGuard } from "../../controllers/useAuthGuard";
import { useSocket } from "../../hooks/useSocket";
import { logout } from "../../store/authSlice";
import type { RootState } from "../../store";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const PERMISSION_NAV_MAP: { permiso?: string; item: NavItem }[] = [
  { permiso: PERM_DASHBOARD_VER, item: { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> } },
  { permiso: PERM_MONITOREO_TIEMPO_REAL_VER, item: { path: APP_ROUTES.MONITOREO_TIEMPO_REAL, label: "Monitoreo en tiempo real", icon: <Radio size={16} /> } },
  { permiso: PERM_ALERTAS_VER, item: { path: APP_ROUTES.ALERTAS, label: "Alertas", icon: <Bell size={16} /> } },
  { permiso: PERM_REPORTES_TURNO_VER, item: { path: APP_ROUTES.REPORTES_TURNO, label: "Reportes de turno", icon: <FileText size={16} /> } },
  { permiso: PERM_USUARIOS_VER, item: { path: "/admin/usuarios", label: "Usuarios", icon: <Users size={16} /> } },
  { permiso: PERM_ROLES_VER, item: { path: "/admin/roles", label: "Roles", icon: <Shield size={16} /> } },
  { permiso: PERM_ZONAS_VER, item: { path: "/admin/zonas", label: "Zonas", icon: <MapPin size={16} /> } },
  { permiso: PERM_CAMARAS_VER, item: { path: "/admin/camaras", label: "Cámaras", icon: <Camera size={16} /> } },
  { permiso: PERM_CLASES_DETECCION_VER, item: { path: APP_ROUTES.CLASES_DETECCION, label: "Clases", icon: <ScanSearch size={16} /> } },
  { permiso: PERM_TIPOS_EPP_VER, item: { path: "/admin/tipos-epp", label: "Tipos de EPP", icon: <Shirt size={16} /> } },
  { permiso: PERM_REPORTES_VER, item: { path: APP_ROUTES.REPORTES, label: "Reportes ejecutivos", icon: <FileText size={16} /> } },
  { permiso: PERM_DETECCION_VER, item: { path: "/admin/deteccion", label: "Detección", icon: <Scan size={16} /> } },
];

const ROLE_GRADIENT: Record<string, string> = {
  supervisor: "from-[#3b82f6] to-[#2563eb]",
  sso: "from-[#10b981] to-[#059669]",
  admin: "from-[#8b5cf6] to-[#7c3aed]",
};

const ROLE_COLOR: Record<string, string> = {
  supervisor: "#3b82f6",
  sso: "#10b981",
  admin: "#8b5cf6",
};

interface NotificacionAlerta {
  id_alerta: number;
  id_camara: number;
  detalle_infraccion: string;
  fecha_hora_deteccion: string | null;
  estado_alerta: string;
}

const AppLayoutContent = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificaciones, setNotificaciones] = useState<NotificacionAlerta[]>([]);
  const [notificacionesOpen, setNotificacionesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { alertasSocket: socket } = useSocket();

  useEffect(() => {
    if (!user || !socket) return;
    const handleNuevaAlerta = (data: NotificacionAlerta) => {
      if (data && data.id_alerta) {
        setNotificaciones((prev) => [data, ...prev].slice(0, 20));
      }
    };
    socket.on(SIO_EVENT_NUEVA_ALERTA, handleNuevaAlerta);
    return () => { socket.off(SIO_EVENT_NUEVA_ALERTA, handleNuevaAlerta); };
  }, [user, socket]);

  useEffect(() => {
    fetchClassInfo();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNotificacionesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = PERMISSION_NAV_MAP.filter(
    ({ permiso }) => !permiso || user!.permisos.includes(permiso),
  ).map(({ item }) => item);
  const gradient = ROLE_GRADIENT[user!.rol] ?? ROLE_GRADIENT.admin;
  const color = ROLE_COLOR[user!.rol] ?? ROLE_COLOR.admin;

  const handleLogout = () => {
    dispatch(logout());
    navigate(APP_LOGIN, { replace: true });
  };

  return (
    <div className="h-screen flex bg-[#f5f5f5] overflow-hidden">
      <BarraLateralApp
        sidebarOpen={sidebarOpen}
        navItems={navItems}
        currentPath={location.pathname}
        gradient={gradient}
        color={color}
        user={user!}
        onNavigate={(path) => navigate(path)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="bg-white border-b border-[#e5e5e5] px-4 h-14 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="h-8 w-8 rounded-md border border-[#d4d4d4] hover:border-[#3b82f6] hover:bg-blue-50 flex items-center justify-center transition-colors shrink-0"
            title={sidebarOpen ? "Ocultar menú" : "Mostrar menú"}
          >
            {sidebarOpen ? (
              <ChevronLeft size={15} className="text-gray-500" />
            ) : (
              <ChevronRight size={15} className="text-gray-500" />
            )}
          </button>

          <div className="relative flex-1 max-w-md">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              placeholder="Buscar en el sistema…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-md bg-[#f5f5f5] focus:bg-white border border-transparent focus:border-[#3b82f6] outline-none transition-colors text-sm"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="text-label flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f5f5f5]">
              <span className="h-1.5 w-1.5 rounded-full bg-linear-to-r from-[#10b981] to-[#059669] animate-pulse shadow-sm shadow-green-500/50" />
              Sistema en línea
            </span>
            <DesplegableNotificaciones
              ref={dropdownRef}
              notificaciones={notificaciones}
              notificacionesOpen={notificacionesOpen}
              onToggle={() => setNotificacionesOpen((prev) => !prev)}
              onClear={() => setNotificaciones([])}
              onNavigateReportes={() => { navigate(APP_ROUTES.ALERTAS); setNotificacionesOpen(false); }}
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const AppLayout = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const { checkingAuth } = useAuthGuard();

  useEffect(() => {
    if (checkingAuth) return;
    if (!user) navigate(APP_LOGIN, { replace: true });
    else if (user.primer_inicio_sesion)
      navigate(APP_CAMBIAR_CONTRASENA, { replace: true });
  }, [user, navigate, checkingAuth]);

  if (checkingAuth) return null;
  if (!user) return null;

  return (
    <StreamProvider>
      <AppLayoutContent />
      <NotificacionVinculacion />
    </StreamProvider>
  );
};
