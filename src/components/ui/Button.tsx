"use client";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline" | "success";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 border border-transparent font-medium shadow-xs",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 border border-transparent font-medium shadow-xs",
  secondary:
    "bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-300 text-slate-700 font-medium shadow-xs",
  danger:
    "bg-white border border-rose-300 text-rose-600 hover:bg-rose-50 active:bg-rose-100 font-medium shadow-xs",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200 hover:text-slate-900 border-0 font-medium",
  outline:
    "bg-white text-blue-600 border border-slate-300 hover:bg-blue-50 hover:border-blue-400 active:bg-blue-100 font-medium shadow-xs",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1.5 text-xs gap-1.5 rounded-md",
  md: "px-3.5 py-2 text-sm gap-2 rounded-md",
  lg: "px-5 py-2.5 text-base gap-2.5 rounded-md",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      icon,
      loading = false,
      fullWidth = false,
      disabled,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          "inline-flex items-center justify-center transition-colors duration-150 cursor-pointer select-none",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? "w-full" : "",
          isDisabled ? "opacity-50 cursor-not-allowed shadow-none! pointer-events-none" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : icon ? (
          <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
        ) : null}
        {children && <span>{children}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
