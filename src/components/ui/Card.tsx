import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
  noPadding?: boolean;
  compact?: boolean;
}

export default function Card({
  children,
  title,
  icon,
  actions,
  className = "",
  noPadding = false,
  compact = false,
}: CardProps) {
  return (
    <div 
      className={`bg-white text-slate-800 rounded-lg border border-slate-200 shadow-xs overflow-hidden ${className}`}
    >
      {(title || actions) && (
        <div 
          className={`${compact ? "px-3.5 py-2.5" : "px-4 py-3"} border-b border-slate-200 flex items-center justify-between gap-4 flex-wrap bg-slate-50/40`}
        >
          <div className="flex items-center gap-2.5">
            {icon && (
              typeof icon === "boolean" ? (
                <div className="w-2 h-2 rounded-full bg-blue-600" />
              ) : (
                <span className="text-blue-600 [&>svg]:w-4 [&>svg]:h-4 flex items-center">{icon}</span>
              )
            )}
            {title && (
              <h4 className="font-heading font-semibold text-sm text-slate-900 m-0 tracking-tight">
                {title}
              </h4>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      <div className={noPadding ? "" : compact ? "p-3" : "p-4"}>
        {children}
      </div>
    </div>
  );
}
