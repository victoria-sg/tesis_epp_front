import { Check, Shirt, ShieldAlert, AlertTriangle, Shield } from "lucide-react";

import { ActionButtons } from "../../../components/crud/ActionButtons";
import { CustomPagination } from "../../../components/crud/CustomPagination";
import { CustomTable } from "../../../components/crud/CustomTable";
import { SearchBar } from "../../../components/form/SearchBar";
import { NIVEL_RIESGO_CONFIG } from "../../../models/zona.model";

import type { Column } from "../../../components/crud/CustomTable";
import type { TipoEPP } from "../../../models/tipo.model";
import type { Zona } from "../../../models/zona.model";

interface ZonasTableProps {
  items: Zona[];
  page: number;
  totalPages: number;
  total: number;
  query: string;
  pageSize: number;
  startIndex: number;
  onSearch: (q: string) => void;
  onPageChange: (p: number) => void;
  puedeEditar: boolean;
  puedeEliminar: boolean;
  onEdit: (zona: Zona) => void;
  onDelete: (id: number) => void;
  tiposEpp: TipoEPP[];
  onCalibrarEpp: (idZona: number, idTipoEpp: number) => void;
}

const NivelRiesgoBadge = ({ nivel }: { nivel: string | null | undefined }) => {
  if (!nivel) return <span className="text-muted">—</span>;
  const key = nivel.toLowerCase() as keyof typeof NIVEL_RIESGO_CONFIG;
  const config = NIVEL_RIESGO_CONFIG[key] ?? NIVEL_RIESGO_CONFIG.bajo;
  const Icon =
    key === "alto" ? ShieldAlert : key === "medio" ? AlertTriangle : Shield;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.badge}`}
    >
      <Icon size={11} />
      {config.label}
    </span>
  );
};

export const ZonasTable = ({
  items,
  page,
  totalPages,
  total,
  query,
  pageSize,
  startIndex,
  onSearch,
  onPageChange,
  puedeEditar,
  puedeEliminar,
  onEdit,
  onDelete,
  tiposEpp,
  onCalibrarEpp,
}: ZonasTableProps) => {
  const columns: Column<Zona>[] = [
    {
      key: "index",
      header: "#",
      width: "60px",
      align: "center",
      render: (_, i) => (
        <span className="text-gray-500 tabular-nums">{i + 1}</span>
      ),
    },
    {
      key: "nombre_zona",
      header: "Nombre",
      render: (z) => {
        const nivel = z.nivel_riesgo?.toLowerCase() as
          | keyof typeof NIVEL_RIESGO_CONFIG
          | undefined;
        const config = nivel ? NIVEL_RIESGO_CONFIG[nivel] : null;
        return (
          <div className="flex items-center gap-2">
            {config && (
              <div
                className="w-1.5 h-8 rounded-full shrink-0"
                style={{ background: config.color }}
              />
            )}
            <span className="font-medium">{z.nombre_zona}</span>
          </div>
        );
      },
    },
    {
      key: "nivel_riesgo",
      header: "Nivel de Riesgo",
      align: "center",
      render: (z) => <NivelRiesgoBadge nivel={z.nivel_riesgo} />,
    },
    {
      key: "epp",
      header: "EPP Requeridos",
      render: (z) => {
        const epps = z.epps?.length
          ? z.epps
          : (z.epp_ids ?? [])
              .map((id) => {
                const tipo = tiposEpp.find((t) => t.id_tipo_epp === id);
                return tipo
                  ? {
                      id_tipo_epp: tipo.id_tipo_epp,
                      nombre_epp: tipo.nombre_epp,
                      estado_calibracion: "validado" as const,
                    }
                  : null;
              })
              .filter((item): item is NonNullable<typeof item> => Boolean(item));
        if (epps.length === 0) return <span className="text-muted">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {epps.map((epp) => (
              <span
                key={epp.id_tipo_epp}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border font-medium ${
                  epp.estado_calibracion === "pendiente"
                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                <Shirt size={11} />
                {epp.nombre_epp}
                {epp.estado_calibracion === "pendiente" && " · pendiente"}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "center",
      width: "130px",
      render: (z) => (
        <div className="flex items-center justify-center gap-1">
          {puedeEditar && z.epps?.some((e) => e.estado_calibracion === "pendiente") && (
            <button
              className="h-8 w-8 rounded-md border border-slate-300 hover:border-success-500 hover:bg-success-50 flex items-center justify-center"
              title="Validar calibración pendiente"
              onClick={(e) => {
                e.stopPropagation();
                const pending = z.epps?.find(
                  (item) => item.estado_calibracion === "pendiente",
                );
                if (pending) onCalibrarEpp(z.id_zona, pending.id_tipo_epp);
              }}
            >
              <Check size={13} className="text-success-500" />
            </button>
          )}
          <ActionButtons
            onEdit={puedeEditar ? () => onEdit(z) : undefined}
            onDelete={puedeEliminar ? () => onDelete(z.id_zona) : undefined}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-md">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
        <div className="text-base font-semibold text-slate-900">
          Zonas <span className="text-sm text-slate-500 font-normal">· {total}</span>
        </div>
        <SearchBar
          value={query}
          onChange={onSearch}
          placeholder="Buscar zona…"
        />
      </div>
      <CustomTable
        columns={columns}
        data={items}
        keyExtractor={(z) => z.id_zona}
        startIndex={startIndex}
      />
      <CustomPagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
};
