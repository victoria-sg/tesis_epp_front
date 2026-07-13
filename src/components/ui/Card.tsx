import type { ReactNode } from "react";

interface CardProps {
  variant?: "default" | "stat" | "clickable" | "modal";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
}

const variantClasses: Record<string, string> = {
  default: "bg-white border border-[#e5e5e5] rounded-lg",
  stat: "bg-white border border-[#e5e5e5] rounded-lg p-5",
  clickable:
    "bg-white border border-[#e5e5e5] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer",
  modal: "bg-white rounded-2xl shadow-2xl w-full max-w-md p-6",
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
  <div className={`px-5 py-4 border-b border-[#ececec] flex items-center justify-between gap-4 ${className}`}>
    <div className="text-[15px] font-semibold text-[#000]">
      {title}{" "}
      {count !== undefined && (
        <span className="text-[#6b6b6b] font-normal">· {count}</span>
      )}
    </div>
    {action}
  </div>
);

interface StatCardProps {
  icon: ReactNode;
  iconBgClass: string;
  iconColorClass: string;
  label: string;
  value: string | number;
  subtitle?: ReactNode;
  className?: string;
}

export const StatCard = ({
  icon,
  iconBgClass,
  iconColorClass,
  label,
  value,
  subtitle,
  className = "",
}: StatCardProps) => (
  <div className={`stat-card ${className}`}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-label">{label}</span>
      <div className={`h-8 w-8 rounded-md ${iconBgClass} flex items-center justify-center`}>
        <span className={iconColorClass}>{icon}</span>
      </div>
    </div>
    <div className="text-number">{value}</div>
    {subtitle && <div className="mt-1 text-small">{subtitle}</div>}
  </div>
);
