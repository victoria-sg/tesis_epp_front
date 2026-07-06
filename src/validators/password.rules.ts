import * as Yup from "yup";


export const passwordSeguraSchema = Yup.string()
  .required("La contraseña es obligatoria")
  .min(8, "Mínimo 8 caracteres")
  .matches(/[a-z]/, "Debe incluir al menos una letra minúscula")
  .matches(/[A-Z]/, "Debe incluir al menos una letra mayúscula")
  .matches(/\d/, "Debe incluir al menos un número")
  .matches(/[^A-Za-z0-9]/, "Debe incluir al menos un carácter especial");

export const confirmarPasswordSchema = (ref: string) =>
  Yup.string()
    .required("Confirma la contraseña")
    .oneOf([Yup.ref(ref)], "Las contraseñas no coinciden");
