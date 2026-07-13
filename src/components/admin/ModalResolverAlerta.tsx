import { X } from "lucide-react";
import { Button } from "../ui/Button";
import { CustomTextArea } from "../form/CustomTextArea";
import type { AlertaReporte } from "../../models/reporte.model";

interface AlertResolveModalProps {
  alerta: AlertaReporte;
  comentario: string;
  onComentarioChange: (value: string) => void;
  loading: boolean;
  error: string | null;
  onResolve: () => void;
  onClose: () => void;
}

export const ModalResolverAlerta = ({
  alerta,
  comentario,
  onComentarioChange,
  loading,
  error,
  onResolve,
  onClose,
}: AlertResolveModalProps) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              Resolver alerta
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Cámara: {alerta.codigo_camara} · Zona:{" "}
              {alerta.nombre_zona}
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {alerta.captura_frame && (
          <img
            src={alerta.captura_frame}
            alt="Captura de la incidencia"
            className="w-full h-40 object-cover rounded-lg mb-4 border border-[#e5e5e5]"
          />
        )}

        <div className="mb-4">
          <CustomTextArea
            label="Comentario / justificación *"
            value={comentario}
            onChange={(e) => onComentarioChange(e.target.value)}
            placeholder="Describe qué ocurrió y cómo se resolvió la incidencia…"
            rows={4}
            error={error ?? undefined}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="secondary" onClick={onResolve} disabled={loading || !comentario.trim()}>
            {loading ? "Guardando…" : "Marcar como resuelta"}
          </Button>
        </div>
      </div>
    </div>
  );
};
