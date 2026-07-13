import { SearchBar } from "../../../components/form/SearchBar";
import { CustomTable, type Column } from "../../../components/crud/CustomTable";
import { CustomPagination } from "../../../components/crud/CustomPagination";
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
      header: "Nombre del EPP",
      render: (t) => <span className="font-medium">{t.nombre_epp}</span>,
    },
    {
      key: "descripcion",
      header: "Descripción",
      render: (t) => t.descripcion ?? "—",
    },
  ];

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-lg">
      <div className="px-5 py-4 border-b border-[#ececec] flex items-center justify-between gap-4">
        <div className="text-table-title">
          Tipos de EPP{" "}
          <span className="text-table-count">· {total}</span>
        </div>
        <SearchBar
          value={query}
          onChange={onSearch}
          placeholder="Buscar tipo de EPP…"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
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
