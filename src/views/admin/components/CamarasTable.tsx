import { Smartphone } from "lucide-react";

import { ActionButtons } from "../../../components/crud/ActionButtons";
import { CustomPagination } from "../../../components/crud/CustomPagination";
import { CustomTable } from "../../../components/crud/CustomTable";
import { SearchBar } from "../../../components/form/SearchBar";
import { StatusBadge } from "../../../components/crud/StatusBadge";
import type { Column } from "../../../components/crud/CustomTable";
import type { Camara } from "../../../models/camara.model";

interface CamarasTableProps {
  items: Camara[];
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
  onEdit: (camara: Camara) => void;
  onDelete: (id: number) => void;
  onQrClick: (camara: Camara) => void;
}

export const CamarasTable = ({
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
  onQrClick,
}: CamarasTableProps) => {
  const columns: Column<Camara>[] = [
    {
      key: "index",
      header: "#",
      width: "60px",
      align: "center",
      render: (_, i) => (
        <span className="text-gray-500 tabular-nums">
          {(page - 1) * pageSize + i + 1}
        </span>
      ),
    },
    {
      key: "codigo_camara",
      header: "Código",
      render: (c) => <span className="font-medium">{c.codigo_camara}</span>,
    },
    { key: "zona_nombre", header: "Zona", render: (c) => c.zona_nombre ?? "—" },
    {
      key: "tipo_fuente",
      header: "Tipo",
      render: (c) =>
        c.tipo_fuente === "fallback_phone" ? (
          <span className="flex items-center gap-1 text-blue-600 text-xs">
            <Smartphone size={12} /> Teléfono
          </span>
        ) : (
          <span className="text-xs text-gray-500">
            {c.tipo_fuente === "hikvision"
              ? "Hikvision"
              : c.tipo_fuente === "ezviz"
                ? "EZVIZ"
                : "RTSP"}
          </span>
        ),
    },
    {
      key: "ip_direccion",
      header: "Dirección IP",
      render: (c) =>
        c.tipo_fuente === "fallback_phone" ? (
          <span className="text-muted text-xs">Virtual</span>
        ) : (
          (c.ip_direccion ?? "—")
        ),
    },
    {
      key: "puerto",
      header: "Puerto",
      width: "80px",
      render: (c) =>
        c.puerto ? (
          <span className="tabular-nums">{c.puerto}</span>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      key: "estado_conexion",
      header: "Estado",
      align: "center",
      render: (c) =>
        c.estado_conexion ? (
          <StatusBadge estado={c.estado_conexion} />
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "center",
      width: "130px",
      render: (c) => (
        <div className="flex items-center justify-center gap-2">
          {c.tipo_fuente === "fallback_phone" && (
            <button
              onClick={() => onQrClick(c)}
              className="h-8 w-8 rounded-md border border-[#d4d4d4] hover:border-blue-400 hover:bg-blue-50 flex items-center justify-center transition-colors"
              title="Vincular teléfono"
            >
              <Smartphone size={14} className="text-blue-500" />
            </button>
          )}
          <ActionButtons
            onEdit={puedeEditar ? () => onEdit(c) : undefined}
            onDelete={puedeEliminar ? () => onDelete(c.id_camara) : undefined}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-lg">
      <div className="px-5 py-4 border-b border-[#ececec] flex items-center justify-between gap-4">
        <div className="text-table-title">
          Cámaras{" "}
          <span className="text-table-count">
            · {total}
          </span>
        </div>
        <SearchBar
          value={query}
          onChange={onSearch}
          placeholder="Buscar cámara…"
        />
      </div>

      <CustomTable
        columns={columns}
        data={items}
        keyExtractor={(c) => c.id_camara}
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
