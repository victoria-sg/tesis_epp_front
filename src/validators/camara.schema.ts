import * as Yup from "yup";

export const camaraSchema = Yup.object({
  id_zona: Yup.number()
    .transform((val) => (val === "" ? undefined : val))
    .typeError("Selecciona una zona")
    .required("La zona es obligatoria")
    .min(1, "Selecciona una zona válida"),
  codigo_camara: Yup.string()
    .required("El código de cámara es obligatorio")
    .max(50, "Máximo 50 caracteres"),
  tipo_fuente: Yup.string()
    .required("El tipo de fuente es obligatorio")
    .oneOf(
      ["hikvision", "ezviz", "rtsp_generic", "fallback_phone"],
      "Tipo de fuente no válido",
    ),
  ip_direccion: Yup.string().nullable().max(45, "Máximo 45 caracteres"),
  puerto: Yup.number()
    .nullable()
    .transform((val) => (val === "" ? null : val))
    .min(1, "Puerto mínimo 1")
    .max(65535, "Puerto máximo 65535")
    .typeError("Ingresa un número válido"),
  usuario_rtsp: Yup.string().nullable().max(100, "Máximo 100 caracteres"),
  password_rtsp: Yup.string().nullable().max(255, "Máximo 255 caracteres"),
});

export type CamaraFormValues = Yup.InferType<typeof camaraSchema>;
