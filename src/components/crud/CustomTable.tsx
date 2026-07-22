import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (item: T, index: number) => ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  startIndex?: number;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export const CustomTable = <T,>({
  columns,
  data,
  keyExtractor,
  startIndex = 0,
  onRowClick,
  emptyMessage = "No se encontraron registros.",
}: Props<T>) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-slate-100">
        <tr className="border-b border-slate-200">
          {columns.map((col) => (
            <th
              key={col.key}
              className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"}`}
              style={{ width: col.width }}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              className="px-4 py-12 text-center text-sm text-slate-500"
            >
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map((item, idx) => (
            <tr
              key={keyExtractor(item)}
              className={`border-b border-slate-200 last:border-0 hover:bg-slate-50 ${onRowClick ? "cursor-pointer" : ""}`}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3.5 text-sm text-slate-800 ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"}`}
                >
                  {col.render
                    ? col.render(item, startIndex + idx)
                    : String((item as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);
