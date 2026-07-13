import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "../../components/crud/PageHeader";
import { TiposEPPTable } from "./components/TiposEPPTable";
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

  return (
    <div>
      <PageHeader
        title="Tipos de EPP"
        subtitle="Equipos de Protección Personal configurados en el sistema"
      />
      <TiposEPPTable
        items={paginatedItems}
        page={page}
        totalPages={totalPages}
        total={filteredItems.length}
        query={query}
        pageSize={PAGE_SIZE}
        startIndex={(page - 1) * PAGE_SIZE}
        onSearch={(q) => { setQuery(q); setPage(1); }}
        onPageChange={setPage}
        loading={loading}
      />
    </div>
  );
};
