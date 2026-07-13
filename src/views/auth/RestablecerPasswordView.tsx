import {
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { CustomInput } from "../../components/form/CustomInput";
import { useResetPassword } from "../../controllers/useResetPassword";

export const RestablecerPasswordView = () => {
  const { formik, serverError, exito, handleSubmit, tokenPresente, goToLogin } =
    useResetPassword();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-[#0a1628] via-[#0f2744] to-[#1a3a5c] px-6 py-10">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl shadow-slate-900/40 ring-1 ring-white/40 p-10 md:p-12">
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center shadow-lg shadow-purple-500/30">
            <ShieldCheck className="h-8 w-8 text-white" strokeWidth={1.75} />
          </div>
          <div className="text-2xl font-bold text-slate-900 text-center tracking-[-0.01em]">
            Nueva contraseña
          </div>
        </div>

        {!tokenPresente ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <ShieldAlert className="h-10 w-10 text-amber-500" />
            <div className="text-sm text-slate-700">
              Este enlace no es válido. Solicita uno nuevo desde la pantalla de
              inicio de sesión.
            </div>
            <Button variant="text" onClick={goToLogin}>
              Ir a iniciar sesión
            </Button>
          </div>
        ) : exito ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            <div className="text-sm text-slate-700">
              Tu contraseña fue actualizada correctamente.
            </div>
            <Button variant="secondary" className="w-full h-12" onClick={goToLogin}>
              Iniciar sesión
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <CustomInput
              label="Nueva contraseña"
              type={showPass ? "text" : "password"}
              placeholder="••••••••••••"
              name="nueva_contrasena"
              value={formik.values.nueva_contrasena}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.nueva_contrasena}
              touched={formik.touched.nueva_contrasena}
              autoFocus
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="text-gray-500 hover:text-blue-500 transition-colors pointer-events-auto"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <CustomInput
              label="Confirmar contraseña"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••••••"
              name="confirmar_contrasena"
              value={formik.values.confirmar_contrasena}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.confirmar_contrasena}
              touched={formik.touched.confirmar_contrasena}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="text-gray-500 hover:text-blue-500 transition-colors pointer-events-auto"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <div className="text-xs text-gray-500 -mt-1">
              Mínimo 8 caracteres, con mayúscula, minúscula, número y carácter
              especial.
            </div>

            {serverError && (
              <div className="text-xs text-red-600 text-center">
                {serverError}
              </div>
            )}

            <Button
              type="submit"
              disabled={!formik.isValid || formik.isSubmitting}
              variant="secondary"
              className="w-full h-12"
            >
              {formik.isSubmitting
                ? "Guardando..."
                : "Guardar nueva contraseña"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
