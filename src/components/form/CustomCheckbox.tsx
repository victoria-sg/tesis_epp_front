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
  accentColor = "accent-[#7c3aed]",
  icon,
  className = "",
}: Props) => {
  if (variant === "hidden") {
    return (
      <label
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors text-[13px] ${
          checked
            ? "bg-blue-100 text-blue-800 border border-blue-300"
            : "bg-white text-[#4a4a4a] border border-[#e5e5e5] hover:border-blue-200"
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
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#e5e5e5] hover:border-[#8b5cf6] hover:bg-[#f5f3ff] cursor-pointer transition-colors ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={`${accentColor} w-3.5 h-3.5`}
      />
      <span className="text-[11px] text-gray-800">{label}</span>
    </label>
  );
};
