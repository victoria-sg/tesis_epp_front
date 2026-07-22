import { ChevronDown, ChevronRight } from "lucide-react";
import type { FormikProps } from "formik";
import { Button } from "../../../components/ui/Button";
import { CustomModal } from "../../../components/crud/CustomModal";
import { CustomInput } from "../../../components/form/CustomInput";
import { CustomCheckbox } from "../../../components/form/CustomCheckbox";
import { GRUPOS_PERMISOS } from "../../../models/rol.model";
import type { RolFormValues } from "../../../validators/rol.schema";

interface RolesFormProps {
  open: boolean;
  isEditing: boolean;
  onClose: () => void;
  formik: FormikProps<RolFormValues>;
  onSubmit: (e: React.FormEvent) => void;
  submitLoading: boolean;
  error: string | null;
  permisosSeleccionados: number[];
  onTogglePermiso: (id: number) => void;
  onToggleGrupo: (grupo: string) => void;
  gruposAbiertos: Set<string>;
  permisosLoading: boolean;
  permisosError: string | null;
  onToggleAllGrupo: (grupoId: string, ids: number[], todosSeleccionados: boolean) => void;
  idRol?: number;
}

export const RolesForm = ({
  open,
  isEditing,
  onClose,
  formik,
  onSubmit,
  submitLoading,
  error,
  permisosSeleccionados,
  onTogglePermiso,
  onToggleGrupo,
  gruposAbiertos,
  permisosLoading,
  permisosError,
  onToggleAllGrupo,
  idRol,
}: RolesFormProps) => {
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar Rol" : "Nuevo Rol"}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <CustomInput
          label="Nombre del Rol"
          name="nombre_rol"
          placeholder="Ej: Administrador"
          value={formik.values.nombre_rol}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.nombre_rol}
          touched={formik.touched.nombre_rol as boolean | undefined}
          disabled={isEditing}
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

        {isEditing && (
          <div>
            <div className="text-xs font-semibold text-gray-800 mb-2">
              Permisos
            </div>
            {permisosLoading ? (
              <div className="text-xs text-gray-500">
                Cargando permisos…
              </div>
            ) : permisosError ? (
              <div className="text-xs text-red-600">
                {permisosError}
              </div>
            ) : (
              <div className="space-y-1">
                {GRUPOS_PERMISOS.filter((g) => {
                  if (idRol === 4) return g.grupo === "FALLBACK";
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
                      className="border border-slate-200 rounded-md overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => onToggleGrupo(grupo.grupo)}
                        className="w-full flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                      >
                        {abierto ? (
                          <ChevronDown size={14} />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 flex-1"
                        >
                          <CustomCheckbox
                            label=""
                            checked={todosSeleccionados}
                            onChange={() =>
                              onToggleAllGrupo(
                                grupo.grupo,
                                idsGrupo,
                                todosSeleccionados,
                              )
                            }
                            variant="hidden"
                          />
                          <span className="text-sm font-semibold text-gray-800">
                            {grupo.etiqueta}
                          </span>
                          {algunSeleccionado && !todosSeleccionados && (
                            <span className="text-[10px] text-purple-500">
                              (parcial)
                            </span>
                          )}
                        </div>
                      </button>
                      {abierto && (
                        <div className="px-4 py-2 flex flex-wrap gap-2">
                          {grupo.permisos.map((p) => (
                            <CustomCheckbox
                              key={p.id}
                              label={p.etiqueta}
                              checked={permisosSeleccionados.includes(p.id)}
                              onChange={() => onTogglePermiso(p.id)}
                              variant="visible"
                            />
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

        {error && (
          <div className="text-[12px] text-red-600 text-center">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={submitLoading}
            disabled={submitLoading}
          >
            {submitLoading
              ? "Guardando..."
              : isEditing
                ? "Actualizar"
                : "Crear"}
          </Button>
        </div>
      </form>
    </CustomModal>
  );
};
