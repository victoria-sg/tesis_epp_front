import { Eye, EyeOff, ShieldCheck, LogOut } from "lucide-react";
import { useFormik } from "formik";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { APP_LOGIN } from "../constants/authRoutesConstants";
import { cambiarPasswordPrimerInicio } from "../services/auth.service";
import { logout as logoutAction } from "../store/authSlice";
import type { RootState } from "../store";
import { passwordSeguraSchema, confirmarPasswordSchema } from "../validators/password.rules";

const changePasswordSchema = Yup.object({
  password_actual: Yup.string().required("La contraseña actual es obligatoria"),
  nueva_contrasena: passwordSeguraSchema,
  confirmar_contrasena: confirmarPasswordSchema("nueva_contrasena"),
});

interface FormValues {
  password_actual: string;
  nueva_contrasena: string;
  confirmar_contrasena: string;
}

export const ChangePasswordFirstView = () => {
  const [showPasswords, setShowPasswords] = useState({ actual: false, nueva: false, confirmar: false });
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    navigate(APP_LOGIN, { replace: true });
    return null;
  }

  const formik = useFormik<FormValues>({
    initialValues: { password_actual: "", nueva_contrasena: "", confirmar_contrasena: "" },
    validationSchema: changePasswordSchema,
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
          const errMsg = (err as { response?: { data?: { msg?: string } } })?.response?.data?.msg;
          if (errMsg) msg = errMsg;
        }
        setServerError(msg);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    formik.submitForm();
  };

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#0f2744] to-[#1a3a5c] px-6 py-10">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl shadow-slate-900/40 ring-1 ring-white/40 p-10 md:p-12 text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center shadow-lg shadow-green-500/30">
              <ShieldCheck className="h-8 w-8 text-white" strokeWidth={1.75} />
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-[-0.01em]">
              Contraseña actualizada
            </div>
            <div className="text-[14px] text-slate-700">
              Tu contraseña ha sido cambiada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.
            </div>
            <Button
              onClick={() => navigate(APP_LOGIN, { replace: true })}
              className="w-full h-12 rounded-md bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white shadow-lg"
              style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.02em" }}
            >
              Ir a iniciar sesión
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#0f2744] to-[#1a3a5c] px-6 py-10">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl shadow-slate-900/40 ring-1 ring-white/40 p-10 md:p-12">
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] flex items-center justify-center shadow-lg shadow-purple-500/30">
            <ShieldCheck className="h-8 w-8 text-white" strokeWidth={1.75} />
          </div>
          <div className="text-2xl font-bold text-slate-900 text-center tracking-[-0.01em]">
            Cambio de contraseña requerido
          </div>
          <div className="text-[13px] text-[#6b6b6b] text-center">
            Por ser tu primer inicio de sesión, debes cambiar tu contraseña.
          </div>
          {user && (
            <div className="text-[12px] text-blue-600 font-medium">
              {user.nombre} {user.apelido} — {user.rolLabel}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block mb-1.5 text-[12px] text-[#1a1a1a] font-semibold">
              Contraseña actual
            </label>
            <div className="relative">
              <Input
                type={showPasswords.actual ? "text" : "password"}
                placeholder="••••••••••••"
                name="password_actual"
                value={formik.values.password_actual}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="pr-10 rounded-md"
                style={{
                  fontSize: 14,
                  borderColor:
                    formik.touched.password_actual && formik.errors.password_actual
                      ? "#dc2626"
                      : undefined,
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPasswords((s) => ({ ...s, actual: !s.actual }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] hover:text-blue-500 transition-colors"
                tabIndex={-1}
              >
                {showPasswords.actual ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {formik.touched.password_actual && formik.errors.password_actual && (
              <div className="mt-1.5 text-[12px] text-red-600">{formik.errors.password_actual}</div>
            )}
          </div>

          
          <div>
            <label className="block mb-1.5 text-[12px] text-[#1a1a1a] font-semibold">
              Nueva contraseña
            </label>
            <div className="relative">
              <Input
                type={showPasswords.nueva ? "text" : "password"}
                placeholder="••••••••••••"
                name="nueva_contrasena"
                value={formik.values.nueva_contrasena}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="pr-10 rounded-md"
                style={{
                  fontSize: 14,
                  borderColor:
                    formik.touched.nueva_contrasena && formik.errors.nueva_contrasena
                      ? "#dc2626"
                      : undefined,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPasswords((s) => ({ ...s, nueva: !s.nueva }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] hover:text-blue-500 transition-colors"
                tabIndex={-1}
              >
                {showPasswords.nueva ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {formik.touched.nueva_contrasena && formik.errors.nueva_contrasena && (
              <div className="mt-1.5 text-[12px] text-red-600">{formik.errors.nueva_contrasena}</div>
            )}
            <div className="mt-1 text-[11px] text-[#6b6b6b]">
              Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.
            </div>
          </div>

          
          <div>
            <label className="block mb-1.5 text-[12px] text-[#1a1a1a] font-semibold">
              Confirmar nueva contraseña
            </label>
            <div className="relative">
              <Input
                type={showPasswords.confirmar ? "text" : "password"}
                placeholder="••••••••••••"
                name="confirmar_contrasena"
                value={formik.values.confirmar_contrasena}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="pr-10 rounded-md"
                style={{
                  fontSize: 14,
                  borderColor:
                    formik.touched.confirmar_contrasena && formik.errors.confirmar_contrasena
                      ? "#dc2626"
                      : undefined,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPasswords((s) => ({ ...s, confirmar: !s.confirmar }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] hover:text-blue-500 transition-colors"
                tabIndex={-1}
              >
                {showPasswords.confirmar ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {formik.touched.confirmar_contrasena && formik.errors.confirmar_contrasena && (
              <div className="mt-1.5 text-[12px] text-red-600">{formik.errors.confirmar_contrasena}</div>
            )}
          </div>

          {serverError && (
            <div className="text-[12px] text-red-600 text-center">{serverError}</div>
          )}

          <Button
            type="submit"
            disabled={!formik.isValid || formik.isSubmitting}
            className="w-full h-12 rounded-md bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white shadow-lg disabled:bg-[#d4d4d4] disabled:text-[#9a9a9a] disabled:shadow-none transition-all"
            style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.02em" }}
          >
            {formik.isSubmitting ? "Cambiando..." : "Cambiar contraseña"}
          </Button>

          <button
            type="button"
            onClick={() => {
              dispatch(logoutAction());
              navigate(APP_LOGIN, { replace: true });
            }}
            className="w-full flex items-center justify-center gap-1.5 text-[13px] text-[#6b6b6b] hover:text-red-500 transition-colors"
          >
            <LogOut size={14} /> Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
};
