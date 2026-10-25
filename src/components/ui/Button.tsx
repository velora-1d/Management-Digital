"use client";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 font-bold shadow-md shadow-cyan-950/20 hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,229,255,0.35)] hover:-translate-y-0.5 active:translate-y-0 border-0",
  secondary:
    "bg-[#2C2C2E] text-slate-100 border border-[#3A3A3C] shadow-sm hover:bg-[#3A3A3C] hover:text-white hover:border-[#48484A] hover:-translate-y-0.5 active:translate-y-0 font-medium",
  danger:
    "bg-linear-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-950/30 hover:brightness-110 hover:shadow-lg hover:shadow-rose-900/40 hover:-translate-y-0.5 active:translate-y-0 border-0 font-semibold",
  ghost:
    "bg-transparent text-slate-300 hover:bg-white/10 hover:text-white border-0 font-medium",
  outline:
    "bg-transparent text-[#00E5FF] border border-[#00E5FF]/40 hover:bg-[#00E5FF]/10 hover:border-[#00E5FF] hover:-translate-y-0.5 active:translate-y-0 font-semibold",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
  md: "px-4 py-2.5 text-sm gap-2 rounded-xl",
  lg: "px-6 py-3 text-sm gap-2.5 rounded-xl",
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
          "inline-flex items-center justify-center transition-all duration-200 cursor-pointer select-none",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? "w-full" : "",
          isDisabled ? "opacity-50 cursor-not-allowed translate-y-0! shadow-none! pointer-events-none" : "",
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
