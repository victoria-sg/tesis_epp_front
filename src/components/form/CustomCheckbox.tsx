import type { ReactNode } from "react";

interface Props {
  label: string;
  checked: boolean;
  onChange: () => void;
  variant?: "visible" | "hidden";
  accentColor?: string;
  icon?: ReactNode;
  className?: string;
}

export const CustomCheckbox = ({
  label,
  checked,
  onChange,
  variant = "visible",
  accentColor = "accent-purple-600",
  icon,
  className = "",
}: Props) => {
  if (variant === "hidden") {
    return (
      <label
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors text-sm ${
          checked
            ? "bg-brand-50 text-brand-700 border border-brand-200"
            : "bg-white text-slate-700 border border-slate-200 hover:border-brand-200"
        } ${className}`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        {icon}
        {label}
      </label>
    );
  }

  return (
    <label
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 hover:border-purple-500 hover:bg-purple-50 cursor-pointer transition-colors ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={`${accentColor} w-3.5 h-3.5`}
      />
      <span className="text-xs text-slate-700">{label}</span>
    </label>
  );
};
