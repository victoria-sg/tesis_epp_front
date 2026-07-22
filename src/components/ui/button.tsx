import { LoaderCircle } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "outline" | "ghost" | "text";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
}

const variantClasses: Record<string, string> = {
  primary:
    "bg-linear-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 shadow-lg shadow-brand-500/30",
  secondary:
    "bg-linear-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/30",
  success:
    "bg-linear-to-r from-success-500 to-success-600 text-white hover:from-success-600 hover:to-green-600 shadow-lg shadow-success-500/30",
  warning:
    "bg-linear-to-r from-warning-500 to-warning-600 text-white hover:from-warning-600 hover:to-amber-600 shadow-lg shadow-warning-500/30",
  danger:
    "bg-linear-to-r from-danger-500 to-danger-600 text-white hover:from-danger-600 hover:to-danger-600 shadow-lg shadow-danger-500/30",
  outline:
    "border border-slate-300 text-slate-700 hover:bg-slate-100",
  ghost:
    "text-slate-500 hover:bg-slate-100",
  text:
    "text-brand-600 hover:underline bg-transparent p-0 h-auto shadow-none",
};

const sizeClasses: Record<string, string> = {
  sm: "h-8 px-3 rounded-sm text-xs font-semibold",
  md: "h-10 px-4 rounded-md text-sm font-semibold",
  lg: "h-12 px-6 rounded-lg text-base font-semibold",
  text: "",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, icon, className = "", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 transition-all focus:outline-none disabled:opacity-50 disabled:shadow-none ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <LoaderCircle className="animate-spin h-4 w-4" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
