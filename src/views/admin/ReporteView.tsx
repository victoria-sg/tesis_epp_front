import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  FileWarning,
  Filter,
} from "lucide-react";
import { useState } from "react";
import { ModalPrevisualizacion } from "../../components/admin/ModalPrevisualizacion";
import { ModalResolverAlerta } from "../../components/admin/ModalResolverAlerta";
import { useSelector } from "react-redux";
import { Button } from "../../components/ui/Button";
import { CustomTable, type Column } from "../../components/crud/CustomTable";
import { PageHeader } from "../../components/crud/PageHeader";
import { CustomSelect } from "../../components/form/CustomSelect";
import { SearchBar } from "../../components/form/SearchBar";
import { StatusBadge } from "../../components/crud/StatusBadge";
import { useReportes } from "../../controllers/useReportes";
import { PERM_ALERTAS_VER, PERM_ALERTAS_JUSTIFICAR, PERM_REPORTES_EXPORTAR } from "../../constants/permissionsConstants";
import type { AlertaReporte } from "../../models/reporte.model";
import type { RootState } from "../../store";

const formatearFecha = (iso: string | null): string => {
  if (!iso) return "—";
  const fechaUtc = iso.endsWith("Z") || iso.includes("+") ? iso : iso + "Z";
  const fecha = new Date(fechaUtc);
  if (Number.isNaN(fecha.getTime())) return "—";
  return fecha.toLocaleString("es-EC", {
    timeZone: "America/Guayaquil",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatearDuracion = (segundos: number | null): string => {
  if (segundos === null) return "—";
  if (segundos < 60) return `${segundos} s`;
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return `${minutos} min ${resto} s`;
};

export const ReportesView = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const puedeVerAlertas = user?.permisos.includes(PERM_ALERTAS_VER) ?? false;
  const puedeJustificar = user?.permisos.includes(PERM_ALERTAS_JUSTIFICAR) ?? false;
  const puedeResolver = puedeVerAlertas && puedeJustificar;
  const puedeExportar = user?.permisos.includes(PERM_REPORTES_EXPORTAR) ?? false;
  const {
    data,
    totalSinFiltrar,
    loading,
    error,
    query,
    setQuery,
    filtroZona,
    setFiltroZona,
    filtroEstado,
    setFiltroEstado,
    filtroCamara,
    setFiltroCamara,
    zonas,
    camaras,
    exportarCsv,
    stats,
    alertaResolviendo,
    comentario,
    setComentario,
    resolviendoLoading,
    resolviendoError,
    abrirModalResolucion,
    cerrarModalResolucion,
    resolverAlerta,
  } = useReportes();

  const [imagenExpandida, setImagenExpandida] = useState<string | null>(null);

  const columns: Column<AlertaReporte>[] = [
    {
      key: "captura_frame",
      header: "Captura",
      width: "80px",
      render: (a) =>
        a.captura_frame ? (
          <img
            src={a.captura_frame}
            alt="Captura"
            onClick={() => setImagenExpandida(a.captura_frame)}
            className="w-14 h-10 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity border border-[#e5e5e5]"
          />
        ) : (
          <span className="text-gray-300 text-xs">Sin captura</span>
        ),
    },
    {
      key: "fecha_hora_deteccion",
      header: "Fecha",
      render: (a) => formatearFecha(a.fecha_hora_deteccion),
    },
    { key: "nombre_zona", header: "Zona" },
    { key: "codigo_camara", header: "Cámara" },
    {
      key: "segundos_transcurridos",
      header: "Duración",
      render: (a) => formatearDuracion(a.segundos_transcurridos),
    },
    {
      key: "detalle_infraccion",
      header: "Infracción",
      render: (a) =>
        a.detalle_infraccion ? (
          <span className="text-xs text-red-600 font-medium">
            {a.detalle_infraccion}
          </span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },
    {
      key: "estado_alerta",
      header: "Estado",
      render: (a) =>
        a.estado_alerta ? <StatusBadge estado={a.estado_alerta} /> : "—",
    },
    {
      key: "comentario_resolucion",
      header: "Justificación",
      render: (a) =>
        a.comentario_resolucion ? (
          <span className="text-xs">{a.comentario_resolucion}</span>
        ) : (
          <span className="text-gray-400 text-xs">Sin atender</span>
        ),
    },
    {
      key: "resuelto_por",
      header: "Resuelto por",
      render: (a) => a.resuelto_por ?? "—",
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "center",
      width: "100px",
      render: (a) =>
        a.estado_alerta === "Pendiente" && puedeResolver ? (
          <Button variant="secondary" size="sm" onClick={() => abrirModalResolucion(a)}>
            Resolver
          </Button>
        ) : a.estado_alerta === "Resuelta" ? (
          <span
            className="flex items-center justify-center gap-1 text-green-600 text-[11px]"
          >
            <CheckCircle size={12} /> Resuelta
          </span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Reportes de Alertas"
        subtitle="Historial de alertas detectadas, su estado y justificación"
        action={
          puedeExportar ? (
            <Button variant="secondary" icon={<Download size={16} />} onClick={exportarCsv} disabled={data.length === 0}>
              Exportar CSV
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-[#e5e5e5] rounded-lg p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <AlertTriangle size={18} className="text-blue-600" />
          </div>
          <div>
            <div className="text-number-md">
              {stats.total}
            </div>
            <div className="text-xs text-gray-500">Total alertas</div>
          </div>
        </div>
        <div className="bg-white border border-[#e5e5e5] rounded-lg p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
            <Clock size={18} className="text-red-500" />
          </div>
          <div>
            <div className="text-number-md">
              {stats.pendientes}
            </div>
            <div className="text-xs text-gray-500">Pendientes</div>
          </div>
        </div>
        <div className="bg-white border border-[#e5e5e5] rounded-lg p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
            <CheckCircle size={18} className="text-green-600" />
          </div>
          <div>
            <div className="text-number-md">
              {stats.resueltas}
            </div>
            <div className="text-xs text-gray-500">Resueltas</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#e5e5e5] rounded-lg">
        <div className="px-5 py-4 border-b border-[#ececec] flex items-center justify-between gap-4 flex-wrap">
          <div className="text-table-title">
            Alertas{" "}
            <span className="text-table-count">
              · {data.length}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-[#6b6b6b]" />
            <CustomSelect
              value={filtroZona}
              onChange={(v) => setFiltroZona(String(v))}
              options={zonas.map((z) => ({ value: z, label: z }))}
              placeholder="Todas las zonas"
              size="sm"
            />
            <CustomSelect
              value={filtroCamara}
              onChange={(v) => setFiltroCamara(String(v))}
              options={camaras.map((c) => ({ value: c, label: c }))}
              placeholder="Todas las cámaras"
              size="sm"
            />
            <CustomSelect
              value={filtroEstado}
              onChange={(v) => setFiltroEstado(String(v))}
              options={[
                { value: "Pendiente", label: "Pendiente" },
                { value: "Resuelta", label: "Resuelta" },
              ]}
              placeholder="Todos los estados"
              size="sm"
            />
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Buscar…"
            />
          </div>
        </div>

        {loading ? (
          <div
            className="px-4 py-16 text-center text-sm text-gray-500"
          >
            Cargando reporte…
          </div>
        ) : error ? (
          <div className="px-4 py-16 flex flex-col items-center gap-2 text-center">
            <FileWarning className="h-8 w-8 text-red-500" />
            <div className="text-sm text-red-600">{error}</div>
          </div>
        ) : (
          <CustomTable
            columns={columns}
            data={data}
            keyExtractor={(a) => a.id_alerta}
            emptyMessage={
              totalSinFiltrar === 0
                ? "Aún no se han registrado alertas en el sistema."
                : "Ninguna alerta coincide con tu búsqueda."
            }
          />
        )}
      </div>

      {alertaResolviendo && (
        <ModalResolverAlerta
          alerta={alertaResolviendo}
          comentario={comentario}
          onComentarioChange={setComentario}
          loading={resolviendoLoading}
          error={resolviendoError}
          onResolve={resolverAlerta}
          onClose={cerrarModalResolucion}
        />
      )}

      {imagenExpandida && (
        <ModalPrevisualizacion
          src={imagenExpandida}
          onClose={() => setImagenExpandida(null)}
        />
      )}
    </div>
  );
};
