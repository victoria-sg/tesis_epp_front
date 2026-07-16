import { Pencil, Shirt } from "lucide-react";

import { CustomPagination } from "../../../components/crud/CustomPagination";
import { CustomTable, type Column } from "../../../components/crud/CustomTable";
import { SearchBar } from "../../../components/form/SearchBar";
import type { TipoEPP } from "../../../models/tipo.model";

interface TiposEPPTableProps {
  items: TipoEPP[];
  page: number;
  totalPages: number;
  total: number;
  query: string;
  pageSize: number;
  startIndex: number;
  onSearch: (q: string) => void;
  onPageChange: (p: number) => void;
  loading: boolean;
  puedeEditar: boolean;
  onEdit: (tipo: TipoEPP) => void;
}

export const TiposEPPTable = ({
  items,
  page,
  totalPages,
  total,
  query,
  pageSize,
  startIndex,
  onSearch,
  onPageChange,
  loading,
  puedeEditar,
  onEdit,
}: TiposEPPTableProps) => {
  const columns: Column<TipoEPP>[] = [
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
      key: "nombre_epp",
      header: "Etiqueta visible",
      render: (t) => (
        <span className="inline-flex items-center gap-2 font-medium">
          <Shirt size={14} />
          {t.nombre_epp}
        </span>
      ),
    },
    {
      key: "clase_yolo",
      header: "Clases",
      render: (t) => (
        <div className="flex flex-wrap gap-1">
          <span className="rounded-md bg-emerald-50 px-2 py-1 font-mono text-xs text-emerald-700">
            {t.clase_positiva ?? t.clase_yolo}
          </span>
          {t.clase_negativa && (
            <span className="rounded-md bg-red-50 px-2 py-1 font-mono text-xs text-red-700">
              {t.clase_negativa}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      render: (t) => (
        <div className="flex flex-wrap gap-1 text-xs">
          <span className={`rounded-md px-2 py-1 ${t.activo ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
            {t.activo ? "Activo" : "Inactivo"}
          </span>
          {t.usar_modelo_principal && (
            <span className="rounded-md bg-gray-100 px-2 py-1 text-gray-700">
              Modelo grande
            </span>
          )}
          {t.usar_modelo_personalizado && (
            <span className="rounded-md bg-violet-50 px-2 py-1 text-violet-700">
              Especializado
            </span>
          )}
        </div>
      ),
    },
    {
      key: "modo_alerta",
      header: "Alerta",
      render: (t) => t.modo_alerta.replaceAll("_", " "),
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "center",
      width: "90px",
      render: (t) =>
        puedeEditar ? (
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d4d4d4] hover:border-[#2563eb] hover:bg-blue-50"
            title="Editar EPP"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(t);
            }}
          >
            <Pencil size={13} className="text-[#2563eb]" />
          </button>
        ) : null,
    },
  ];

  return (
    <div className="rounded-lg border border-[#e5e5e5] bg-white">
      <div className="flex items-center justify-between gap-4 border-b border-[#ececec] px-5 py-4">
        <div>
          <div className="text-table-title">
            Tipos de EPP <span className="text-table-count">· {total}</span>
          </div>
          <div className="mt-1 text-[11px] text-gray-500">
            Persona siempre viene del modelo grande; cada EPP decide sus clases y modelos.
          </div>
        </div>
        <SearchBar
          value={query}
          onChange={onSearch}
          placeholder="Buscar tipo de EPP..."
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-gray-500">
          <span className="animate-pulse text-sm">Cargando...</span>
        </div>
      ) : (
        <CustomTable
          columns={columns}
          data={items}
          keyExtractor={(t) => t.id_tipo_epp}
          startIndex={startIndex}
        />
      )}

      {!loading && (
        <CustomPagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};
