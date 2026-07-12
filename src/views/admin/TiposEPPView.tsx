import { useEffect, useMemo, useState } from "react";
import { CustomPagination } from "../../components/crud/CustomPagination";
import { CustomTable, type Column } from "../../components/crud/CustomTable";
import { PageHeader } from "../../components/crud/PageHeader";
import { SearchBar } from "../../components/crud/SearchBar";
import { usePermission } from "../../hooks/usePermissions";
import type { TipoEPP } from "../../models/tipo.model";
import { tipoService } from "../../services/tipo.service";

const PAGE_SIZE = 10;

export const TiposEPPView = () => {
  const [items, setItems] = useState<TipoEPP[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    tipoService
      .getAll()
      .then((data) => setItems(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    return items.filter((t) =>
      `${t.nombre_epp} ${t.descripcion ?? ""}`.toLowerCase().includes(q),
    );
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const paginatedItems = filteredItems.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const columns: Column<TipoEPP>[] = [
    {
      key: "index",
      header: "#",
      width: "60px",
      align: "center",
      render: (_, i) => (
        <span style={{ color: "#6b6b6b", fontVariantNumeric: "tabular-nums" }}>
          {(page - 1) * PAGE_SIZE + i + 1}
        </span>
      ),
    },
    {
      key: "nombre_epp",
      header: "Nombre del EPP",
      render: (t) => <span style={{ fontWeight: 500 }}>{t.nombre_epp}</span>,
    },
    {
      key: "descripcion",
      header: "Descripción",
      render: (t) => t.descripcion ?? "—",
    },
  ];

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Tipos de EPP"
          subtitle="Equipos de Protección Personal configurados en el sistema"
        />
        <div className="flex items-center justify-center h-64 text-[#6b6b6b]">
          <span className="animate-pulse text-sm">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Tipos de EPP"
        subtitle="Equipos de Protección Personal configurados en el sistema"
      />

      <div className="bg-white border border-[#e5e5e5] rounded-lg">
        <div className="px-5 py-4 border-b border-[#ececec] flex items-center justify-between gap-4">
          <div style={{ fontSize: 15, fontWeight: 600, color: "#000" }}>
            Tipos de EPP{" "}
            <span style={{ color: "#6b6b6b", fontWeight: 400 }}>
              · {filteredItems.length}
            </span>
          </div>
          <SearchBar
            value={query}
            onChange={(v) => { setQuery(v); setPage(1); }}
            placeholder="Buscar tipo de EPP…"
          />
        </div>

        <CustomTable
          columns={columns}
          data={paginatedItems}
          keyExtractor={(t) => t.id_tipo_epp}
          startIndex={(page - 1) * PAGE_SIZE}
        />

        <CustomPagination
          page={page}
          totalPages={totalPages}
          total={filteredItems.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};
