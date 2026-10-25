"use client";
import type { ReactNode } from "react";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "primary";

export interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  dot?: boolean;
  mono?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-emerald-500/15 text-emerald-800 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-800 border-amber-500/30",
  danger: "bg-rose-500/15 text-rose-800 border-rose-500/30",
  info: "bg-sky-500/15 text-sky-800 border-sky-500/30",
  neutral: "bg-slate-500/10 text-slate-700 border-slate-300",
  primary: "bg-blue-500/15 text-blue-800 border-blue-500/30",
};

const dotColors: Record<BadgeVariant, string> = {
  success: "bg-emerald-600",
  warning: "bg-amber-600",
  danger: "bg-rose-600",
  info: "bg-sky-600",
  neutral: "bg-slate-500",
  primary: "bg-blue-600",
};

export default function Badge({
  variant = "neutral",
  children,
  dot = false,
  mono,
  className = "",
}: BadgeProps) {
  const isNumericOrCode =
    mono ??
    (typeof children === "number" ||
      (typeof children === "string" && (/\d/.test(children) || /^[A-Z0-9_\-#]+$/i.test(children))));

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 h-6 px-2.5 text-xs font-semibold rounded-full border leading-none select-none",
        isNumericOrCode ? "font-mono" : "",
        variantStyles[variant] || variantStyles.neutral,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            dotColors[variant] || dotColors.neutral
          }`}
        />
      )}
      <span>{children}</span>
    </span>
  );
}
