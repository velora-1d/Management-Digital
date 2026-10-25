import type { ReactNode } from "react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  gradient?: string; // Kept for backward compatibility
  actions?: ReactNode;
  breadcrumb?: BreadcrumbItem[];
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  icon,
  actions,
  breadcrumb,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 p-5 shadow-xs ${className}`}
    >
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2.5">
          <ol className="flex items-center gap-1.5 text-xs text-slate-500 font-medium flex-wrap">
            {breadcrumb.map((item, index) => {
              const isLast = index === breadcrumb.length - 1;
              return (
                <li key={index} className="flex items-center gap-1.5">
                  {index > 0 && <span className="text-slate-400">/</span>}
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className={isLast ? "text-slate-900 font-semibold" : ""}>
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {icon && (
            <div className="w-10 h-10 bg-blue-50 border border-blue-200/80 rounded-lg flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
              <span className="[&>svg]:w-5 [&>svg]:h-5">{icon}</span>
            </div>
          )}
          <div>
            <h1 className="font-heading font-semibold text-xl text-slate-900 m-0 tracking-tight leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs md:text-sm text-slate-500 mt-0.5 leading-normal">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
