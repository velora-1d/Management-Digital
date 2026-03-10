"use client";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
  error?: string;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  prefixText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helper, error, prefixIcon, suffixIcon, prefixText, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const hasError = !!error;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-slate-700">
            {label}
          </label>
        )}
        <div
          className={[
            "flex items-center rounded-xl border transition-all duration-200",
            "focus-within:ring-2 focus-within:ring-offset-1",
            hasError
              ? "border-rose-300 focus-within:ring-rose-200 focus-within:border-rose-400"
              : "border-slate-200 focus-within:ring-indigo-200 focus-within:border-indigo-400",
            "bg-white",
          ].join(" ")}
        >
          {prefixText && (
            <span className="pl-3.5 pr-1 text-sm font-semibold text-slate-400 select-none whitespace-nowrap">
              {prefixText}
            </span>
          )}
          {prefixIcon && (
            <span className="pl-3 text-slate-400 [&>svg]:w-4 [&>svg]:h-4">{prefixIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              "flex-1 bg-transparent px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none",
              prefixIcon || prefixText ? "pl-2" : "",
              suffixIcon ? "pr-2" : "",
              className,
            ].join(" ")}
            {...props}
          />
          {suffixIcon && (
            <span className="pr-3 text-slate-400 [&>svg]:w-4 [&>svg]:h-4">{suffixIcon}</span>
          )}
        </div>
        {(helper || error) && (
          <p className={`text-xs ${hasError ? "text-rose-500 font-medium" : "text-slate-400"}`}>
            {error || helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
