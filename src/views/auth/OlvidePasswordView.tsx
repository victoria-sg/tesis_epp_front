import { ArrowLeft, MailCheck, X } from "lucide-react";
import { CustomInput } from "../../components/form/CustomInput";
import { Button } from "../../components/ui/Button";
import { useForgotPassword } from "../../controllers/useForgotPassword";

interface Props {
  onClose: () => void;
}

export const OlvidePasswordView = ({ onClose }: Props) => {
  const { formik, enviado, serverError, handleSubmit } = useForgotPassword();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/40">
      <div className="relative z-10 w-full max-w-md my-auto bg-white rounded-2xl shadow-2xl ring-1 ring-black/10 p-10 md:p-12">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-lg shadow-purple-500/30 bg-white">
            <img
              src="/logo.png"
              alt="EPP Monitor"
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>
          <div className="text-2xl font-bold text-slate-900 text-center tracking-[-0.01em]">
            Recuperar contraseña
          </div>
          <div className="text-sm text-slate-500 text-center">
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
            <Button variant="text" onClick={onClose}>
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
              onClick={onClose}
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
