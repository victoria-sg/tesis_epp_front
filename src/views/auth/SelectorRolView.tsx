import { ArrowRight, Lock, X } from "lucide-react";
import { useRoleSelector } from "../../controllers/useRoleSelector";
import type { Rol } from "../../models/auth.model";
import { ROLE_INFO, ROLE_STYLES } from "../../models/auth.model";

interface Props {
  onSelect: (rol: Rol) => void;
  onClose?: () => void;
}

export const SelectorRolView = ({ onSelect, onClose }: Props) => {
  const { roles, onSelect: handleSelect } = useRoleSelector({ onSelect });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/40">
      <div className="relative z-10 w-full max-w-2xl my-auto bg-white rounded-2xl shadow-2xl ring-1 ring-black/10 p-12">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        )}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="w-14 h-14 rounded-xl overflow-hidden shadow-md bg-white">
              <img
                src="/logo.png"
                alt="EPP Monitor"
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
            <div className="text-left">
              <div className="text-2xl font-extrabold text-slate-900 tracking-[0.02em] leading-none">
                EPP Monitor
              </div>
              <div className="text-xs font-bold text-brand-600 tracking-[0.18em] uppercase mt-1.5">
                Sistema de Gestión
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-[-0.01em]">
            Bienvenido al sistema
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Selecciona el perfil con el que deseas iniciar sesión
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map(({ rol }) => {
            const style = ROLE_STYLES[rol];
            const info = ROLE_INFO[rol];

            return (
              <button
                key={rol}
                onClick={() => handleSelect(rol)}
                className={`group flex flex-col items-center text-center rounded-xl bg-white border border-slate-200 px-5 py-6 transition-all hover:shadow-md ${style.ring}`}
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md mb-4">
                  <img
                    src={style.icon}
                    alt={rol}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-base font-bold text-slate-900 leading-tight">
                  {info.title}
                </div>
                <div className="text-sm text-slate-500 mt-1 leading-relaxed">
                  {info.subtitle}
                </div>
                <ArrowRight
                  className="mt-3 w-5 h-5 transition-transform group-hover:translate-x-1"
                  style={{ color: style.hex }}
                />
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
          <Lock className="w-3.5 h-3.5" />
          <span className="text-xs">
            Conexión segura · Seguridad que te protege, tecnología que te cuida.
          </span>
        </div>
      </div>
    </div>
  );
};
