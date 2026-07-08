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
      {/* Heavy glassmorphism overlay - menghalangi interaksi di luar modal */}
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300" />

      {/* Modal Card dengan animasi fade-in-up */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 md:p-8 overflow-hidden animate-fade-in-up text-center select-none">
        
        {/* Dekorasi Garis Gradient di Bagian Atas */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-indigo-500 to-violet-600" />

        {/* Warning Icon dengan efek pulse dan ping */}
        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 mb-6 relative">
          <div className="absolute inset-0 rounded-full bg-indigo-400/20 animate-ping" />
          <svg
            className="w-8 h-8 relative z-10 animate-pulse"
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
        <h3 className="font-heading font-extrabold text-2xl text-slate-800 mb-3 tracking-tight">
          Aplikasi Diperbarui!
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-8">
          Versi baru aplikasi terdeteksi di server. Harap lakukan hard refresh 
          agar Anda dapat menggunakan fitur-fitur terbaru secara stabil dan menghindari error.
        </p>

        {/* Tombol Refresh */}
        <div className="flex flex-col items-center justify-center">
          <Button
            onClick={onRefresh}
            loading={isLoading}
            variant="primary"
            size="lg"
            fullWidth
            className="group relative overflow-hidden transition-all duration-300 font-bold active:scale-[0.98]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <svg 
                className={`w-5 h-5 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M21 21v-5h-.582m-15.356-2A8.001 8.001 0 112.79 16.11" />
              </svg>
              {isLoading ? "Memuat Ulang..." : "Refresh Sekarang"}
            </span>
          </Button>
          
          <span className="text-[10px] text-slate-400 mt-3 block">
            Halaman akan dimuat ulang dengan menghapus data cache browser.
          </span>
        </div>
      </div>
    </div>
  );
}
