import * as Yup from "yup";

export const buildUsuarioSchema = (isEditing: boolean) =>
  Yup.object({
    nombre: Yup.string()
      .required("El nombre es obligatorio")
      .max(100, "Maximo 100 caracteres"),
    apelido: Yup.string()
      .required("El apellido es obligatorio")
      .max(100, "Maximo 100 caracteres"),
    correo: Yup.string()
      .email("Correo no valido")
      .required("El correo es obligatorio"),
    id_rol: Yup.number()
      .typeError("Selecciona un rol")
      .min(1, "Selecciona un rol")
      .required("El rol es obligatorio"),
    cedula: isEditing
      ? Yup.string()
          .matches(/^\d{10}$/, "La cedula debe tener exactamente 10 digitos")
          .notRequired()
      : Yup.string()
          .matches(/^\d{10}$/, "La cedula debe tener exactamente 10 digitos")
          .required("La cedula es obligatoria"),
    zonas_asignadas: Yup.array()
      .of(Yup.number())
      .when("id_rol", {
        is: (idRol: number | string) => Number(idRol) === 2,
        then: (schema) =>
          schema.min(1, "El supervisor debe estar asignado al menos a una zona"),
        otherwise: (schema) => schema,
      }),
  });

export interface UsuarioFormValues {
  nombre: string;
  apelido: string;
  correo: string;
  id_rol: number | "";
  cedula?: string;
  zonas_asignadas: number[];
  [key: string]: unknown;
}
