"use client";
import { useEffect, useCallback, type ReactNode } from "react";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: ModalSize;
  children: ReactNode;
  footer?: ReactNode;
}

const sizeMap: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = "md",
  children,
  footer,
}: ModalProps) {
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, handleEsc]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={[
          "relative w-full bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 overflow-hidden animate-fade-in-up",
          sizeMap[size],
        ].join(" ")}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
            <div>
              <h3 className="font-heading font-semibold text-lg text-slate-900 m-0 tracking-tight">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Tutup modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto text-slate-700">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-slate-200 bg-slate-50/70">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
