"use client";

import { useHelp } from "./HelpContext";
import { getHelpContentByPath } from "@/lib/help-content";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function HelpDrawer() {
  const { isOpen, closeHelp, openHelp } = useHelp();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Tutup drawer HANYA kalau user berpindah halaman (bukan saat mount pertama)
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      closeHelp();
      prevPathRef.current = pathname;
    }
  }, [pathname, closeHelp]);

  // Global event listener untuk membuka drawer dari Sidebar & Header
  useEffect(() => {
    const handleOpen = () => openHelp();
    window.addEventListener("open-help-drawer", handleOpen);
    return () => window.removeEventListener("open-help-drawer", handleOpen);
  }, [openHelp]);

  // Escape key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeHelp();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, closeHelp]);

  if (!mounted) return null;

  const content = getHelpContentByPath(pathname);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[1000] transition-opacity duration-300"
          onClick={closeHelp}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-white shadow-2xl z-[1001] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Pusat Bantuan</h2>
              <p className="text-xs font-medium text-slate-500">Panduan penggunaan Menu</p>
            </div>
          </div>
          <button 
            onClick={closeHelp}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
          {content ? (
            <div className="space-y-8">
              {/* Title & Desc */}
              <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-2xl border border-indigo-100/50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full -mr-4 -mt-4"></div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 relative z-10">{content.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed relative z-10">{content.description}</p>
              </div>

              {/* Features Flow */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  <h4 className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                    Panduan Fitur
                  </h4>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </div>
                
                {content.features.map((feat, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow group">
                    <h5 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                       <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                       </div>
                      {feat.title}
                    </h5>
                    <div className="relative border-l-2 border-indigo-100/50 ml-3 space-y-5">
                      {feat.steps.map((step, stepIdx) => (
                        <div key={stepIdx} className="ml-5 relative">
                          <span className="absolute flex items-center justify-center w-5 h-5 bg-white rounded-full -left-[31px] top-0 border-2 border-indigo-200 text-[10px] font-bold text-indigo-500 shadow-sm">
                            {stepIdx + 1}
                          </span>
                          <p className="text-[13px] text-slate-600 leading-relaxed pt-0.5">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Extra Info */}
              {content.extraInfo && content.extraInfo.length > 0 && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200/60 flex items-start gap-3 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-amber-100/80 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-[13px] font-bold text-amber-900">Catatan Penting</h5>
                    <ul className="list-disc ml-4 space-y-1">
                      {content.extraInfo.map((info, idx) => (
                        <li key={idx} className="text-xs text-amber-700/80 leading-relaxed">{info}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-10">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5 border border-slate-100 shadow-sm">
                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-700">Panduan Kosong</p>
              <p className="text-xs text-slate-400 mt-2 max-w-[200px] leading-relaxed">Belum ada penjelasan spesifik untuk halaman ini.</p>
            </div>
          )}
        </div>

        {/* Footer: Contacts */}
        <div className="flex-shrink-0 p-5 bg-white border-t border-slate-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
          <div className="flex gap-3">
            <a 
              href="https://wa.me/6285117776596" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 p-3 rounded-xl transition-colors font-semibold text-sm group"
            >
              <svg className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
              </svg>
              Hubungi Admin
            </a>
            <a 
              href="https://ve-lora.my.id" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl transition-colors group"
              title="Kunjungi Website Developer"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
