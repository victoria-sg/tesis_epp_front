import { AlertTriangle, Plus, Shield, ShieldAlert, Shirt } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ActionButtons } from "../../components/crud/ActionButtons";
import { ConfirmDialog } from "../../components/crud/ConfirmDialog";
import { CustomInput } from "../../components/crud/CustomInput";
import { CustomModal } from "../../components/crud/CustomModal";
import { CustomPagination } from "../../components/crud/CustomPagination";
import { CustomSelect } from "../../components/crud/CustomSelect";
import { CustomTable } from "../../components/crud/CustomTable";
import { PageHeader } from "../../components/crud/PageHeader";
import { SearchBar } from "../../components/crud/SearchBar";
import {
  PERM_ZONAS_CREAR,
  PERM_ZONAS_EDITAR,
  PERM_ZONAS_ELIMINAR,
} from "../../constants/permissionsConstants";
import { useCrud } from "../../hooks/useCrud";
import { useCrudForm } from "../../hooks/useCrudForm";
import { usePermission } from "../../hooks/usePermissions";
import {
  inferirNivelRiesgo,
  NIVEL_RIESGO_CONFIG,
  ZONA_NIVELES_RIESGO,
} from "../../models/zona.model";
import { tipoService } from "../../services/tipo.service";
import { zonaService } from "../../services/zona.service";
import { zonaSchema } from "../../validators/zona.schema";

import type { Column } from "../../components/crud/CustomTable";
import type { TipoEPP } from "../../models/tipo.model";
import type { Zona, ZonaCreate, ZonaUpdate } from "../../models/zona.model";
import type { ZonaFormValues } from "../../validators/zona.schema";

const INITIAL_VALUES: ZonaFormValues = {
  nombre_zona: "",
  nivel_riesgo: null,
  tiempo_toleracia_segundo: null,
  epp_ids: [],
};

const FIELD_MAPPING: Record<string, string> = {
  nombre_zona: "nombre_zona",
  nivel_riesgo: "nivel_riesgo",
  tiempo_toleracia_segundo: "tiempo_toleracia_segundo",
  epp_ids: "epp_ids",
};

const PAGE_SIZE = 10;

