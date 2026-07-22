import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "../ui/Button";
import { CustomModal } from "../crud/CustomModal";

interface Props {
  open: boolean;
  onClose: () => void;
  idClase: number;
  nombreClase: string;
  codigoPositivo: string;
  codigoNegativo: string | null;
  tieneNegativo: boolean;
  promptPositivoInicial: string | null;
  promptNegativoInicial: string | null;
  onStartLabeling: (promptPositivo: string | null, promptNegativo: string | null) => void;
  loading?: boolean;
}

export const LabelPromptModal = ({
  open,
  onClose,
  nombreClase,
  codigoPositivo,
  codigoNegativo,
  tieneNegativo,
  promptPositivoInicial,
  promptNegativoInicial,
  onStartLabeling,
  loading,
}: Props) => {
  const [promptPositivo, setPromptPositivo] = useState("");
  const [promptNegativo, setPromptNegativo] = useState("");
  const [useCodePositivo, setUseCodePositivo] = useState(false);

  useEffect(() => {
    if (open) {
      if (promptPositivoInicial) {
        setPromptPositivo(promptPositivoInicial);
      } else {
        setPromptPositivo(codigoPositivo.replace(/_/g, " ").toLowerCase());
      }
      if (promptNegativoInicial) {
        setPromptNegativo(promptNegativoInicial);
      } else if (codigoNegativo) {
        setPromptNegativo(codigoNegativo.replace(/_/g, " ").toLowerCase());
      } else {
        setPromptNegativo("");
      }
      setUseCodePositivo(false);
    }
  }, [open, promptPositivoInicial, promptNegativoInicial, codigoPositivo, codigoNegativo]);

  const handleResetToCode = () => {
    setPromptPositivo(codigoPositivo.replace(/_/g, " ").toLowerCase());
    if (codigoNegativo) {
      setPromptNegativo(codigoNegativo.replace(/_/g, " ").toLowerCase());
    }
    setUseCodePositivo(true);
  };

  const handleStart = () => {
    const pp = useCodePositivo || promptPositivo === codigoPositivo.replace(/_/g, " ").toLowerCase()
      ? null
      : promptPositivo;
    const pn = tieneNegativo && !useCodePositivo && promptNegativo !== codigoNegativo?.replace(/_/g, " ").toLowerCase()
      ? promptNegativo
      : null;
    onStartLabeling(pp, pn);
  };

  const derivedTip = codigoPositivo.replace(/_/g, " ").toLowerCase();

  return (
    <CustomModal open={open} onClose={onClose} title="¿Qué buscar en las imágenes?" maxWidth="max-w-lg">
      <div className="space-y-4">
        <div className="rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-xs text-brand-700">
          Florence-2 buscará objetos en las imágenes usando el texto que escribas.
          Un prompt más descriptivo da mejores resultados.
        </div>

        <label className="block text-xs font-semibold text-slate-800">
          ¿Qué buscas en las imágenes positivas?
          <span className="ml-1 font-normal text-slate-400">({nombreClase})</span>
          <textarea
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            rows={3}
            value={promptPositivo}
            onChange={(e) => { setPromptPositivo(e.target.value); setUseCodePositivo(false); }}
            placeholder={`Ej. un trabajador usando ${derivedTip} en una obra de construcción`}
          />
          <span className="mt-0.5 block text-[10px] text-slate-400">
            Si está vacío se usará: <code className="rounded bg-slate-100 px-1">{derivedTip}</code>
          </span>
        </label>

        {tieneNegativo && (
          <label className="block text-xs font-semibold text-slate-800">
            ¿Qué buscas en las imágenes negativas?
            {codigoNegativo && <span className="ml-1 font-normal text-slate-400">({codigoNegativo})</span>}
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              rows={2}
              value={promptNegativo}
              onChange={(e) => setPromptNegativo(e.target.value)}
              placeholder={`Ej. un trabajador sin ${derivedTip}`}
            />
          </label>
        )}

        <button
          type="button"
          onClick={handleResetToCode}
          className="text-xs text-brand-600 hover:text-brand-800 hover:underline"
        >
          Usar código de clase ({derivedTip})
        </button>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            icon={<Sparkles size={14} />}
            loading={loading}
            onClick={handleStart}
          >
            Etiquetar
          </Button>
        </div>
      </div>
    </CustomModal>
  );
};
