import { ActionButtons } from "../../../components/crud/ActionButtons";
import { CustomPagination } from "../../../components/crud/CustomPagination";
import { CustomTable, type Column } from "../../../components/crud/CustomTable";
import { SearchBar } from "../../../components/form/SearchBar";
import type { Rol } from "../../../models/rol.model";

interface RolesTableProps {
  items: Rol[];
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
  onEdit: (rol: Rol) => void;
  onDelete: (id: number) => void;
}

export const RolesTable = ({
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
}: RolesTableProps) => {
  const columns: Column<Rol>[] = [
    {
      key: "index",
      header: "#",
      width: "60px",
      align: "center",
      render: (_, i) => (
        <span className="text-gray-500 tabular-nums">
          {startIndex + i + 1}
        </span>
      ),
    },
    {
      key: "nombre_rol",
      header: "Nombre del Rol",
      render: (r) => <span className="font-medium">{r.nombre_rol}</span>,
    },
    {
      key: "descripcion",
      header: "Descripción",
      render: (r) => r.descripcion ?? "—",
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "center",
      width: "100px",
      render: (r) => (
        <ActionButtons
          onEdit={puedeEditar ? () => onEdit(r) : undefined}
          onDelete={puedeEliminar ? () => onDelete(r.id_rol) : undefined}
        />
      ),
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-md">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
        <div className="text-base font-semibold text-slate-900">
          Roles{" "}
          <span className="text-sm text-slate-500 font-normal">
            · {total}
          </span>
        </div>
        <SearchBar
          value={query}
          onChange={onSearch}
          placeholder="Buscar rol…"
        />
      </div>

      <CustomTable
        columns={columns}
        data={items}
        keyExtractor={(r) => r.id_rol}
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
