import * as Yup from "yup";

export const zonaSchema = Yup.object({
  nombre_zona: Yup.string()
    .required("El nombre de la zona es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  nivel_riesgo: Yup.string()
    .nullable()
    .oneOf(["bajo", "medio", "alto"], "Nivel de riesgo no válido"),
  tiempo_toleracia_segundo: Yup.number()
    .nullable()
    .typeError("Debe ser un número")
    .min(0, "Mínimo 0"),
  epp_ids: Yup.array().of(Yup.number()).nullable(),
});

export type ZonaFormValues = Yup.InferType<typeof zonaSchema>;
