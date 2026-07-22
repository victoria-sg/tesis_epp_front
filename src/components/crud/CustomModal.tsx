import { X } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export const CustomModal = ({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
}: Props) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl shadow-xl w-full ${maxWidth} max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="text-lg font-bold text-slate-900 tracking-tight">
            {title}
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-500"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
};
