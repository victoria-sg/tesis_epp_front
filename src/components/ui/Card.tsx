import type { ReactNode } from "react";

interface CardProps {
  variant?: "default" | "stat" | "clickable" | "modal";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
}

const variantClasses: Record<string, string> = {
  default: "bg-white border border-slate-200 rounded-md",
  stat: "bg-white border border-slate-200 rounded-md p-5",
  clickable:
    "bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer",
  modal: "bg-white rounded-xl shadow-xl w-full max-w-md p-6",
};

const paddingClasses: Record<string, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export const Card = ({
  variant = "default",
  padding = "md",
  className = "",
  children,
  onClick,
}: CardProps) => {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${variantClasses[variant]} ${variant === "default" ? paddingClasses[padding] : ""} ${className}`}
      >
        {children}
      </button>
    );
  }
  return (
    <div
      className={`${variantClasses[variant]} ${variant === "default" ? paddingClasses[padding] : ""} ${className}`}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title: string;
  count?: number;
  action?: ReactNode;
  className?: string;
}

export const CardHeader = ({ title, count, action, className = "" }: CardHeaderProps) => (
  <div className={`px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4 ${className}`}>
    <div className="text-base font-semibold text-slate-900">
      {title}{" "}
      {count !== undefined && (
        <span className="text-slate-500 font-normal">· {count}</span>
      )}
    </div>
    {action}
  </div>
);

interface StatCardProps {
  icon?: ReactNode;
  iconBgClass?: string;
  iconColorClass?: string;
  label: string;
  value: string | number;
  subtitle?: ReactNode;
  trend?: { value: number; positive: boolean };
  horizontal?: boolean;
  className?: string;
}

export const StatCard = ({
  icon,
  iconBgClass = "bg-slate-100",
  iconColorClass = "text-slate-600",
  label,
  value,
  subtitle,
  trend,
  horizontal,
  className = "",
}: StatCardProps) => {
  if (horizontal) {
    return (
      <div
        className={`bg-white border border-slate-200 rounded-md p-4 flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${className}`}
      >
        {icon && (
          <div className={`h-10 w-10 rounded-lg ${iconBgClass} flex items-center justify-center shrink-0`}>
            <span className={iconColorClass}>{icon}</span>
          </div>
        )}
        <div className="min-w-0">
          <div className="text-xl font-bold text-slate-900 tabular-nums leading-tight">
            {value}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{label}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white border border-slate-200 rounded-md p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest leading-none">
            {label}
          </span>
        </div>
        {icon && (
          <div className={`h-10 w-10 rounded-lg ${iconBgClass} flex items-center justify-center shrink-0 ml-3`}>
            <span className={iconColorClass}>{icon}</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900 tabular-nums leading-tight">
        {value}
      </div>
      {trend && (
        <div className={`mt-1.5 flex items-center gap-1 text-xs font-semibold ${trend.positive ? "text-success-500" : "text-danger-500"}`}>
          <span>{trend.positive ? "▲" : "▼"}</span>
          <span>{Math.abs(trend.value)}%</span>
        </div>
      )}
      {subtitle && (
        <div className="mt-1.5 text-xs text-slate-500 leading-relaxed">{subtitle}</div>
      )}
    </div>
  );
};
