import { ArrowLeft, MailCheck, ShieldCheck } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { CustomInput } from "../../components/form/CustomInput";
import { useForgotPassword } from "../../controllers/useForgotPassword";

interface Props {
  onBackToLogin: () => void;
}

export const OlvidePasswordView = ({ onBackToLogin }: Props) => {
  const { formik, enviado, serverError, handleSubmit } = useForgotPassword();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-[#0a1628] via-[#0f2744] to-[#1a3a5c] px-6 py-10">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl shadow-slate-900/40 ring-1 ring-white/40 p-10 md:p-12">
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center shadow-lg shadow-purple-500/30">
            <ShieldCheck className="h-8 w-8 text-white" strokeWidth={1.75} />
          </div>
          <div className="text-2xl font-bold text-slate-900 text-center tracking-[-0.01em]">
            Recuperar contraseña
          </div>
          <div className="text-sm text-gray-500 text-center">
            Ingresa tu correo y te enviaremos un enlace para definir una
            contraseña nueva.
          </div>
        </div>

        {enviado ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <MailCheck className="h-10 w-10 text-emerald-600" />
            <div className="text-sm text-slate-700">
              Te enviamos un enlace de recuperación a tu correo. Revisa tu
              bandeja de entrada (y la carpeta de spam) en los próximos minutos.
            </div>
            <Button
              variant="text"
              onClick={onBackToLogin}
            >
              Volver a iniciar sesión
            </Button>
          </div>
        ) : (
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
              {formik.isSubmitting ? "Enviando..." : "Enviar enlace"}
            </Button>

            <Button
              variant="text"
              icon={<ArrowLeft size={14} />}
              onClick={onBackToLogin}
              className="w-full justify-center"
            >
              Volver a iniciar sesión
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