const NivelRiesgoBadge = ({ nivel }: { nivel: string | null | undefined }) => {
  if (!nivel) return <span style={{ color: "#b0b0b0" }}>—</span>;
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

export const ZonasView = () => {
  const crud = useCrud<Zona, ZonaCreate, ZonaUpdate>(zonaService, {
    pageSize: PAGE_SIZE,
  });

  const puedeCrear = usePermission(PERM_ZONAS_CREAR);
  const puedeEditar = usePermission(PERM_ZONAS_EDITAR);
  const puedeEliminar = usePermission(PERM_ZONAS_ELIMINAR);

  const [tiposEpp, setTiposEpp] = useState<TipoEPP[]>([]);

  useEffect(() => {
    tipoService
      .getAll()
      .then(setTiposEpp)
      .catch(() => {});
  }, []);

  const { formik, handleSubmit: handleFormSubmit } =
    useCrudForm<ZonaFormValues>({
      isEditing: crud.isEditing,
      editingItem: crud.editingItem as unknown as Record<
        string,
        unknown
      > | null,
      validationSchema: zonaSchema,
      initialValues: INITIAL_VALUES,
      fieldMapping: FIELD_MAPPING,
      onSubmit: async (values) => {
        const nivel =
          values.nivel_riesgo || inferirNivelRiesgo(values.nombre_zona);
        const data = {
          ...values,
          nivel_riesgo: nivel,
          tiempo_toleracia_segundo: values.tiempo_toleracia_segundo || null,
          epp_ids: values.epp_ids || [],
        };
        if (crud.isEditing) {
          await crud.handleSubmit(data as ZonaUpdate);
        } else {
          await crud.handleSubmit(data as ZonaCreate);
        }
      },
    });

  const nivelInferido = useMemo(
    () =>
      !formik.values.nivel_riesgo && formik.values.nombre_zona
        ? inferirNivelRiesgo(formik.values.nombre_zona)
        : null,
    [formik.values.nombre_zona, formik.values.nivel_riesgo],
  );

  const filteredItems = useMemo(() => {
    const q = crud.filters.query.toLowerCase().trim();
    if (!q) return crud.items;
    return crud.items.filter((z) =>
      `${z.nombre_zona} ${z.nivel_riesgo ?? ""}`.toLowerCase().includes(q),
    );
  }, [crud.items, crud.filters.query]);

  const contadores = useMemo(
    () => ({
      alto: filteredItems.filter(
        (z) => z.nivel_riesgo?.toLowerCase() === "alto",
      ).length,
      medio: filteredItems.filter(
        (z) => z.nivel_riesgo?.toLowerCase() === "medio",
      ).length,
      bajo: filteredItems.filter(
        (z) => z.nivel_riesgo?.toLowerCase() === "bajo",
      ).length,
    }),
    [filteredItems],
  );

  const toggleEpp = (id: number) => {
    const selected = formik.values.epp_ids ?? [];
    if (selected.includes(id)) {
      formik.setFieldValue(
        "epp_ids",
        selected.filter((v) => v !== id),
      );
    } else {
      formik.setFieldValue("epp_ids", [...selected, id]);
    }
  };

  const columns: Column<Zona>[] = [
    {
      key: "index",
      header: "#",
      width: "60px",
      align: "center",
      render: (_, i) => (
        <span style={{ color: "#6b6b6b", fontVariantNumeric: "tabular-nums" }}>
          {(crud.page - 1) * PAGE_SIZE + i + 1}
        </span>
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
            <span style={{ fontWeight: 500 }}>{z.nombre_zona}</span>
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
        const ids = z.epp_ids ?? [];
        if (ids.length === 0)
          return <span style={{ color: "#b0b0b0" }}>—</span>;
        const nombres = ids
          .map((id) => tiposEpp.find((t) => t.id_tipo_epp === id)?.nombre_epp)
          .filter(Boolean);
        return (
          <div className="flex flex-wrap gap-1">
            {nombres.map((n, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-blue-50 text-blue-700 border border-blue-200 font-medium"
              >
                <Shirt size={11} />
                {n}
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
      width: "100px",
      render: (z) => (
        <ActionButtons
          onEdit={puedeEditar ? () => crud.openEditModal(z) : undefined}
          onDelete={
            puedeEliminar ? () => crud.confirmDelete(z.id_zona) : undefined
          }
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Zonas"
        subtitle="Administre las zonas de la planta"
        action={
          puedeCrear ? (
            <button
              onClick={crud.openCreateModal}
              className="h-10 px-4 rounded-md bg-linear-to-r from-[#3b82f6] to-[#2563eb] text-white hover:from-[#2563eb] hover:to-[#1d4ed8] flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all"
              style={{ fontSize: 13, fontWeight: 600 }}
            >
              <Plus size={16} /> Nueva Zona
            </button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-3 gap-3 mb-4">
        {(["alto", "medio", "bajo"] as const).map((nivel) => {
          const config = NIVEL_RIESGO_CONFIG[nivel];
          const Icon =
            nivel === "alto"
              ? ShieldAlert
              : nivel === "medio"
                ? AlertTriangle
                : Shield;
          return (
            <div
              key={nivel}
              className="rounded-lg border p-4 flex items-center gap-3"
              style={{ background: config.bg, borderColor: config.border }}
            >
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center"
                style={{ background: config.color + "20" }}
              >
                <Icon size={18} style={{ color: config.color }} />
              </div>
              <div>
                <div
                  style={{ fontSize: 22, fontWeight: 700, color: config.color }}
                >
                  {contadores[nivel]}
                </div>
                <div
                  style={{ fontSize: 11, color: config.color, opacity: 0.8 }}
                >
                  Riesgo {config.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-[#e5e5e5] rounded-lg">
        <div className="px-5 py-4 border-b border-[#ececec] flex items-center justify-between gap-4">
          <div style={{ fontSize: 15, fontWeight: 600, color: "#000" }}>
            Zonas{" "}
            <span style={{ color: "#6b6b6b", fontWeight: 400 }}>
              · {filteredItems.length}
            </span>
          </div>
          <SearchBar
            value={crud.filters.query}
            onChange={crud.handleSearch}
            placeholder="Buscar zona…"
          />
        </div>

        <CustomTable
          columns={columns}
          data={filteredItems}
          keyExtractor={(z) => z.id_zona}
          startIndex={(crud.page - 1) * PAGE_SIZE}
        />

        <CustomPagination
          page={crud.page}
          totalPages={crud.totalPages}
          total={filteredItems.length}
          pageSize={PAGE_SIZE}
          onPageChange={crud.handlePageChange}
        />
      </div>

      <CustomModal
        open={crud.modalOpen}
        onClose={crud.closeModal}
        title={crud.isEditing ? "Editar Zona" : "Nueva Zona"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <CustomInput
            label="Nombre de la Zona"
            name="nombre_zona"
            placeholder="Ej: Zona A - Fundición"
            value={formik.values.nombre_zona}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.nombre_zona}
            touched={formik.touched.nombre_zona as boolean | undefined}
          />

          <div>
            <CustomSelect
              label="Nivel de Riesgo"
              value={formik.values.nivel_riesgo ?? ""}
              onChange={(v) => formik.setFieldValue("nivel_riesgo", v || null)}
              options={ZONA_NIVELES_RIESGO.map((n) => ({
                value: n,
                label: NIVEL_RIESGO_CONFIG[n].label,
              }))}
              placeholder="Dejar vacío para detectar automáticamente…"
              error={formik.errors.nivel_riesgo}
              touched={formik.touched.nivel_riesgo as boolean | undefined}
            />
            {nivelInferido && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <span style={{ fontSize: 11, color: "#6b6b6b" }}>
                  Se detectará automáticamente:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    formik.setFieldValue("nivel_riesgo", nivelInferido)
                  }
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  title="Haz clic para seleccionar este nivel"
                >
                  <NivelRiesgoBadge nivel={nivelInferido} />
                </button>
              </div>
            )}
          </div>

          <CustomInput
            label="Tiempo de Tolerancia (segundos)"
            name="tiempo_toleracia_segundo"
            type="number"
            placeholder="Ej: 30"
            value={formik.values.tiempo_toleracia_segundo ?? ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.tiempo_toleracia_segundo}
            touched={
              formik.touched.tiempo_toleracia_segundo as boolean | undefined
            }
          />

          {tiposEpp.length > 0 && (
            <div>
              <label className="block mb-1.5 text-[12px] text-[#1a1a1a] font-semibold">
                EPP Requeridos
              </label>
              <div className="flex flex-wrap gap-2 p-2 border border-[#e5e5e5] rounded-lg bg-[#fafafa]">
                {tiposEpp.map((tipo) => {
                  const selected = (formik.values.epp_ids ?? []).includes(
                    tipo.id_tipo_epp,
                  );
                  return (
                    <label
                      key={tipo.id_tipo_epp}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors text-[13px] ${
                        selected
                          ? "bg-blue-100 text-blue-800 border border-blue-300"
                          : "bg-white text-[#4a4a4a] border border-[#e5e5e5] hover:border-blue-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleEpp(tipo.id_tipo_epp)}
                        className="sr-only"
                      />
                      <Shirt size={14} />
                      {tipo.nombre_epp}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
          {crud.error && (
            <div className="text-[12px] text-red-600 text-center">
              {crud.error}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={crud.closeModal}
              className="h-10 px-4 rounded-lg border border-[#d4d4d4] text-[#1a1a1a] hover:bg-[#f5f5f5] text-sm font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={crud.submitLoading}
              className="h-10 px-4 rounded-lg bg-linear-to-r from-[#3b82f6] to-[#2563eb] text-white hover:from-[#2563eb] hover:to-[#1d4ed8] text-sm font-semibold transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/30"
            >
              {crud.submitLoading
                ? "Guardando..."
                : crud.isEditing
                  ? "Actualizar"
                  : "Crear"}
            </button>
          </div>
        </form>
      </CustomModal>

      <ConfirmDialog
        open={crud.deleteConfirmOpen}
        title="Eliminar Zona"
        message="¿Estás seguro de eliminar esta zona? Esta acción no se puede deshacer."
        onConfirm={crud.handleDelete}
        onCancel={crud.cancelDelete}
        loading={crud.deleteLoading}
      />
    </div>
  );
};
