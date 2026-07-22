import { ChevronLeft, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { CustomInput } from "../../components/form/CustomInput";
import { Button } from "../../components/ui/Button";
import { useLogin } from "../../controllers/useLogin";
import type { Rol } from "../../models/auth.model";
import { ROLE_STYLES } from "../../models/auth.model";

interface Props {
  selectedRol: Rol | null;
  selectedRolLabel: string | null;
  onOpenResetPassword: () => void;
  onOpenRoleSelector: () => void;
}

export const InicioSesionView = ({
  selectedRol,
  selectedRolLabel,
  onOpenResetPassword,
  onOpenRoleSelector,
}: Props) => {
  const [showPass, setShowPass] = useState(false);

  const { formik, serverError, handleSubmit } = useLogin({
    selectedRol,
  });

  const style = selectedRol ? ROLE_STYLES[selectedRol] : null;

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 w-full h-full bg-white" />

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-stretch">
        <div
          className="relative flex-1 bg-cover bg-center flex items-center justify-center"
          style={{ backgroundImage: "url('/login.jpeg')" }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 text-center px-6">
            <div className="flex flex-col items-center gap-5">
              <div className="h-32 w-32 rounded-3xl  flex items-center justify-center  p-5">
                <img
                  src="/logo.png"
                  alt="EPP Monitor"
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>
              <div className="text-[48px] font-extrabold tracking-[0.02em] text-brand-100 leading-tight">
                EPP MONITOR
              </div>
            </div>
            <div className="mt-8 text-2xl leading-[1.5] text-brand-200 font-semibold">
              Sistema de Monitoreo de
              <br />
              Equipos de Protección Personal
            </div>
            <div className="mt-10 text-base tracking-[0.02em] text-brand-300 font-medium">
              Seguridad pública, protección siempre
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 md:p-16">
          <div className="w-full max-w-xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl shadow-slate-900/40 ring-1 ring-white/40 p-12 md:p-16">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="text"
                size="sm"
                icon={<ChevronLeft size={16} />}
                onClick={onOpenRoleSelector}
              >
                {selectedRol ? "Cambiar rol" : "Seleccionar rol"}
              </Button>
              {selectedRol && selectedRolLabel && (
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-linear-to-r ${style?.gradient} text-white shadow-lg`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
                  <span className="text-xs font-bold tracking-[0.04em]">
                    {selectedRolLabel}
                  </span>
                </div>
              )}
            </div>

            <div className="text-center mb-6 mt-2 text-2xl font-bold text-slate-900 tracking-[-0.01em]">
              Iniciar Sesión
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <CustomInput
                label="Correo electrónico"
                type="email"
                placeholder="tucorreo@empresa.com"
                name="correo"
                value={formik.values.correo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.correo}
                touched={formik.touched.correo}
                autoFocus
                prefix={<Mail size={16} />}
              />

              <CustomInput
                label="Contraseña"
                type={showPass ? "text" : "password"}
                placeholder="••••••••••••"
                name="contrasena"
                value={formik.values.contrasena}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.contrasena}
                touched={formik.touched.contrasena}
                prefix={<Lock size={16} />}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="text-slate-500 hover:text-brand-500 transition-colors pointer-events-auto"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              {serverError && (
                <div className="text-xs text-red-600 text-center">
                  {serverError}
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="text" onClick={onOpenResetPassword}>
                  ¿Olvidaste tu contraseña?
                </Button>
              </div>

              <Button
                type="submit"
                disabled={
                  !selectedRol || !formik.isValid || formik.isSubmitting
                }
                variant={
                  !selectedRol
                    ? "primary"
                    : selectedRol === "admin"
                      ? "secondary"
                      : selectedRol === "sso"
                        ? "warning"
                        : "primary"
                }
                className={`w-full h-12 ${style?.gradient || ""}`}
              >
                {formik.isSubmitting ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
