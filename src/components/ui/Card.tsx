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
      className={`bg-white text-slate-800 rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden ${className}`}
    >
      {(title || actions) && (
        <div 
          className={`${compact ? 'px-4 py-3' : 'px-8 py-5'} border-b border-slate-200/80 flex items-center justify-between gap-4 flex-wrap`} 
          style={{ borderBottom: "1px solid #2C2C2E" }}
        >
          <div className="flex items-center gap-2.5">
            {icon && (
              typeof icon === "boolean" ? (
                <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
              ) : (
                <span className="text-[#00E5FF] [&>svg]:w-4 [&>svg]:h-4 flex items-center">{icon}</span>
              )
            )}
            {title && (
              <h4 className="font-heading font-bold text-sm text-slate-800 m-0 tracking-wide">
                {title}
              </h4>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      <div className={noPadding ? "" : "p-8"}>
        {children}
      </div>
    </div>
  );
}
