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
    "bg-linear-to-r from-[#3b82f6] to-[#2563eb] text-white hover:from-[#2563eb] hover:to-[#1d4ed8] shadow-lg shadow-blue-500/30",
  secondary:
    "bg-linear-to-r from-[#8b5cf6] to-[#7c3aed] text-white hover:from-[#7c3aed] hover:to-[#6d28d9] shadow-lg shadow-purple-500/30",
  success:
    "bg-linear-to-r from-[#10b981] to-[#059669] text-white hover:from-[#059669] hover:to-[#047857] shadow-lg shadow-green-500/30",
  danger:
    "bg-linear-to-r from-[#ef4444] to-[#dc2626] text-white hover:from-[#dc2626] hover:to-[#b91c1c] shadow-lg shadow-red-500/30",
  outline:
    "border border-[#d4d4d4] text-[#1a1a1a] hover:bg-[#f5f5f5]",
  ghost:
    "text-[#6b6b6b] hover:bg-[#f5f5f5]",
  text:
    "text-blue-600 hover:underline bg-transparent p-0 h-auto shadow-none",
};

const sizeClasses: Record<string, string> = {
  sm: "h-8 px-3 rounded-md text-xs font-semibold",
  md: "h-10 px-4 rounded-lg text-sm font-semibold",
  lg: "h-12 px-6 rounded-xl text-base font-semibold",
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
