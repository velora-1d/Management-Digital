"use client";
import React, { useEffect } from "react";
import { X } from "lucide-react";

interface LeftDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
  position?: "left" | "right";
}

export default function LeftDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = "max-w-md",
  position = "right",
}: LeftDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isRight = position === "right";

  return (
    <div className={`fixed inset-0 z-50 flex ${isRight ? "justify-end" : "justify-start"}`}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Body - Slides in from RIGHT by default */}
      <div
        className={`relative z-10 w-full ${width} bg-white h-full shadow-2xl flex flex-col ${
          isRight ? "border-l animate-slide-in-right" : "border-r animate-slide-in-left"
        } border-slate-200 transform transition-transform duration-300 ease-in-out`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-800">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
