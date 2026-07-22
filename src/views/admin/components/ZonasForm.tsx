import type { FormikProps } from "formik";
import { Shirt, ShieldAlert, AlertTriangle, Shield } from "lucide-react";

import { Button } from "../../../components/ui/Button";
import { CustomCheckbox } from "../../../components/form/CustomCheckbox";
import { CustomInput } from "../../../components/form/CustomInput";
import { CustomModal } from "../../../components/crud/CustomModal";
import { CustomSelect } from "../../../components/form/CustomSelect";
import { NIVEL_RIESGO_CONFIG } from "../../../models/zona.model";

import type { TipoEPP } from "../../../models/tipo.model";
import type { ZonaFormValues } from "../../../validators/zona.schema";

interface ZonasFormProps {
  open: boolean;
  isEditing: boolean;
  onClose: () => void;
  formik: FormikProps<ZonaFormValues>;
  onSubmit: (e: React.FormEvent) => void;
  submitLoading: boolean;
  error: string | null;
  tiposEpp: TipoEPP[];
  nivelesRiesgo: string[];
  nivelInferido: string | null;
  onToggleEpp: (id: number) => void;
}

const NivelRiesgoBadge = ({ nivel }: { nivel: string | null | undefined }) => {
  if (!nivel) return <span className="text-muted">—</span>;
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

export const ZonasForm = ({
  open,
  isEditing,
  onClose,
  formik,
  onSubmit,
  submitLoading,
  error,
  tiposEpp,
  nivelesRiesgo,
  nivelInferido,
  onToggleEpp,
}: ZonasFormProps) => (
  <CustomModal
    open={open}
    onClose={onClose}
    title={isEditing ? "Editar Zona" : "Nueva Zona"}
  >
    <form onSubmit={onSubmit} className="space-y-4">
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
          options={(nivelesRiesgo ?? []).map((n) => {
            const config = NIVEL_RIESGO_CONFIG[n as keyof typeof NIVEL_RIESGO_CONFIG];
            return { value: n, label: config?.label ?? n };
          })}
          placeholder="Dejar vacío para detectar automáticamente…"
          error={formik.errors.nivel_riesgo}
          touched={formik.touched.nivel_riesgo as boolean | undefined}
        />
        {nivelInferido && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="text-xs text-gray-500">
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
          <label className="block mb-1.5 text-xs font-semibold text-gray-800">
            EPP Requeridos
          </label>
          <div className="flex flex-wrap gap-2 p-2 border border-slate-200 rounded-md bg-slate-50">
            {tiposEpp.map((tipo) => {
              const selected = (formik.values.epp_ids ?? []).includes(
                tipo.id_tipo_epp,
              );
              return (
                <CustomCheckbox
                  key={tipo.id_tipo_epp}
                  label={tipo.nombre_epp}
                  checked={selected}
                  onChange={() => onToggleEpp(tipo.id_tipo_epp)}
                  variant="hidden"
                  icon={<Shirt size={14} />}
                />
              );
            })}
          </div>
        </div>
      )}
      {error && (
        <div className="text-[12px] text-red-600 text-center">{error}</div>
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
