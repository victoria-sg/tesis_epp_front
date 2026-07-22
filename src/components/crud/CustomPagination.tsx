import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const CustomPagination = ({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: Props) => {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200">
      <div className="text-xs text-slate-500 tabular-nums">
        {start}–{end} de {total}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-8 w-8 rounded-md border border-slate-300 flex items-center justify-center disabled:opacity-30 hover:bg-slate-100 transition-colors text-slate-600"
        >
          <ChevronLeft size={14} />
        </button>

        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          let pageNum: number;
          if (totalPages <= 7) {
            pageNum = i + 1;
          } else if (page <= 4) {
            pageNum = i + 1;
          } else if (page >= totalPages - 3) {
            pageNum = totalPages - 6 + i;
          } else {
            pageNum = page - 3 + i;
          }
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`h-8 min-w-8 rounded-md flex items-center justify-center text-xs transition-all ${
                page === pageNum
                  ? "bg-linear-to-r from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "border border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="h-8 w-8 rounded-md border border-slate-300 flex items-center justify-center disabled:opacity-30 hover:bg-slate-100 transition-colors text-slate-600"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
