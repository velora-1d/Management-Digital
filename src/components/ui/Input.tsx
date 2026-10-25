"use client";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
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
      <div className="space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div
          className={[
            "flex items-center rounded-md border transition-all duration-150 bg-white shadow-xs",
            "focus-within:ring-2 focus-within:ring-offset-0",
            hasError
              ? "border-rose-300 focus-within:ring-rose-500/20 focus-within:border-rose-500"
              : "border-slate-300 focus-within:ring-blue-500/20 focus-within:border-blue-500",
          ].join(" ")}
        >
          {prefixText && (
            <span className="pl-3 pr-1 text-sm font-medium text-slate-500 select-none whitespace-nowrap">
              {prefixText}
            </span>
          )}
          {prefixIcon && (
            <span className="pl-3 text-slate-400 [&>svg]:w-4 [&>svg]:h-4 flex items-center">{prefixIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              "flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none",
              prefixIcon || prefixText ? "pl-2" : "",
              suffixIcon ? "pr-2" : "",
              className,
            ].join(" ")}
            {...props}
          />
          {suffixIcon && (
            <span className="pr-3 text-slate-400 [&>svg]:w-4 [&>svg]:h-4 flex items-center">{suffixIcon}</span>
          )}
        </div>
        {(helper || error) && (
          <p className={`text-xs ${hasError ? "text-rose-600 font-medium" : "text-slate-500"}`}>
            {error || helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
