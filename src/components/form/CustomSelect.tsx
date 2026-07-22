import { ChevronDown } from "lucide-react";

interface Option {
  value: string | number;
  label: string;
}

interface Props {
  label?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  className?: string;
  size?: "md" | "sm";
}

export const CustomSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Seleccionar…",
  error,
  touched,
  disabled,
  className = "",
  size = "md",
}: Props) => {
  const hasError = touched && error;

  const sizeClasses = size === "sm"
    ? "h-8 px-2 pr-8 text-xs"
    : "h-12 px-3 pr-10 text-sm";

  const iconSize = size === "sm" ? 14 : 16;

  return (
    <div>
      {label && (
        <label className="block mb-1.5 text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value === 0 ? "" : (value ?? "")}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={`w-full appearance-none rounded-md border-[1.5px] bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses} ${
            hasError ? "border-danger-500" : "border-slate-300"
          } ${className}`}
          style={{
            color: value === undefined || value === "" ? "#94a3b8" : "#1e293b",
          }}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={iconSize}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"
        />
      </div>
      {hasError && <div className="mt-1 text-xs text-danger-600">{error}</div>}
    </div>
  );
};
