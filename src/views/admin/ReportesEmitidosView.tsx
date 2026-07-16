import { Eye, FileText, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { CustomTable, type Column } from "../../components/crud/CustomTable";
import { PageHeader } from "../../components/crud/PageHeader";
import { StatusBadge } from "../../components/crud/StatusBadge";
import { Button } from "../../components/ui/Button";
import type { AlertaReporte, ReporteTurnoEmitido } from "../../models/reporte.model";
import { getReportesEmitidos } from "../../services/reporte.service";

const formatearFecha = (iso: string | null): string => {
  if (!iso) return "-";
  const fechaUtc = iso.endsWith("Z") || iso.includes("+") ? iso : `${iso}Z`;
  const fecha = new Date(fechaUtc);
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

export const ReportesEmitidosView = () => {
  const [reportes, setReportes] = useState<ReporteTurnoEmitido[]>([]);
  const [seleccionado, setSeleccionado] = useState<ReporteTurnoEmitido | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarReportes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReportesEmitidos();
      setReportes(data);
      setSeleccionado((actual) => actual ?? data[0] ?? null);
    } catch {
      setError("No se pudieron cargar los reportes emitidos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarReportes();
  }, [cargarReportes]);

  const columnasReportes: Column<ReporteTurnoEmitido>[] = useMemo(
    () => [
      {
        key: "id_reporte",
        header: "Reporte",
        render: (r) => `#${r.id_reporte}`,
      },
      {
        key: "fecha_emision",
        header: "Emitido",
        render: (r) => formatearFecha(r.fecha_emision),
      },
      { key: "emitido_por", header: "Supervisor" },
      {
        key: "periodo",
        header: "Periodo",
        render: (r) =>
          `${formatearFecha(r.resumen.fecha_inicio)} - ${formatearFecha(r.resumen.fecha_fin)}`,
      },
      {
        key: "total_alertas",
        header: "Alertas",
        align: "center",
        render: (r) => r.resumen.total_alertas,
      },
      {
        key: "cumplimiento",
        header: "Cumplimiento",
        align: "center",
        render: (r) => `${r.resumen.cumplimiento}%`,
      },
      {
        key: "acciones",
        header: "Acciones",
        align: "center",
        render: (r) => (
          <Button
            variant={seleccionado?.id_reporte === r.id_reporte ? "primary" : "outline"}
            size="sm"
            icon={<Eye size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              setSeleccionado(r);
            }}
          >
            Ver
          </Button>
        ),
      },
    ],
    [seleccionado?.id_reporte],
  );

  const columnasAlertas: Column<AlertaReporte>[] = [
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
        title="Reportes emitidos"
        subtitle="Reportes de turno enviados por supervisores para revision del jefe"
        action={
          <Button
            variant="outline"
            icon={<RefreshCw size={16} />}
            onClick={cargarReportes}
            loading={loading}
          >
            Actualizar
          </Button>
        }
      />

      <div className="bg-white border border-[#e5e5e5] rounded-lg mb-6">
        <div className="px-5 py-4 border-b border-[#ececec] flex items-center gap-2">
          <FileText size={16} className="text-blue-600" />
          <div className="text-table-title">
            Reportes recibidos{" "}
            <span className="text-table-count">- {reportes.length}</span>
          </div>
        </div>
        {error ? (
          <div className="px-4 py-12 text-center text-sm text-red-600">{error}</div>
        ) : loading ? (
          <div className="px-4 py-12 text-center text-sm text-gray-500">
            Cargando reportes...
          </div>
        ) : (
          <CustomTable
            columns={columnasReportes}
            data={reportes}
            keyExtractor={(r) => r.id_reporte}
            onRowClick={setSeleccionado}
            emptyMessage="Aun no se han emitido reportes para el jefe."
          />
        )}
      </div>

      {seleccionado && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-[#e5e5e5] rounded-lg p-4">
              <div className="text-number-md">{seleccionado.resumen.total_alertas}</div>
              <div className="text-xs text-gray-500">Alertas reportadas</div>
            </div>
            <div className="bg-white border border-[#e5e5e5] rounded-lg p-4">
              <div className="text-number-md">{seleccionado.resumen.pendientes}</div>
              <div className="text-xs text-gray-500">Pendientes</div>
            </div>
            <div className="bg-white border border-[#e5e5e5] rounded-lg p-4">
              <div className="text-number-md">{seleccionado.resumen.cumplimiento}%</div>
              <div className="text-xs text-gray-500">Cumplimiento</div>
            </div>
            <div className="bg-white border border-[#e5e5e5] rounded-lg p-4">
              <div className="text-number-md">{seleccionado.zonas.length}</div>
              <div className="text-xs text-gray-500">Zonas con eventos</div>
            </div>
          </div>

          <div className="bg-white border border-[#e5e5e5] rounded-lg">
            <div className="px-5 py-4 border-b border-[#ececec]">
              <div className="text-table-title">
                Eventos del reporte #{seleccionado.id_reporte}{" "}
                <span className="text-table-count">
                  - {seleccionado.alertas.length}
                </span>
              </div>
            </div>
            <CustomTable
              columns={columnasAlertas}
              data={seleccionado.alertas}
              keyExtractor={(a) => a.id_alerta}
              emptyMessage="Este reporte no contiene alertas."
            />
          </div>
        </>
      )}
    </div>
  );
};
