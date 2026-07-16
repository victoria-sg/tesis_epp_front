import { useEffect, useMemo, useRef, useState } from "react";
import { ConfirmDialog } from "../../components/crud/ConfirmDialog";
import { PageHeader } from "../../components/crud/PageHeader";
import {
  PERM_ROLES_EDITAR,
  PERM_ROLES_ELIMINAR,
} from "../../constants/permissionsConstants";
import { useCrud } from "../../hooks/useCrud";
import { useCrudForm } from "../../hooks/useCrudForm";
import { usePermission } from "../../hooks/usePermissions";
import type { Rol, RolCreate, RolUpdate } from "../../models/rol.model";
import { GRUPOS_PERMISOS } from "../../models/rol.model";
import {
  actualizarPermisosRol,
  getRolConPermisos,
  rolService,
} from "../../services/rol.service";
import { rolSchema, type RolFormValues } from "../../validators/rol.schema";
import { RolesForm } from "./components/RolesForm";
import { RolesTable } from "./components/RolesTable";

const INITIAL_VALUES: RolFormValues = {
  nombre_rol: "",
  descripcion: "",
};

const FIELD_MAPPING: Record<string, string> = {
  nombre_rol: "nombre_rol",
  descripcion: "descripcion",
};

const PAGE_SIZE = 10;

export const RolesView = () => {
  const crud = useCrud<Rol, RolCreate, RolUpdate>(rolService, {
    pageSize: PAGE_SIZE,
  });

  const [permisosSeleccionados, setPermisosSeleccionados] = useState<number[]>(
    [],
  );
  const [permisosLoading, setPermisosLoading] = useState(true);
  const [permisosError, setPermisosError] = useState<string | null>(null);

  const fallbackIds = useMemo(
    () =>
      GRUPOS_PERMISOS.find((g) => g.grupo === "FALLBACK")?.permisos.map(
        (p) => p.id,
      ) ?? [27],
    [],
  );
  const prevModalOpenRef = useRef(false);

  useEffect(() => {
    const justOpened = crud.modalOpen && !prevModalOpenRef.current;
    const justClosed = !crud.modalOpen && prevModalOpenRef.current;
    prevModalOpenRef.current = crud.modalOpen;

    if (justClosed) {
      setPermisosSeleccionados([]);
      setPermisosLoading(true);
      setPermisosError(null);
      return;
    }

    if (!justOpened || !crud.isEditing || !crud.editingItem) return;

    const idRol = crud.editingItem.id_rol;
    setPermisosLoading(true);
    setPermisosError(null);

    let activo = true;

    getRolConPermisos(idRol)
      .then((r) => {
        if (activo) {
          setPermisosSeleccionados(
            idRol === 4
              ? r.permisos.filter((pid) => fallbackIds.includes(pid))
              : r.permisos.filter((pid) => !fallbackIds.includes(pid)),
          );
          setPermisosLoading(false);
        }
      })
      .catch(() => {
        if (activo) {
          setPermisosError("No se pudieron cargar los permisos");
          setPermisosLoading(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [crud.modalOpen, crud.isEditing, crud.editingItem, fallbackIds]);

  const togglePermiso = (id: number) => {
    setPermisosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const puedeEditarPermisos = usePermission(PERM_ROLES_EDITAR);
  const puedeEliminar = usePermission(PERM_ROLES_ELIMINAR);

  const [gruposAbiertos, setGruposAbiertos] = useState<Set<string>>(new Set());

  const toggleGrupo = (grupo: string) => {
    setGruposAbiertos((prev) => {
      const next = new Set(prev);
      if (next.has(grupo)) next.delete(grupo);
      else next.add(grupo);
      return next;
    });
  };

  const toggleAllGrupo = (_grupoId: string, ids: number[], todosSeleccionados: boolean) => {
    if (todosSeleccionados) {
      setPermisosSeleccionados((prev) =>
        prev.filter((id) => !ids.includes(id)),
      );
    } else {
      setPermisosSeleccionados((prev) => {
        const nuevos = [...prev];
        for (const id of ids) {
          if (!nuevos.includes(id)) nuevos.push(id);
        }
        return nuevos;
      });
    }
  };

  const { formik, handleSubmit: handleFormSubmit } = useCrudForm<RolFormValues>(
    {
      isOpen: crud.modalOpen,
      isEditing: crud.isEditing,
      editingItem: crud.editingItem as unknown as Record<
        string,
        unknown
      > | null,
      validationSchema: rolSchema,
      initialValues: INITIAL_VALUES,
      fieldMapping: FIELD_MAPPING,
      onSubmit: async (values) => {
        if (crud.isEditing && crud.editingItem) {
          await crud.handleSubmit(values as RolUpdate);
          await actualizarPermisosRol(
            crud.editingItem.id_rol,
            permisosSeleccionados,
          );
        } else {
          await crud.handleSubmit(values as RolCreate);
        }
      },
    },
  );

  const filteredItems = useMemo(() => {
    const q = crud.filters.query.toLowerCase().trim();
    if (!q) return crud.items;
    return crud.items.filter((r) =>
      `${r.nombre_rol} ${r.descripcion ?? ""}`.toLowerCase().includes(q),
    );
  }, [crud.items, crud.filters.query]);

  return (
    <div>
      <PageHeader
        title="Roles"
        subtitle="Administre los roles del sistema y sus permisos"
        action={<></>}
      />

      <RolesTable
        items={filteredItems}
        page={crud.page}
        totalPages={crud.totalPages}
        total={filteredItems.length}
        query={crud.filters.query}
        pageSize={PAGE_SIZE}
        startIndex={(crud.page - 1) * PAGE_SIZE}
        onSearch={crud.handleSearch}
        onPageChange={crud.handlePageChange}
        puedeEditar={puedeEditarPermisos}
        puedeEliminar={puedeEliminar}
        onEdit={crud.openEditModal}
        onDelete={(id) => crud.confirmDelete(id)}
      />

      <RolesForm
        open={crud.modalOpen}
        isEditing={crud.isEditing}
        onClose={crud.closeModal}
        formik={formik}
        onSubmit={handleFormSubmit}
        submitLoading={crud.submitLoading}
        error={crud.error}
        permisosSeleccionados={permisosSeleccionados}
        onTogglePermiso={togglePermiso}
        onToggleGrupo={toggleGrupo}
        gruposAbiertos={gruposAbiertos}
        permisosLoading={permisosLoading}
        permisosError={permisosError}
        onToggleAllGrupo={toggleAllGrupo}
        idRol={crud.editingItem?.id_rol}
      />

      <ConfirmDialog
        open={crud.deleteConfirmOpen}
        title="Eliminar Rol"
        message="¿Estás seguro de eliminar este rol? Esta acción no se puede deshacer."
        onConfirm={crud.handleDelete}
        onCancel={crud.cancelDelete}
        loading={crud.deleteLoading}
      />
    </div>
  );
};
