"use client";

import { useHelp } from "./HelpContext";
import { useEffect, useState } from "react";

export default function HelpFAB() {
  const { openHelp, isOpen } = useHelp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Sembunyikan FAB jika drawer bantuan sedang terbuka
  if (isOpen) return null;

  return (
    <button
      onClick={openHelp}
      className={`
        fixed bottom-6 right-6 z-40
        w-14 h-14 rounded-full
        bg-gradient-to-br from-indigo-500 to-indigo-600
        text-white shadow-lg shadow-indigo-500/30
        flex items-center justify-center
        hover:scale-110 hover:shadow-xl hover:shadow-indigo-500/40
        active:scale-95
        transition-all duration-300 ease-out
        group
      `}
      title="Pusat Bantuan"
      aria-label="Buka Pusat Bantuan"
    >
      <svg 
        className="w-6 h-6 group-hover:animate-pulse" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2.5} 
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      
      {/* Tooltip (muncul saat hover) */}
      <span className="absolute right-full mr-4 bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-md">
        Pusat Bantuan
        {/* Panah tooltip */}
        <span className="absolute top-1/2 -right-1 -mt-1 border-4 border-transparent border-l-slate-800"></span>
      </span>
    </button>
  );
}
