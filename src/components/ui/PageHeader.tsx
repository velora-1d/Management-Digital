import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  gradient?: string; // tailwind gradient classes
  actions?: ReactNode;
}

const defaultGradient = "from-cyan-600 via-sky-600 to-blue-700";

function sanitizeGradient(grad?: string): string {
  if (!grad) return defaultGradient;
  return grad
    .replace(/indigo/g, "sky")
    .replace(/purple/g, "cyan")
    .replace(/violet/g, "blue")
    .replace(/fuchsia/g, "cyan");
}

export default function PageHeader({
  title,
  subtitle,
  icon,
  gradient = defaultGradient,
  actions,
}: PageHeaderProps) {
  const activeGradient = sanitizeGradient(gradient);

  return (
    <div
      className={`bg-linear-to-br ${activeGradient} rounded-2xl overflow-hidden relative shadow-lg shadow-cyan-950/20 border border-white/10`}
    >
      {/* Dekorasi circles dengan clean cyan & blue highlight */}
      <div className="absolute -right-6 -top-6 w-56 h-56 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute right-28 -bottom-10 w-44 h-44 bg-blue-400/20 rounded-full blur-xl pointer-events-none" />
      <div className="absolute left-1/3 top-0 w-64 h-32 bg-cyan-300/10 rounded-full blur-3xl pointer-events-none" />

      <div className="p-6 relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="w-11 h-11 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/25 shadow-sm shrink-0">
                <span className="text-white [&>svg]:w-5 [&>svg]:h-5">{icon}</span>
              </div>
            )}
            <div>
              <h2 className="font-heading font-bold text-xl md:text-2xl text-white m-0 tracking-tight leading-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-[13px] text-white/85 mt-0.5 leading-relaxed font-medium">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>
          )}
        </div>
      </div>
    </div>
  );
}
