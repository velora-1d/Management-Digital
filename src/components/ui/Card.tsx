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
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}
    >
      {(title || actions) && (
        <div 
          className={`${compact ? 'px-4 py-2' : 'px-6 py-4'} border-bottom border-slate-100 flex items-center justify-between gap-4 flex-wrap`} 
          style={{ borderBottom: "1px solid #f1f5f9" }}
        >
          <div className="flex items-center gap-2">
            {icon && (
              <div className="w-2 h-2 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500" />
            )}
            {title && (
              <h4 className="font-heading font-bold text-sm text-slate-800 m-0">
                {title}
              </h4>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      <div className={noPadding ? "" : "p-6"}>
        {children}
      </div>
    </div>
  );
}
