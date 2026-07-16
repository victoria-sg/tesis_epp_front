import { AlertTriangle, Plus, Shield, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/crud/ConfirmDialog";
import { PageHeader } from "../../components/crud/PageHeader";
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
} from "../../models/zona.model";
import { opcionesService } from "../../services/opciones.service";
import { tipoService } from "../../services/tipo.service";
import { zonaService } from "../../services/zona.service";
import { zonaSchema } from "../../validators/zona.schema";
import { ZonasForm } from "./components/ZonasForm";
import { ZonasTable } from "./components/ZonasTable";

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

export const ZonasView = () => {
  const crud = useCrud<Zona, ZonaCreate, ZonaUpdate>(zonaService, {
    pageSize: PAGE_SIZE,
  });

  const puedeCrear = usePermission(PERM_ZONAS_CREAR);
  const puedeEditar = usePermission(PERM_ZONAS_EDITAR);
  const puedeEliminar = usePermission(PERM_ZONAS_ELIMINAR);

  const [tiposEpp, setTiposEpp] = useState<TipoEPP[]>([]);
  const [nivelesRiesgo, setNivelesRiesgo] = useState<string[]>([]);

  useEffect(() => {
    tipoService
      .getAll()
      .then(setTiposEpp)
      .catch(() => {});
    opcionesService
      .getNivelesRiesgo()
      .then(setNivelesRiesgo)
      .catch(() => setNivelesRiesgo([]));
  }, []);

  const { formik, handleSubmit: handleFormSubmit } =
    useCrudForm<ZonaFormValues>({
      isOpen: crud.modalOpen,
      isEditing: crud.isEditing,
      editingItem: crud.editingItem as unknown as Record<
        string,
        unknown
      > | null,
      validationSchema: zonaSchema,
      initialValues: INITIAL_VALUES,
      fieldMapping: FIELD_MAPPING,
      onSubmit: async (values) => {
        const nivel = inferirNivelRiesgo(
          values.epp_ids?.length ?? 0,
          values.tiempo_toleracia_segundo,
        );
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
      !formik.values.nivel_riesgo
        ? inferirNivelRiesgo(
            formik.values.epp_ids?.length ?? 0,
            formik.values.tiempo_toleracia_segundo,
          )
        : null,
    [
      formik.values.epp_ids,
      formik.values.nivel_riesgo,
      formik.values.tiempo_toleracia_segundo,
    ],
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

  const handleCalibrarEpp = async (idZona: number, idTipoEpp: number) => {
    await zonaService.calibrarEpp(idZona, idTipoEpp);
    await crud.fetchItems();
  };

  return (
    <div>
      <PageHeader
        title="Zonas"
        subtitle="Administre las zonas de la planta"
        action={
          puedeCrear ? (
            <Button variant="primary" size="md" icon={<Plus size={16} />} onClick={crud.openCreateModal}>
              Nueva Zona
            </Button>
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
                  className="text-number-md" style={{ color: config.color }}
                >
                  {contadores[nivel]}
                </div>
                <div
                  className="text-[11px]" style={{ color: config.color, opacity: 0.8 }}
                >
                  Riesgo {config.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ZonasTable
        items={filteredItems}
        page={crud.page}
        totalPages={crud.totalPages}
        total={filteredItems.length}
        query={crud.filters.query}
        pageSize={PAGE_SIZE}
        startIndex={(crud.page - 1) * PAGE_SIZE}
        onSearch={crud.handleSearch}
        onPageChange={crud.handlePageChange}
        puedeEditar={puedeEditar}
        puedeEliminar={puedeEliminar}
        onEdit={crud.openEditModal}
        onDelete={(id) => crud.confirmDelete(id)}
        tiposEpp={tiposEpp}
        onCalibrarEpp={handleCalibrarEpp}
      />

      <ZonasForm
        open={crud.modalOpen}
        isEditing={crud.isEditing}
        onClose={crud.closeModal}
        formik={formik}
        onSubmit={handleFormSubmit}
        submitLoading={crud.submitLoading}
        error={crud.error}
        tiposEpp={tiposEpp}
        nivelesRiesgo={nivelesRiesgo}
        nivelInferido={nivelInferido}
        onToggleEpp={toggleEpp}
      />

      <ConfirmDialog
        open={crud.deleteConfirmOpen}
        title="Eliminar Zona"
        message="¿Estás seguro de eliminar esta zona? Esta acción no se puede deshacer."
        onConfirm={crud.handleDelete}
        onCancel={crud.cancelDelete}
        loading={crud.deleteLoading}
        error={crud.error}
      />
    </div>
  );
};
