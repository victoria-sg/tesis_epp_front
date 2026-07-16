import * as Yup from "yup";

export const tipoSchema = Yup.object({
  nombre_epp: Yup.string()
    .required("El nombre del EPP es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  descripcion: Yup.string().nullable().max(255, "Máximo 255 caracteres"),
  clase_yolo: Yup.string().nullable(),
  clase_positiva: Yup.string().required("La clase positiva es obligatoria"),
  clase_negativa: Yup.string().nullable(),
  activo: Yup.boolean(),
  usar_modelo_principal: Yup.boolean(),
  usar_modelo_personalizado: Yup.boolean(),
  modelo_personalizado_path: Yup.string().nullable(),
  modo_alerta: Yup.string()
    .oneOf([
      "ausencia_requerida",
      "negativa_detectada",
      "presencia_prohibida",
      "solo_deteccion",
    ])
    .required("Selecciona un modo de alerta"),
  id_rol: Yup.number().nullable().typeError("Selecciona un rol"),
});

export type TipoFormValues = Yup.InferType<typeof tipoSchema>;
