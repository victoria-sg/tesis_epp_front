import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";

import api from "../../services/api";
import type { DashboardStats } from "../../controllers/useDashboard";

type Rango = "1d" | "7d" | "30d";

const RANGOS: { value: Rango; label: string }[] = [
  { value: "1d", label: "Hoy" },
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
];

const COLORES_ZONA: Record<string, string> = {
  alto: "#ef4444",
  medio: "#f59e0b",
  bajo: "#22c55e",
};

const COLORES_ESTADO: Record<string, string> = {
  Pendiente: "#ef4444",
  Resuelta: "#22c55e",
  Descartada: "#64748b",
};

const ChartCard = ({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) => (
  <div className={`bg-white border border-[#e5e5e5] rounded-lg p-5 ${className}`}>
    <div style={{ fontSize: 13, fontWeight: 600, color: "#000", marginBottom: 16 }}>
      {title}
    </div>
    {children}
  </div>
);

const RangoControl = ({
  rango,
  setRango,
}: {
  rango: Rango;
  setRango: (r: Rango) => void;
}) => (
  <div className="flex gap-1">
    {RANGOS.map((r) => (
      <button
        key={r.value}
        onClick={() => setRango(r.value)}
        className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
          rango === r.value
            ? "bg-blue-600 text-white"
            : "bg-[#f5f5f5] text-[#6b6b6b] hover:bg-[#ececec]"
        }`}
      >
        {r.label}
      </button>
    ))}
  </div>
);

const AdminCharts = ({ stats }: { stats: DashboardStats }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
    <ChartCard title="Usuarios activos por rol">
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={stats.admin.usuarios_por_rol}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="rol" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="usuarios" fill="#7c3aed" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>

    <ChartCard title="EPP configurados por zona">
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={stats.admin.epp_por_zona}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="zona" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="epp_configurados" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  </div>
);

const SupervisorCharts = ({ stats }: { stats: DashboardStats }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
    <ChartCard title="Actividad - ultimas 8 horas">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={stats.alertas_por_hora}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="hora" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="alertas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>

    <ChartCard title="Estado de camaras en alcance">
      <div className="flex items-center justify-center gap-8 h-[200px]">
        <div className="text-center">
          <div style={{ fontSize: 44, fontWeight: 800, color: "#22c55e" }}>
            {stats.camaras.activas}
          </div>
          <div style={{ fontSize: 12, color: "#6b6b6b", marginTop: 4 }}>Online</div>
        </div>
        <div className="w-px h-16 bg-[#e5e5e5]" />
        <div className="text-center">
          <div style={{ fontSize: 44, fontWeight: 800, color: "#ef4444" }}>
            {stats.camaras.desconectadas}
          </div>
          <div style={{ fontSize: 12, color: "#6b6b6b", marginTop: 4 }}>Offline</div>
        </div>
      </div>
    </ChartCard>

    <ChartCard title="Ultimas alertas del turno" className="lg:col-span-2">
      <div className="space-y-2">
        {stats.ultimas_alertas.length === 0 ? (
          <div style={{ fontSize: 13, color: "#6b6b6b", textAlign: "center", padding: "20px 0" }}>
            Sin alertas recientes
          </div>
        ) : (
          stats.ultimas_alertas.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 px-3 py-2 rounded-md bg-[#f9f9f9] border border-[#ececec]"
            >
              {a.estado === "Pendiente" ? (
                <AlertTriangle size={14} className="text-red-500 shrink-0" />
              ) : (
                <CheckCircle size={14} className="text-green-500 shrink-0" />
              )}
              <span style={{ fontSize: 12, fontWeight: 500 }}>Alerta #{a.id}</span>
              <span style={{ fontSize: 11, color: "#6b6b6b" }}>Camara {a.camara}</span>
              <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#ececec] text-[#4a4a4a]">
                {a.estado}
              </span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>
                {a.fecha
                  ? new Date(a.fecha + "Z").toLocaleTimeString("es-EC", {
                      timeZone: "America/Guayaquil",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </span>
            </div>
          ))
        )}
      </div>
    </ChartCard>
  </div>
);

const JefePlantaCharts = ({
  stats,
  rango,
  setRango,
}: {
  stats: DashboardStats;
  rango: Rango;
  setRango: (r: Rango) => void;
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
    <ChartCard title="Tendencia de cumplimiento" className="lg:col-span-2">
      <div className="flex justify-end mb-3">
        <RangoControl rango={rango} setRango={setRango} />
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={stats.alertas_por_dia}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="alertas" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>

    <ChartCard title="Incumplimiento por zona">
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={stats.alertas_por_zona}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="zona" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="alertas" radius={[4, 4, 0, 0]}>
            {stats.alertas_por_zona.map((entry) => (
              <Cell key={entry.id_zona} fill={COLORES_ZONA[entry.nivel_riesgo] ?? "#64748b"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>

    <ChartCard title="Semaforo de cumplimiento por zona">
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={stats.semaforo_zonas}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="zona" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
          <Tooltip />
          <Bar dataKey="cumplimiento" radius={[4, 4, 0, 0]}>
            {stats.semaforo_zonas.map((entry) => (
              <Cell
                key={entry.id_zona}
                fill={entry.cumplimiento >= 80 ? "#22c55e" : entry.cumplimiento >= 60 ? "#f59e0b" : "#ef4444"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>

    <ChartCard title="Distribucion de alertas por estado">
      <div className="flex items-center gap-6">
        <ResponsiveContainer width="50%" height={180}>
          <PieChart>
            <Pie data={stats.alertas_por_estado} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="alertas">
              {stats.alertas_por_estado.map((entry) => (
                <Cell key={entry.estado} fill={COLORES_ESTADO[entry.estado] ?? "#94a3b8"} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-3 flex-1">
          {stats.alertas_por_estado.map((estado) => (
            <div key={estado.estado} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORES_ESTADO[estado.estado] ?? "#94a3b8" }}
              />
              <span style={{ fontSize: 12, color: "#6b6b6b" }}>{estado.estado}</span>
              <span style={{ fontSize: 16, fontWeight: 700, marginLeft: "auto" }}>
                {estado.alertas}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>

    <ChartCard title="EPP mas incumplido">
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={stats.epp_incumplido.slice(0, 6)}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="epp" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="alertas" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>

    <ChartCard title="Horas con mayor incidencia" className="lg:col-span-2">
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={stats.horas_mayor_incidencia}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="hora" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="alertas" fill="#dc2626" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  </div>
);

export const GraficosDashboard = ({
  rol,
  idZona,
}: {
  rol: string;
  idZona?: number | null;
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [rango, setRango] = useState<Rango>("7d");

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number> = { rango };
    if (idZona) params.id_zona = idZona;
    api
      .get<DashboardStats>("/stats/dashboard", { params })
      .then((r) => setStats(r.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [rango, idZona]);

  if (loading) {
    return (
      <div className="mt-4 h-32 flex items-center justify-center text-[#6b6b6b]">
        <span className="animate-pulse text-sm">Cargando estadisticas...</span>
      </div>
    );
  }

  if (!stats) return null;
  if (stats.mensaje) {
    return (
      <div className="mt-4 bg-white border border-[#e5e5e5] rounded-lg p-5 text-sm text-gray-500">
        {stats.mensaje}
      </div>
    );
  }

  if (rol === "admin") return <AdminCharts stats={stats} />;
  if (rol === "supervisor") return <SupervisorCharts stats={stats} />;
  if (rol === "sso") {
    return <JefePlantaCharts stats={stats} rango={rango} setRango={setRango} />;
  }
  return null;
};
