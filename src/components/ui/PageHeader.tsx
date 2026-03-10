"use client";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  gradient?: string; // tailwind gradient classes
  actions?: ReactNode;
}

const defaultGradient = "from-indigo-600 via-violet-600 to-purple-600";

export default function PageHeader({
  title,
  subtitle,
  icon,
  gradient = defaultGradient,
  actions,
}: PageHeaderProps) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-2xl overflow-hidden relative shadow-lg`}
    >
      {/* Dekorasi circles */}
      <div className="absolute -right-5 -top-5 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute right-24 -bottom-10 w-36 h-36 bg-white/5 rounded-full blur-xl pointer-events-none" />
      <div className="absolute left-1/2 top-0 w-64 h-32 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="p-7 relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-sm shrink-0">
                <span className="text-white [&>svg]:w-6 [&>svg]:h-6">{icon}</span>
              </div>
            )}
            <div>
              <h2 className="font-heading font-bold text-2xl text-white m-0 tracking-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-white/75 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2 flex-wrap">{actions}</div>
          )}
        </div>
      </div>
    </div>
  );
}
