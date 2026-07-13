import { Lock } from "lucide-react";
import type { FormikProps } from "formik";

import { Button } from "../../../components/ui/Button";
import { CustomModal } from "../../../components/crud/CustomModal";
import { CustomInput } from "../../../components/form/CustomInput";
import { CustomSelect } from "../../../components/form/CustomSelect";

import type { UsuarioFormValues } from "../../../validators/usuario.schema";

interface UsuariosFormProps {
  open: boolean;
  isEditing: boolean;
  onClose: () => void;
  formik: FormikProps<UsuarioFormValues>;
  onSubmit: (e: React.FormEvent) => void;
  submitLoading: boolean;
  error: string | null;
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
}: UsuariosFormProps) => (
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
        label="Correo electrónico"
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
        label="Cédula"
        name="cedula"
        placeholder="10 dígitos numéricos"
        value={formik.values.cedula ?? ""}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.errors.cedula}
        touched={formik.touched.cedula as boolean | undefined}
      />
      {!isEditing && (
        <CustomSelect
          label="Rol"
          value={formik.values.id_rol}
          onChange={(v) => formik.setFieldValue("id_rol", v)}
          options={ROLES_ASIGNABLES}
          placeholder="Seleccionar rol…"
          error={formik.errors.id_rol}
          touched={formik.touched.id_rol as boolean | undefined}
        />
      )}
      {!isEditing && (
        <div
          className="px-3 py-2.5 rounded-md border border-[#e5e5e5] bg-[#f5f3ff] text-xs text-gray-500 leading-relaxed"
        >
          <span className="flex items-center gap-1">
            <Lock size={14} />
          </span>{" "}
          La contraseña se generará automáticamente a partir de la cédula e
          iniciales del nombre, y se enviará al correo registrado.
        </div>
      )}
      {error && (
        <div className="text-[12px] text-red-600 text-center">
          {error}
        </div>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" size="md" onClick={onClose}>Cancelar</Button>
        <Button type="submit" variant="primary" loading={submitLoading} disabled={submitLoading}>
          {submitLoading ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  </CustomModal>
);
