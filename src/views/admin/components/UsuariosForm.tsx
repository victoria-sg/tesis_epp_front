import { Lock } from "lucide-react";
import type { FormikProps } from "formik";

import { Button } from "../../../components/ui/Button";
import { CustomModal } from "../../../components/crud/CustomModal";
import { CustomInput } from "../../../components/form/CustomInput";
import { CustomSelect } from "../../../components/form/CustomSelect";
import { CustomCheckbox } from "../../../components/form/CustomCheckbox";

import type { UsuarioFormValues } from "../../../validators/usuario.schema";
import type { Zona } from "../../../models/zona.model";

interface UsuariosFormProps {
  open: boolean;
  isEditing: boolean;
  onClose: () => void;
  formik: FormikProps<UsuarioFormValues>;
  onSubmit: (e: React.FormEvent) => void;
  submitLoading: boolean;
  error: string | null;
  zonas: Zona[];
}

const ROLES_ASIGNABLES = [
  { value: 2, label: "Supervisor de Turno" },
  { value: 3, label: "Jefe de Planta" },
];

export const UsuariosForm = ({
  open,
  isEditing,
  onClose,
  formik,
  onSubmit,
  submitLoading,
  error,
  zonas,
}: UsuariosFormProps) => {
  const zonasSeleccionadas = formik.values.zonas_asignadas ?? [];

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar Usuario" : "Nuevo Usuario"}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <CustomInput
          label="Nombre"
          name="nombre"
          placeholder="Ingrese el nombre"
          value={formik.values.nombre}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.nombre}
          touched={formik.touched.nombre as boolean | undefined}
        />
        <CustomInput
          label="Apellido"
          name="apelido"
          placeholder="Ingrese el apellido"
          value={formik.values.apelido}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.apelido}
          touched={formik.touched.apelido as boolean | undefined}
        />
        <CustomInput
          label="Correo electronico"
          name="correo"
          type="email"
          placeholder="correo@empresa.com"
          value={formik.values.correo}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.correo}
          touched={formik.touched.correo as boolean | undefined}
        />
        <CustomInput
          label="Cedula"
          name="cedula"
          placeholder="10 digitos numericos"
          value={formik.values.cedula ?? ""}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.cedula}
          touched={formik.touched.cedula as boolean | undefined}
        />
        <CustomSelect
          label="Rol"
          value={formik.values.id_rol}
          onChange={(v) => {
            formik.setFieldValue("id_rol", v);
            if (Number(v) !== 2) formik.setFieldValue("zonas_asignadas", []);
          }}
          options={ROLES_ASIGNABLES}
          placeholder="Seleccionar rol..."
          error={formik.errors.id_rol}
          touched={formik.touched.id_rol as boolean | undefined}
        />
        {Number(formik.values.id_rol) === 2 && (
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2">
              Zonas supervisadas
            </div>
            <div className="flex flex-wrap gap-2">
              {zonas.map((zona) => {
                const checked = zonasSeleccionadas.includes(zona.id_zona);
                return (
                  <CustomCheckbox
                    key={zona.id_zona}
                    label={zona.nombre_zona}
                    checked={checked}
                    onChange={() => {
                      const next = checked
                        ? zonasSeleccionadas.filter((id) => id !== zona.id_zona)
                        : [...zonasSeleccionadas, zona.id_zona];
                      formik.setFieldValue("zonas_asignadas", next);
                      formik.setFieldTouched("zonas_asignadas", true, false);
                    }}
                  />
                );
              })}
            </div>
            {formik.touched.zonas_asignadas && formik.errors.zonas_asignadas && (
              <div className="mt-1.5 text-xs text-red-600">
                {formik.errors.zonas_asignadas as string}
              </div>
            )}
            {zonas.length === 0 && (
              <div className="text-xs text-gray-500">
                No hay zonas configuradas.
              </div>
            )}
          </div>
        )}
        {!isEditing && (
          <div className="px-3 py-2.5 rounded-md border border-slate-200 bg-purple-50 text-xs text-gray-500 leading-relaxed">
            <span className="flex items-center gap-1">
              <Lock size={14} />
            </span>{" "}
            La contrasena se generara automaticamente a partir de la cedula e
            iniciales del nombre, y se enviara al correo registrado.
          </div>
        )}
        {error && (
          <div className="text-[12px] text-red-600 text-center">{error}</div>
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
            {submitLoading ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </CustomModal>
  );
};
