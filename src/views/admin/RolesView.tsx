import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActionButtons } from "../../components/crud/ActionButtons";
import { ConfirmDialog } from "../../components/crud/ConfirmDialog";
import { CustomInput } from "../../components/crud/CustomInput";
import { CustomModal } from "../../components/crud/CustomModal";
import { CustomPagination } from "../../components/crud/CustomPagination";
import { CustomTable, type Column } from "../../components/crud/CustomTable";
import { PageHeader } from "../../components/crud/PageHeader";
import { SearchBar } from "../../components/crud/SearchBar";
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

  const { formik, handleSubmit: handleFormSubmit } = useCrudForm<RolFormValues>(
    {
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

  const columns: Column<Rol>[] = [
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
      key: "nombre_rol",
      header: "Nombre del Rol",
      render: (r) => <span style={{ fontWeight: 500 }}>{r.nombre_rol}</span>,
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
          onEdit={puedeEditarPermisos ? () => crud.openEditModal(r) : undefined}
          onDelete={
            puedeEliminar ? () => crud.confirmDelete(r.id_rol) : undefined
          }
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Roles"
        subtitle="Administre los roles del sistema y sus permisos"
        action={
          // puedeCrear ? (
          //   <button
          //     onClick={crud.openCreateModal}
          //     className="h-10 px-4 rounded-md bg-linear-to-r from-[#3b82f6] to-[#2563eb] text-white hover:from-[#2563eb] hover:to-[#1d4ed8] flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all"
          //     style={{ fontSize: 13, fontWeight: 600 }}
          //   >
          //     <Plus size={16} /> Nuevo Rol
          //   </button>
          // ) : undefined
          <></>
        }
      />

      <div className="bg-white border border-[#e5e5e5] rounded-lg">
        <div className="px-5 py-4 border-b border-[#ececec] flex items-center justify-between gap-4">
          <div style={{ fontSize: 15, fontWeight: 600, color: "#000" }}>
            Roles{" "}
            <span style={{ color: "#6b6b6b", fontWeight: 400 }}>
              · {filteredItems.length}
            </span>
          </div>
          <SearchBar
            value={crud.filters.query}
            onChange={crud.handleSearch}
            placeholder="Buscar rol…"
          />
        </div>

        <CustomTable
          columns={columns}
          data={filteredItems}
          keyExtractor={(r) => r.id_rol}
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
        title={crud.isEditing ? "Editar Rol" : "Nuevo Rol"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <CustomInput
            label="Nombre del Rol"
            name="nombre_rol"
            placeholder="Ej: Administrador"
            value={formik.values.nombre_rol}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.nombre_rol}
            touched={formik.touched.nombre_rol as boolean | undefined}
            disabled={crud.isEditing}
          />
          <CustomInput
            label="Descripción"
            name="descripcion"
            placeholder="Descripción del rol"
            value={formik.values.descripcion ?? ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.descripcion}
            touched={formik.touched.descripcion as boolean | undefined}
          />

          {crud.isEditing && (
            <div>
              <div
                className="mb-2"
                style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a" }}
              >
                Permisos
              </div>
              {permisosLoading ? (
                <div style={{ fontSize: 12, color: "#6b6b6b" }}>
                  Cargando permisos…
                </div>
              ) : permisosError ? (
                <div style={{ fontSize: 12, color: "#dc2626" }}>
                  {permisosError}
                </div>
              ) : (
                <div className="space-y-1">
                  {GRUPOS_PERMISOS.filter((g) => {
                    if (crud.editingItem?.id_rol === 4)
                      return g.grupo === "FALLBACK";
                    return g.grupo !== "FALLBACK";
                  }).map((grupo) => {
                    const abierto = gruposAbiertos.has(grupo.grupo);
                    const idsGrupo = grupo.permisos.map((p) => p.id);
                    const todosSeleccionados = idsGrupo.every((id) =>
                      permisosSeleccionados.includes(id),
                    );
                    const algunSeleccionado = idsGrupo.some((id) =>
                      permisosSeleccionados.includes(id),
                    );

                    return (
                      <div
                        key={grupo.grupo}
                        className="border border-[#e5e5e5] rounded-md overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => toggleGrupo(grupo.grupo)}
                          className="w-full flex items-center gap-2 px-3 py-2 bg-[#fafafa] hover:bg-[#f0f0f0] transition-colors text-left"
                        >
                          {abierto ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronRight size={14} />
                          )}
                          <label
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 flex-1 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={todosSeleccionados}
                              onChange={() => {
                                if (todosSeleccionados) {
                                  setPermisosSeleccionados((prev) =>
                                    prev.filter((id) => !idsGrupo.includes(id)),
                                  );
                                } else {
                                  setPermisosSeleccionados((prev) => {
                                    const nuevos = [...prev];
                                    for (const id of idsGrupo) {
                                      if (!nuevos.includes(id)) nuevos.push(id);
                                    }
                                    return nuevos;
                                  });
                                }
                              }}
                              className="accent-[#7c3aed] w-4 h-4"
                            />
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#1a1a1a",
                              }}
                            >
                              {grupo.etiqueta}
                            </span>
                            {algunSeleccionado && !todosSeleccionados && (
                              <span style={{ fontSize: 10, color: "#8b5cf6" }}>
                                (parcial)
                              </span>
                            )}
                          </label>
                        </button>
                        {abierto && (
                          <div className="px-4 py-2 flex flex-wrap gap-2">
                            {grupo.permisos.map((p) => (
                              <label
                                key={p.id}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#e5e5e5] hover:border-[#8b5cf6] hover:bg-[#f5f3ff] cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={permisosSeleccionados.includes(p.id)}
                                  onChange={() => togglePermiso(p.id)}
                                  className="accent-[#7c3aed] w-3.5 h-3.5"
                                />
                                <span
                                  style={{ fontSize: 11, color: "#1a1a1a" }}
                                >
                                  {p.etiqueta}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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
        title="Eliminar Rol"
        message="¿Estás seguro de eliminar este rol? Esta acción no se puede deshacer."
        onConfirm={crud.handleDelete}
        onCancel={crud.cancelDelete}
        loading={crud.deleteLoading}
      />
    </div>
  );
};
