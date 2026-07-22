import { Pencil, Trash2 } from "lucide-react";

interface Props {
  onEdit?: () => void;
  onDelete?: () => void;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
}

export const ActionButtons = ({
  onEdit,
  onDelete,
  editDisabled,
  deleteDisabled,
}: Props) => (
  <div className="flex items-center justify-center gap-1">
    {onEdit && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        disabled={editDisabled}
        className="h-8 w-8 rounded-md border border-slate-300 hover:border-brand-500 hover:bg-brand-50 flex items-center justify-center disabled:opacity-30 transition-colors"
        title="Editar"
      >
        <Pencil size={13} className="text-slate-500 hover:text-brand-500" />
      </button>
    )}
    {onDelete && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        disabled={deleteDisabled}
        className="h-8 w-8 rounded-md border border-slate-300 hover:border-danger-500 hover:bg-danger-50 flex items-center justify-center disabled:opacity-30 transition-colors"
        title="Eliminar"
      >
        <Trash2 size={13} className="text-slate-500 hover:text-danger-500" />
      </button>
    )}
  </div>
);
