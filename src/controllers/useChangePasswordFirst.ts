import { useFormik } from "formik";
import * as Yup from "yup";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { APP_LOGIN } from "../constants/authRoutesConstants";
import { cambiarPasswordPrimerInicio } from "../services/auth.service";
import type { RootState } from "../store";
import { logout as logoutAction } from "../store/authSlice";
import {
  confirmarPasswordSchema,
  passwordSeguraSchema,
} from "../validators/password.rules";

interface FormValues {
  password_actual: string;
  nueva_contrasena: string;
  confirmar_contrasena: string;
}

const validationSchema = Yup.object({
  password_actual: Yup.string().required("La contraseña actual es obligatoria"),
  nueva_contrasena: passwordSeguraSchema,
  confirmar_contrasena: confirmarPasswordSchema("nueva_contrasena"),
});

export const useChangePasswordFirst = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate(APP_LOGIN, { replace: true });
  }, [isAuthenticated, navigate]);

  const formik = useFormik<FormValues>({
    initialValues: {
      password_actual: "",
      nueva_contrasena: "",
      confirmar_contrasena: "",
    },
    validationSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      setServerError(null);
      try {
        await cambiarPasswordPrimerInicio({
          password_actual: values.password_actual,
          nueva_contrasena: values.nueva_contrasena,
        });
        dispatch(logoutAction());
        setSuccess(true);
      } catch (err: unknown) {
        let msg = "Error al cambiar la contraseña";
        if (err && typeof err === "object" && "response" in err) {
          const errMsg = (err as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;
          if (errMsg) msg = errMsg;
        }
        setServerError(msg);
      }
    },
  });

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    formik.submitForm();
  }, [formik]);

  const handleLogout = useCallback(() => {
    dispatch(logoutAction());
    navigate(APP_LOGIN, { replace: true });
  }, [dispatch, navigate]);

  return {
    user,
    formik,
    success,
    serverError,
    handleSubmit,
    handleLogout,
  };
};
