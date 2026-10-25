"use client";
import React from "react";
import Button from "@/components/ui/Button";

interface VersionUpdateModalProps {
  isOpen: boolean;
  onRefresh: () => void;
  isLoading: boolean;
}

/**
 * Komponen modal blocking (tidak bisa ditutup tanpa aksi reload).
 * Ditampilkan saat terjadi error Server Action / Chunk Load akibat deployment baru,
 * atau ketika background polling mendeteksi build ID mismatch.
 */
export default function VersionUpdateModal({
  isOpen,
  onRefresh,
  isLoading,
}: VersionUpdateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto outline-none">
      {/* Overlay */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300" />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl border border-slate-200 p-6 md:p-8 overflow-hidden animate-fade-in-up text-center select-none text-slate-800">
        
        {/* Dekorasi Garis di Bagian Atas */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />

        {/* Warning Icon */}
        <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 text-blue-600 mb-5 relative border border-blue-100">
          <svg
            className="w-7 h-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4"
            />
          </svg>
        </div>

        {/* Informasi Update */}
        <h3 className="font-heading font-semibold text-xl text-slate-900 mb-2 tracking-tight">
          Aplikasi Diperbarui
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          Versi baru aplikasi terdeteksi di server. Harap muat ulang halaman 
          agar Anda dapat menggunakan fitur terbaru secara stabil dan optimal.
        </p>

        {/* Tombol Refresh */}
        <div className="flex flex-col items-center justify-center">
          <Button
            onClick={onRefresh}
            loading={isLoading}
            variant="primary"
            size="lg"
            fullWidth
            className="font-medium"
          >
            <span className="flex items-center justify-center gap-2">
              <svg 
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M21 21v-5h-.582m-15.356-2A8.001 8.001 0 112.79 16.11" />
              </svg>
              {isLoading ? "Memuat Ulang..." : "Muat Ulang Sekarang"}
            </span>
          </Button>
          
          <span className="text-xs text-slate-400 mt-3 block">
            Halaman akan dimuat ulang dengan memperbarui cache browser.
          </span>
        </div>
      </div>
    </div>
  );
}
