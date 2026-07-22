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
        <label className="block mb-1.5 text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={`w-full px-3 py-2 rounded-md border-[1.5px] bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none ${
          hasError ? "border-danger-500" : "border-slate-300"
        } ${className}`}
      />
      {hasError && <div className="mt-1 text-xs text-danger-600">{error}</div>}
    </div>
  );
};
