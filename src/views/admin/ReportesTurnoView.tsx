import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Printer,
  Send,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { StatCard } from "../../components/ui/Card";
import { CustomTable, type Column } from "../../components/crud/CustomTable";
import { PageHeader } from "../../components/crud/PageHeader";
import { StatusBadge } from "../../components/crud/StatusBadge";
import { Button } from "../../components/ui/Button";
import {
  PERM_REPORTES_TURNO_EXPORTAR,
} from "../../constants/permissionsConstants";
import type { AlertaReporte, ReporteTurno } from "../../models/reporte.model";
import { emitirReporteTurno, getReporteTurno } from "../../services/reporte.service";
import type { RootState } from "../../store";

const toDatetimeLocal = (date: Date): string => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatearFecha = (iso: string | null): string => {
  if (!iso) return "-";
  const fecha = new Date(iso.endsWith("Z") ? iso : `${iso}Z`);
  if (Number.isNaN(fecha.getTime())) return "-";
  return fecha.toLocaleString("es-EC", {
    timeZone: "America/Guayaquil",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const csvCell = (value: string | number | null | undefined): string =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

export const ReportesTurnoView = () => {
  const now = useMemo(() => new Date(), []);
  const defaultInicio = useMemo(
    () => new Date(now.getTime() - 8 * 60 * 60 * 1000),
    [now],
  );
  const [fechaInicio, setFechaInicio] = useState(toDatetimeLocal(defaultInicio));
  const [fechaFin, setFechaFin] = useState(toDatetimeLocal(now));
  const [reporte, setReporte] = useState<ReporteTurno | null>(null);
  const [loading, setLoading] = useState(true);
  const [emitiendo, setEmitiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const puedeExportar =
    user?.permisos.includes(PERM_REPORTES_TURNO_EXPORTAR) ?? false;

  const cargarReporte = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMensaje(null);
    try {
      const data = await getReporteTurno({
        fecha_inicio: new Date(fechaInicio).toISOString(),
        fecha_fin: new Date(fechaFin).toISOString(),
      });
      setReporte(data);
    } catch {
      setError("No se pudo generar el reporte de turno.");
      setReporte(null);
    } finally {
      setLoading(false);
    }
  }, [fechaInicio, fechaFin]);

  useEffect(() => {
    cargarReporte();
  }, [cargarReporte]);

  const exportarCsv = () => {
    if (!reporte) return;
    const rows = [
      [
        "Fecha",
        "Zona",
        "Camara",
        "Estado",
        "Infraccion",
        "Justificacion",
        "Resuelto por",
      ],
      ...reporte.alertas.map((alerta) => [
        alerta.fecha_hora_deteccion,
        alerta.nombre_zona,
        alerta.codigo_camara,
        alerta.estado_alerta,
        alerta.detalle_infraccion,
        alerta.comentario_resolucion,
        alerta.resuelto_por,
      ]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte-turno-${fechaInicio.slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const emitirParaJefe = async () => {
    setEmitiendo(true);
    setError(null);
    setMensaje(null);
    try {
      const emitido = await emitirReporteTurno({
        fecha_inicio: new Date(fechaInicio).toISOString(),
        fecha_fin: new Date(fechaFin).toISOString(),
      });
      setReporte(emitido);
      setMensaje(`Reporte #${emitido.id_reporte} emitido para el jefe.`);
    } catch {
      setError("No se pudo emitir el reporte para el jefe.");
    } finally {
      setEmitiendo(false);
    }
  };

  const columns: Column<AlertaReporte>[] = [
    {
      key: "fecha_hora_deteccion",
      header: "Fecha",
      render: (a) => formatearFecha(a.fecha_hora_deteccion),
    },
    { key: "nombre_zona", header: "Zona" },
    { key: "codigo_camara", header: "Camara" },
    {
      key: "detalle_infraccion",
      header: "Evento",
      render: (a) => a.detalle_infraccion || "Alerta registrada",
    },
    {
      key: "estado_alerta",
      header: "Estado",
      render: (a) =>
        a.estado_alerta ? <StatusBadge estado={a.estado_alerta} /> : "-",
    },
    {
      key: "comentario_resolucion",
      header: "Justificacion",
      render: (a) => a.comentario_resolucion || "Sin justificar",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Reportes de turno"
        subtitle="Genera el documento operativo del turno y emite una copia para el jefe"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              icon={<Printer size={16} />}
              onClick={() => window.print()}
            >
              Imprimir
            </Button>
            {puedeExportar && (
              <Button
                variant="secondary"
                icon={<Download size={16} />}
                onClick={exportarCsv}
                disabled={!reporte || reporte.alertas.length === 0}
              >
                Exportar CSV
              </Button>
            )}
            <Button
              variant="success"
              icon={<Send size={16} />}
              onClick={emitirParaJefe}
              loading={emitiendo}
              disabled={!reporte}
            >
              Emitir para jefe
            </Button>
          </div>
        }
      />

      <div className="bg-white border border-slate-200 rounded-md p-4 mb-6 flex flex-wrap items-end gap-3">
        <label className="text-xs font-semibold text-gray-600">
          Inicio
          <input
            type="datetime-local"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="mt-1 h-9 rounded-md border border-slate-300 px-3 text-sm text-black outline-none focus:border-brand-500"
          />
        </label>
        <label className="text-xs font-semibold text-gray-600">
          Fin
          <input
            type="datetime-local"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="mt-1 h-9 rounded-md border border-slate-300 px-3 text-sm text-black outline-none focus:border-brand-500"
          />
        </label>
        <Button onClick={cargarReporte} loading={loading}>
          Generar reporte
        </Button>
      </div>

      {mensaje && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-6 text-sm text-green-700">
          {mensaje}
        </div>
      )}

      {error ? (
        <div className="bg-white border border-red-200 rounded-lg p-8 text-center text-sm text-red-600">
          {error}
        </div>
      ) : reporte ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              horizontal
              icon={<FileText size={18} className="text-brand-600" />}
              iconBgClass="bg-brand-50"
              iconColorClass="text-brand-600"
              label="Alertas del turno"
              value={reporte.resumen.total_alertas}
            />
            <StatCard
              horizontal
              icon={<Clock size={18} className="text-danger-500" />}
              iconBgClass="bg-danger-50"
              iconColorClass="text-danger-500"
              label="Pendientes"
              value={reporte.resumen.pendientes}
            />
            <StatCard
              horizontal
              icon={<CheckCircle size={18} className="text-success-600" />}
              iconBgClass="bg-success-50"
              iconColorClass="text-success-600"
              label="Cumplimiento"
              value={`${reporte.resumen.cumplimiento}%`}
            />
            <StatCard
              horizontal
              icon={<AlertTriangle size={18} className="text-warning-600" />}
              iconBgClass="bg-warning-50"
              iconColorClass="text-warning-600"
              label="Zonas con eventos"
              value={reporte.zonas.length}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-4">
            <div className="bg-white border border-slate-200 rounded-md p-5">
              <div className="text-base font-semibold text-slate-900 mb-3">Resumen por zona</div>
              <div className="space-y-2">
                {reporte.zonas.length === 0 ? (
                  <div className="text-sm text-gray-500">Sin eventos por zona.</div>
                ) : (
                  reporte.zonas.map((zona) => (
                    <div
                      key={zona.zona}
                      className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2"
                    >
                      <span className="text-sm text-black truncate">{zona.zona}</span>
                      <span className="text-xs font-bold text-blue-700">
                        {zona.alertas}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-md">
              <div className="px-5 py-4 border-b border-slate-200">
                <div className="text-base font-semibold text-slate-900">
                  Eventos del turno{" "}
                  <span className="text-sm text-slate-500 font-normal">
                    · {reporte.alertas.length}
                  </span>
                </div>
              </div>
              <CustomTable
                columns={columns}
                data={reporte.alertas}
                keyExtractor={(a) => a.id_alerta}
                emptyMessage="No se registraron alertas en este turno."
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
