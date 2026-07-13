import type { TextareaHTMLAttributes } from "react";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  touched?: boolean;
}

export const CustomTextArea = ({
  label,
  error,
  touched,
  className = "",
  ...props
}: Props) => {
  const hasError = touched && error;

  return (
    <div>
      {label && (
        <label className="block mb-1.5 text-xs font-semibold text-[#1a1a1a]">
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={`w-full px-3 py-2 rounded-lg border-[1.5px] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
          hasError ? "border-red-500" : "border-[#d4d4d4]"
        } ${className}`}
      />
      {hasError && <div className="mt-1 text-xs text-red-600">{error}</div>}
    </div>
  );
};
