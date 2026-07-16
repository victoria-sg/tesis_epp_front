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
            icon: <Camera size={16} className="text-green-600" />,
            bg: "bg-green-50",
          },
          {
            label: "Camaras desconectadas",
            value: dashboardStats?.camaras.desconectadas ?? 0,
            detail: `${dashboardStats?.camaras.total ?? camaras.length} camaras totales`,
            icon: <WifiOff size={16} className="text-red-600" />,
            bg: "bg-red-50",
          },
          {
            label: "Zonas configuradas",
            value: dashboardStats?.admin.zonas_configuradas ?? zonas.length,
            detail: "zonas disponibles",
            icon: <MapPin size={16} className="text-blue-600" />,
            bg: "bg-blue-50",
          },
          {
            label: "Usuarios activos por rol",
            value: usuariosTotal,
            detail:
              dashboardStats?.admin.usuarios_por_rol
                .map((r) => `${r.rol}: ${r.usuarios}`)
                .join(" · ") || "Sin usuarios",
            icon: <Users size={16} className="text-violet-600" />,
            bg: "bg-violet-50",
          },
          {
            label: "EPP configurados por zona",
            value: eppTotal,
            detail: "requerimientos activos",
            icon: <HardHat size={16} className="text-amber-600" />,
            bg: "bg-amber-50",
          },
        ]
      : user?.rol === "supervisor"
        ? [
            {
              label: "Alertas activas",
              value: dashboardStats?.resumen.pendientes ?? 0,
              detail: "pendientes de justificar",
              icon: <AlertTriangle size={16} className="text-red-600" />,
              bg: "bg-red-50",
            },
            {
              label: "Camaras en vivo",
              value: dashboardStats?.camaras.activas ?? camarasOnline,
              detail: `${dashboardStats?.camaras.total ?? camaras.length} en alcance`,
              icon: <Camera size={16} className="text-green-600" />,
              bg: "bg-green-50",
            },
            {
              label: "Incidentes del turno",
              value: dashboardStats?.resumen.hoy ?? 0,
              detail: "registrados hoy",
              icon: <Activity size={16} className="text-orange-600" />,
              bg: "bg-orange-50",
            },
            {
              label: "Monitoreo en tiempo real",
              value: "Activo",
              detail: `${camarasOnline} camaras online`,
              icon: <Camera size={16} className="text-blue-600" />,
              bg: "bg-blue-50",
            },
            {
              label: "Zonas supervisadas",
              value: zonasSupervisor.length,
              detail:
                zonasSupervisor.join(" · ") ||
                dashboardStats?.mensaje ||
                "Sin asignacion",
              icon: <MapPin size={16} className="text-violet-600" />,
              bg: "bg-violet-50",
            },
          ]
        : [
            {
              label: "Cumplimiento general",
              value: `${dashboardStats?.resumen.cumplimiento_general ?? 100}%`,
              detail: "alertas cerradas vs total",
              icon: <Gauge size={16} className="text-green-600" />,
              bg: "bg-green-50",
            },
            {
              label: "Alertas del mes",
              value: dashboardStats?.resumen.mes_actual ?? 0,
              detail: "incidencias registradas",
              icon: <AlertTriangle size={16} className="text-red-600" />,
              bg: "bg-red-50",
            },
            {
              label: "Zonas criticas",
              value: dashboardStats?.resumen.zonas_criticas.length ?? 0,
              detail:
                dashboardStats?.resumen.zonas_criticas
                  .map((z) => z.zona)
                  .join(" · ") || "Sin zonas criticas",
              icon: <TrendingUp size={16} className="text-orange-600" />,
              bg: "bg-orange-50",
            },
            {
              label: "Tiempo promedio resolucion",
              value: `${dashboardStats?.resumen.tiempo_promedio_resolucion_min ?? 0} min`,
              detail: "desde deteccion hasta cierre",
              icon: <Timer size={16} className="text-blue-600" />,
              bg: "bg-blue-50",
            },
            {
              label: "EPP mas incumplido",
              value: dashboardStats?.resumen.epp_mas_incumplido ?? "Sin datos",
              detail: "periodo seleccionado",
              icon: <HardHat size={16} className="text-amber-600" />,
              bg: "bg-amber-50",
            },
          ];

  return (
    <div>
      <div className="mb-6">
        <div className="text-2xl font-bold text-black tracking-[-0.01em]">
          Dashboard
        </div>
        <div className="text-subtitle mt-1">
          Monitoreo y estadisticas segun el rol operativo
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-[#e5e5e5] rounded-lg p-5"
          >
            <div className="flex items-center justify-between mb-3 gap-3">
              <span className="text-label">{card.label}</span>
              <div
                className={`h-8 w-8 rounded-md ${card.bg} flex items-center justify-center shrink-0`}
              >
                {card.icon}
              </div>
            </div>
            <div className="text-number break-words">{card.value}</div>
            <div className="mt-1 text-small line-clamp-2">{card.detail}</div>
          </div>
        ))}
      </div>

      {user && (
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2 flex-wrap">
            <div className="text-section-title">Estadisticas</div>
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
            <span className="text-xs-muted bg-[#f5f5f5] px-2 py-0.5 rounded-full">
              {user.rolLabel}
            </span>
          </div>
          <GraficosDashboard rol={user.rol} idZona={zonaSeleccionada} />
        </div>
      )}
    </div>
  );
};
