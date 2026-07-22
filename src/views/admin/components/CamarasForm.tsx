import { Smartphone } from "lucide-react";
import type { FormikProps } from "formik";

import { Button } from "../../../components/ui/Button";
import { CustomModal } from "../../../components/crud/CustomModal";
import { CustomInput } from "../../../components/form/CustomInput";
import { CustomSelect } from "../../../components/form/CustomSelect";
import { TIPOS_FUENTE } from "../../../models/camara.model";
import type { CamaraFormValues } from "../../../validators/camara.schema";

interface CamarasFormProps {
  open: boolean;
  isEditing: boolean;
  onClose: () => void;
  formik: FormikProps<CamaraFormValues>;
  onSubmit: (e: React.FormEvent) => void;
  submitLoading: boolean;
  error: string | null;
  zonas: { value: number; label: string }[];
}

export const CamarasForm = ({
  open,
  isEditing,
  onClose,
  formik,
  onSubmit,
  submitLoading,
  error,
  zonas,
}: CamarasFormProps) => {
  const esFallbackPhone = formik.values.tipo_fuente === "fallback_phone";

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar Cámara" : "Nueva Cámara"}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <CustomSelect
          label="Zona"
          value={formik.values.id_zona}
          onChange={(v) =>
            formik.setFieldValue("id_zona", v === "" ? "" : Number(v))
          }
          options={zonas}
          placeholder="Seleccionar zona…"
          error={formik.errors.id_zona}
          touched={formik.touched.id_zona as boolean | undefined}
        />
        <CustomInput
          label="Código de Cámara"
          name="codigo_camara"
          placeholder="Ej: CAM-A1"
          value={formik.values.codigo_camara}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.codigo_camara}
          touched={formik.touched.codigo_camara as boolean | undefined}
        />
        <CustomSelect
          label="Tipo de fuente"
          value={formik.values.tipo_fuente}
          onChange={(v) => formik.setFieldValue("tipo_fuente", v)}
          options={TIPOS_FUENTE.map((t) => ({
            value: t.value,
            label: t.label,
          }))}
          placeholder="Seleccionar tipo…"
          error={formik.errors.tipo_fuente}
          touched={formik.touched.tipo_fuente as boolean | undefined}
        />
        {!esFallbackPhone && (
          <>
            <CustomInput
              label="Dirección IP"
              name="ip_direccion"
              placeholder="Ej: 192.168.1.100"
              value={formik.values.ip_direccion ?? ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.ip_direccion}
              touched={formik.touched.ip_direccion as boolean | undefined}
            />
            <CustomInput
              label="Puerto"
              name="puerto"
              placeholder="Ej: 554"
              value={formik.values.puerto ?? ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.puerto}
              touched={formik.touched.puerto as boolean | undefined}
            />
            <CustomInput
              label="Usuario RTSP"
              name="usuario_rtsp"
              placeholder="Ej: admin"
              value={formik.values.usuario_rtsp ?? ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.usuario_rtsp}
              touched={formik.touched.usuario_rtsp as boolean | undefined}
            />
            <CustomInput
              label="Contraseña / Código RTSP"
              name="password_rtsp"
              type="password"
              placeholder="••••••••"
              value={formik.values.password_rtsp ?? ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.password_rtsp}
              touched={formik.touched.password_rtsp as boolean | undefined}
            />
          </>
        )}
        {esFallbackPhone && (
          <div className="px-3 py-2.5 rounded-md border border-slate-200 bg-blue-50 text-xs text-blue-700 leading-relaxed">
            <span className="flex items-center gap-1">
              <Smartphone size={14} />
            </span>{" "}
            Al guardar, aparecerá un botón con ícono de teléfono en la tabla.
            Haz clic en él para obtener el QR y el enlace que debes compartir
            con el teléfono.
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
};
