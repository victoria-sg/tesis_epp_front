import {
  Activity,
  AlertTriangle,
  Camera,
  Gauge,
  HardHat,
  MapPin,
  Timer,
  TrendingUp,
  Users,
  WifiOff,
} from "lucide-react";
import { useSelector } from "react-redux";

import { GraficosDashboard } from "../../components/admin/GraficosDashboard";
import { StatCard } from "../../components/ui/Card";
import { CustomSelect } from "../../components/form/CustomSelect";
import { useDashboard } from "../../controllers/useDashboard";

import type { RootState } from "../../store";

export const DashboardView = () => {
  const {
    camaras,
    zonas,
    zonaSeleccionada,
    setZonaSeleccionada,
    camarasOnline,
    dashboardStats,
  } = useDashboard();

  const { user } = useSelector((state: RootState) => state.auth);

  const usuariosTotal =
    dashboardStats?.admin.usuarios_por_rol.reduce(
      (total, item) => total + item.usuarios,
      0,
    ) ?? 0;
  const eppTotal =
    dashboardStats?.admin.epp_por_zona.reduce(
      (total, item) => total + item.epp_configurados,
      0,
    ) ?? 0;
  const zonasSupervisor =
    dashboardStats?.supervisor.zonas_supervisadas.map((z) => z.nombre_zona) ?? [];

  const cards =
    user?.rol === "admin"
      ? [
          {
            label: "Camaras operativas",
            value: dashboardStats?.camaras.activas ?? camarasOnline,
            detail: "online en el sistema",
            icon: <Camera size={18} className="text-green-600" />,
            bg: "bg-green-50",
            iconColor: "text-green-600",
          },
          {
            label: "Camaras desconectadas",
            value: dashboardStats?.camaras.desconectadas ?? 0,
            detail: `${dashboardStats?.camaras.total ?? camaras.length} camaras totales`,
            icon: <WifiOff size={18} className="text-red-600" />,
            bg: "bg-red-50",
            iconColor: "text-red-600",
          },
          {
            label: "Zonas configuradas",
            value: dashboardStats?.admin.zonas_configuradas ?? zonas.length,
            detail: "zonas disponibles",
            icon: <MapPin size={18} className="text-brand-600" />,
            bg: "bg-brand-50",
            iconColor: "text-brand-600",
          },
          {
            label: "Usuarios activos",
            value: usuariosTotal,
            detail:
              dashboardStats?.admin.usuarios_por_rol
                .map((r) => `${r.rol}: ${r.usuarios}`)
                .join(" · ") || "Sin usuarios",
            icon: <Users size={18} className="text-purple-600" />,
            bg: "bg-purple-50",
            iconColor: "text-purple-600",
          },
          {
            label: "EPP configurados",
            value: eppTotal,
            detail: "requerimientos activos",
            icon: <HardHat size={18} className="text-amber-600" />,
            bg: "bg-amber-50",
            iconColor: "text-amber-600",
          },
        ]
      : user?.rol === "supervisor"
        ? [
            {
              label: "Alertas activas",
              value: dashboardStats?.resumen.pendientes ?? 0,
              detail: "pendientes de justificar",
              icon: <AlertTriangle size={18} className="text-danger-600" />,
              bg: "bg-danger-50",
              iconColor: "text-danger-600",
            },
            {
              label: "Camaras en vivo",
              value: dashboardStats?.camaras.activas ?? camarasOnline,
              detail: `${dashboardStats?.camaras.total ?? camaras.length} en alcance`,
              icon: <Camera size={18} className="text-success-600" />,
              bg: "bg-success-50",
              iconColor: "text-success-600",
            },
            {
              label: "Incidentes del turno",
              value: dashboardStats?.resumen.hoy ?? 0,
              detail: "registrados hoy",
              icon: <Activity size={18} className="text-warning-600" />,
              bg: "bg-warning-50",
              iconColor: "text-warning-600",
            },
            {
              label: "Monitoreo en tiempo real",
              value: "Activo",
              detail: `${camarasOnline} camaras online`,
              icon: <Camera size={18} className="text-brand-600" />,
              bg: "bg-brand-50",
              iconColor: "text-brand-600",
            },
            {
              label: "Zonas supervisadas",
              value: zonasSupervisor.length,
              detail:
                zonasSupervisor.join(" · ") ||
                dashboardStats?.mensaje ||
                "Sin asignacion",
              icon: <MapPin size={18} className="text-purple-600" />,
              bg: "bg-purple-50",
              iconColor: "text-purple-600",
            },
          ]
        : [
            {
              label: "Cumplimiento general",
              value: `${dashboardStats?.resumen.cumplimiento_general ?? 100}%`,
              detail: "alertas cerradas vs total",
              icon: <Gauge size={18} className="text-success-600" />,
              bg: "bg-success-50",
              iconColor: "text-success-600",
            },
            {
              label: "Alertas del mes",
              value: dashboardStats?.resumen.mes_actual ?? 0,
              detail: "incidencias registradas",
              icon: <AlertTriangle size={18} className="text-danger-600" />,
              bg: "bg-danger-50",
              iconColor: "text-danger-600",
            },
            {
              label: "Zonas criticas",
              value: dashboardStats?.resumen.zonas_criticas.length ?? 0,
              detail:
                dashboardStats?.resumen.zonas_criticas
                  .map((z) => z.zona)
                  .join(" · ") || "Sin zonas criticas",
              icon: <TrendingUp size={18} className="text-warning-600" />,
              bg: "bg-warning-50",
              iconColor: "text-warning-600",
            },
            {
              label: "Tiempo promedio",
              value: `${dashboardStats?.resumen.tiempo_promedio_resolucion_min ?? 0} min`,
              detail: "desde deteccion hasta cierre",
              icon: <Timer size={18} className="text-brand-600" />,
              bg: "bg-brand-50",
              iconColor: "text-brand-600",
            },
            {
              label: "EPP mas incumplido",
              value: dashboardStats?.resumen.epp_mas_incumplido ?? "Sin datos",
              detail: "periodo seleccionado",
              icon: <HardHat size={18} className="text-warning-600" />,
              bg: "bg-warning-50",
              iconColor: "text-warning-600",
            },
          ];

  return (
    <div>
      <div className="mb-6">
        <div className="text-2xl font-bold text-slate-900 tracking-tight">
          Dashboard
        </div>
        <div className="mt-1 text-sm text-slate-500">
          Monitoreo y estadisticas segun el rol operativo
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        {cards.map((card) => (
          <StatCard
            key={card.label}
            icon={card.icon}
            iconBgClass={card.bg}
            iconColorClass={card.iconColor}
            label={card.label}
            value={card.value}
            subtitle={card.detail}
          />
        ))}
      </div>

      {user && (
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2 flex-wrap">
            <div className="text-lg font-semibold text-slate-900">Estadisticas</div>
            {zonas.length > 0 && user.rol !== "supervisor" && (
              <CustomSelect
                value={zonaSeleccionada ?? ""}
                onChange={(v) => setZonaSeleccionada(v ? Number(v) : null)}
                options={zonas.map((z) => ({
                  value: z.id_zona,
                  label: z.nombre_zona,
                }))}
                placeholder="Todas las zonas"
                className="h-8"
              />
            )}
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {user.rolLabel}
            </span>
          </div>
          <GraficosDashboard rol={user.rol} idZona={zonaSeleccionada} />
        </div>
      )}
    </div>
  );
};
