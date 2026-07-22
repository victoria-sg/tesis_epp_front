import { Eye, EyeOff, LogOut } from "lucide-react";
import { useState } from "react";
import { CustomInput } from "../../components/form/CustomInput";
import { Button } from "../../components/ui/Button";
import { useChangePasswordFirst } from "../../controllers/useChangePasswordFirst";

export const CambiarPasswordPrimerInicioView = () => {
  const [showPasswords, setShowPasswords] = useState({
    actual: false,
    nueva: false,
    confirmar: false,
  });
  const { user, formik, success, serverError, handleSubmit, handleLogout } =
    useChangePasswordFirst();

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-10">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl shadow-slate-900/40 ring-1 ring-white/40 p-10 md:p-12 text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-lg shadow-success-500/30 bg-white">
              <img
                src="/logo.png"
                alt="EPP Monitor"
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-[-0.01em]">
              Contraseña actualizada
            </div>
            <div className="text-sm text-slate-700">
              Tu contraseña ha sido cambiada exitosamente. Ahora puedes iniciar
              sesión con tu nueva contraseña.
            </div>
            <Button
              variant="primary"
              className="w-full h-12"
              onClick={handleLogout}
            >
              Ir a iniciar sesión
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-10">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl shadow-slate-900/40 ring-1 ring-white/40 p-10 md:p-12">
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-lg shadow-purple-500/30 bg-white">
            <img
              src="/logo.png"
              alt="EPP Monitor"
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>
          <div className="text-2xl font-bold text-slate-900 text-center tracking-[-0.01em]">
            Cambio de contraseña requerido
          </div>
          <div className="text-sm text-slate-500 text-center">
            Por ser tu primer inicio de sesión, debes cambiar tu contraseña.
          </div>
          {user && (
            <div className="text-xs text-blue-600 font-medium">
              {user.nombre} {user.apelido} — {user.rolLabel}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <CustomInput
            label="Contraseña actual"
            type={showPasswords.actual ? "text" : "password"}
            placeholder="••••••••••••"
            name="password_actual"
            value={formik.values.password_actual}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.password_actual}
            touched={formik.touched.password_actual}
            autoFocus
            suffix={
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((s) => ({ ...s, actual: !s.actual }))
                }
                className="text-slate-500 hover:text-brand-500 transition-colors pointer-events-auto"
                tabIndex={-1}
              >
                {showPasswords.actual ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            }
          />

          <CustomInput
            label="Nueva contraseña"
            type={showPasswords.nueva ? "text" : "password"}
            placeholder="••••••••••••"
            name="nueva_contrasena"
            value={formik.values.nueva_contrasena}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.nueva_contrasena}
            touched={formik.touched.nueva_contrasena}
            suffix={
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((s) => ({ ...s, nueva: !s.nueva }))
                }
                className="text-slate-500 hover:text-brand-500 transition-colors pointer-events-auto"
                tabIndex={-1}
              >
                {showPasswords.nueva ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <div className="text-xs text-slate-500 -mt-2">
            Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un
            carácter especial.
          </div>

          <CustomInput
            label="Confirmar nueva contraseña"
            type={showPasswords.confirmar ? "text" : "password"}
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
                onClick={() =>
                  setShowPasswords((s) => ({ ...s, confirmar: !s.confirmar }))
                }
                className="text-slate-500 hover:text-brand-500 transition-colors pointer-events-auto"
                tabIndex={-1}
              >
                {showPasswords.confirmar ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            }
          />

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
            {formik.isSubmitting ? "Cambiando..." : "Cambiar contraseña"}
          </Button>

          <Button
            variant="text"
            icon={<LogOut size={14} />}
            onClick={handleLogout}
            className="w-full justify-center hover:text-red-500"
          >
            Cerrar sesión
          </Button>
        </form>
      </div>
    </div>
  );
};
