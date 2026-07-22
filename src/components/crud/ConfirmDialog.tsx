import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/Button";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  loading,
  error,
}: Props) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-12 w-12 rounded-full bg-danger-50 flex items-center justify-center mb-3">
            <AlertTriangle size={24} className="text-danger-500" />
          </div>
          <div className="text-lg font-bold text-slate-900">
            {title}
          </div>
          <div className="mt-1 text-sm text-slate-500">
            {message}
          </div>
          {error && (
            <div className="mt-3 rounded-md border border-danger-400 bg-danger-50 px-3 py-2 text-xs font-medium text-danger-600">
              {error}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-10 px-4 rounded-md bg-linear-to-r from-danger-500 to-danger-600 text-white hover:from-danger-600 hover:to-danger-600 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? "Eliminando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
