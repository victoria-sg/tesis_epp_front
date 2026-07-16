import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { CustomModal } from "../../components/crud/CustomModal";
import { PageHeader } from "../../components/crud/PageHeader";
import { Button } from "../../components/ui/Button";
import {
  PERM_TIPOS_EPP_CREAR,
  PERM_TIPOS_EPP_EDITAR,
} from "../../constants/permissionsConstants";
import { usePermission } from "../../hooks/usePermissions";
import type { TipoEPP, TipoEPPCreate } from "../../models/tipo.model";
import type { ClaseDeteccion } from "../../models/claseDeteccion.model";
import { claseDeteccionService } from "../../services/claseDeteccion.service";
import { tipoService } from "../../services/tipo.service";
import { TiposEPPTable } from "./components/TiposEPPTable";

const PAGE_SIZE = 10;

const initialForm: TipoEPPCreate = {
  nombre_epp: "",
  descripcion: "",
  id_clase_deteccion: null,
  clase_yolo: "",
  activo: true,
  usar_modelo_principal: true,
  clase_positiva: "",
  clase_negativa: "",
  usar_modelo_personalizado: false,
  modelo_personalizado_path: "",
  estado_entrenamiento: "sin_modelo",
  modo_alerta: "ausencia_requerida",
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { detail?: string; msg?: string } } }).response;
    return response?.data?.detail ?? response?.data?.msg ?? fallback;
  }
  return fallback;
};

export const TiposEPPView = () => {
  const [items, setItems] = useState<TipoEPP[]>([]);
  const [clases, setClases] = useState<ClaseDeteccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TipoEPP | null>(null);
  const [form, setForm] = useState<TipoEPPCreate>(initialForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const puedeCrear = usePermission(PERM_TIPOS_EPP_CREAR);
  const puedeEditar = usePermission(PERM_TIPOS_EPP_EDITAR);

  const loadData = () => {
    setLoading(true);
    Promise.all([tipoService.getAll(), claseDeteccionService.getAll()])
      .then(([tipos, clasesData]) => {
        setItems(tipos);
        setClases(clasesData.filter((clase) => clase.codigo_positivo !== "PERSONA"));
      })
      .catch(() => setMessage("Error al cargar los tipos de EPP."))
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const filteredItems = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    return items.filter((t) =>
      `${t.nombre_epp} ${t.descripcion ?? ""} ${t.clase_yolo}`
        .toLowerCase()
        .includes(q),
    );
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const paginatedItems = filteredItems.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const openCreateModal = () => {
    setEditing(null);
    setForm(initialForm);
    setMessage(null);
    setModalOpen(true);
  };

  const openEditModal = (tipo: TipoEPP) => {
    const claseId =
      tipo.id_clase_deteccion ??
      clases.find((clase) => clase.codigo_positivo === tipo.clase_yolo)
        ?.id_clase_deteccion ??
      null;
    setEditing(tipo);
    setForm({
      nombre_epp: tipo.nombre_epp,
      descripcion: tipo.descripcion ?? "",
      id_clase_deteccion: claseId,
      clase_yolo: tipo.clase_yolo,
      activo: tipo.activo,
      usar_modelo_principal: tipo.usar_modelo_principal,
      clase_positiva: tipo.clase_positiva ?? tipo.clase_yolo,
      clase_negativa: tipo.clase_negativa ?? "",
      usar_modelo_personalizado: tipo.usar_modelo_personalizado,
      modelo_personalizado_path: tipo.modelo_personalizado_path ?? "",
      estado_entrenamiento: tipo.estado_entrenamiento,
      modo_alerta: tipo.modo_alerta,
    });
    setMessage(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(initialForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        id_clase_deteccion: form.id_clase_deteccion,
        nombre_epp: form.nombre_epp,
        descripcion: form.descripcion || null,
        activo: form.activo ?? true,
        modo_alerta: form.modo_alerta ?? "ausencia_requerida",
      };
      if (editing) {
        const updated = await tipoService.update(editing.id_tipo_epp, payload);
        setItems((prev) =>
          prev.map((item) =>
            item.id_tipo_epp === updated.id_tipo_epp ? updated : item,
          ),
        );
        setMessage("Tipo EPP actualizado.");
      } else {
        const created = await tipoService.create(payload);
        setItems((prev) => [...prev, created]);
        setMessage("Tipo EPP creado.");
      }
      closeModal();
    } catch (error) {
      setMessage(getErrorMessage(error, "No se pudo guardar el tipo EPP."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Tipos de EPP"
        subtitle="Reglas de cumplimiento basadas en clases detectables"
        action={
          puedeCrear ? (
            <Button
              variant="primary"
              size="md"
              icon={<Plus size={16} />}
              onClick={openCreateModal}
            >
              Agregar EPP
            </Button>
          ) : undefined
        }
      />

      {message && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          {message}
        </div>
      )}

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
        puedeEditar={puedeEditar}
        onEdit={openEditModal}
      />

      <CustomModal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Editar EPP" : "Agregar EPP"}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-xs font-semibold text-gray-800">
            Nombre
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={form.nombre_epp}
              onChange={(e) => setForm({ ...form, nombre_epp: e.target.value })}
              placeholder="Ej. Casco de seguridad"
              required
            />
          </label>

          <label className="block text-xs font-semibold text-gray-800">
            Clase detectable
            <select
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={form.id_clase_deteccion ?? ""}
              onChange={(e) => setForm({ ...form, id_clase_deteccion: Number(e.target.value) || null })}
              required
            >
              <option value="">Seleccione una clase</option>
              {clases.map((clase) => (
                <option key={clase.id_clase_deteccion} value={clase.id_clase_deteccion}>
                  {clase.nombre_visible} ({clase.codigo_positivo})
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold text-gray-800">
            Modo de alerta
            <select
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={form.modo_alerta ?? "ausencia_requerida"}
              onChange={(e) => setForm({ ...form, modo_alerta: e.target.value })}
            >
              <option value="ausencia_requerida">Obligatoria / alertar ausencia</option>
              <option value="negativa_detectada">Alertar clase negativa</option>
              <option value="presencia_prohibida">Prohibida / alertar presencia</option>
              <option value="solo_deteccion">Solo deteccion</option>
            </select>
          </label>

          <div className="rounded-lg border border-gray-200 p-3 text-xs font-semibold text-gray-800">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.activo ?? true}
                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              />
              Evaluar en monitoreo
            </label>
          </div>

          <label className="block text-xs font-semibold text-gray-800">
            Descripcion
            <textarea
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={form.descripcion ?? ""}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              rows={3}
            />
          </label>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? "Guardar" : "Crear"}
            </Button>
          </div>
        </form>
      </CustomModal>
    </div>
  );
};
