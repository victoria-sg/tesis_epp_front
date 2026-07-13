import type { InputHTMLAttributes, ReactNode } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  touched?: boolean;
  suffix?: ReactNode;
  size?: "md" | "sm";
}

export const CustomInput = ({
  label,
  error,
  touched,
  suffix,
  className = "",
  size = "md",
  ...props
}: Props) => {
  const hasError = touched && error;

  const sizeClasses = size === "sm"
    ? "h-8 px-2 text-xs"
    : "h-12 px-3 text-sm";

  return (
    <div>
      {label && (
        <label className="block mb-1.5 text-xs font-semibold text-[#1a1a1a]">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          className={`w-full rounded-md border-[1.5px] bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses} ${
            hasError ? "border-red-500" : "border-[#d4d4d4]"
          } ${suffix ? "pr-8" : ""} ${className}`}
        />
        {suffix && (
          <span className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
            {suffix}
          </span>
        )}
      </div>
      {hasError && <div className="mt-1 text-xs text-red-600">{error}</div>}
    </div>
  );
};
