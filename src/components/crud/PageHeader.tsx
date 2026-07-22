import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const PageHeader = ({ title, subtitle, action }: Props) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <div className="text-2xl font-bold text-slate-900 tracking-tight">
        {title}
      </div>
      {subtitle && (
        <div className="mt-1 text-sm text-slate-500">
          {subtitle}
        </div>
      )}
    </div>
    {action && <div>{action}</div>}
  </div>
);