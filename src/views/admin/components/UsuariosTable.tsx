import type { Usuario } from "../../../models/usuario.model";
import type { Column } from "../../../components/crud/CustomTable";
import { CustomTable } from "../../../components/crud/CustomTable";
import { CustomPagination } from "../../../components/crud/CustomPagination";
import { SearchBar } from "../../../components/form/SearchBar";
import { StatusBadge } from "../../../components/crud/StatusBadge";
import { ActionButtons } from "../../../components/crud/ActionButtons";

interface UsuariosTableProps {
  items: Usuario[];
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
  onEdit: (usuario: Usuario) => void;
  onDelete: (id: number) => void;
}

export const UsuariosTable = ({
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
}: UsuariosTableProps) => {
  const columns: Column<Usuario>[] = [
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
      key: "nombre",
      header: "Nombre",
      render: (u) => (
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-full bg-linear-to-br from-[#8b5cf6] to-[#7c3aed] text-white flex items-center justify-center shadow-md shadow-purple-500/30 text-xs font-bold"
          >
            {u.nombre[0]}
            {u.apelido[0]}
          </div>
          <div className="font-medium">
            {u.nombre} {u.apelido}
          </div>
        </div>
      ),
    },
    { key: "correo", header: "Correo" },
    { key: "cedula", header: "Cédula", render: (u) => u.cedula ?? "—" },
    { key: "rol_nombre", header: "Rol", render: (u) => u.rol_nombre ?? "—" },
    {
      key: "estado",
      header: "Estado",
      align: "center",
      render: () => <StatusBadge estado="activo" />,
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "center",
      width: "100px",
      render: (u) => (
        <ActionButtons
          onEdit={puedeEditar ? () => onEdit(u) : undefined}
          onDelete={puedeEliminar ? () => onDelete(u.id_usuario) : undefined}
        />
      ),
    },
  ];

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-lg">
      <div className="px-5 py-4 border-b border-[#ececec] flex items-center justify-between gap-4">
        <div className="text-table-title">
          Usuarios{" "}
          <span className="text-table-count">
            · {items.length}
          </span>
        </div>
        <SearchBar
          value={query}
          onChange={onSearch}
          placeholder="Buscar usuario…"
        />
      </div>

      <CustomTable
        columns={columns}
        data={items}
        keyExtractor={(u) => u.id_usuario}
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
