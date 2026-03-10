"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

/**
 * PageTransition — Wrapper animasi transisi antar halaman dashboard.
 * 
 * Memberikan efek fade-in + slide-up setiap kali pathname berubah (pindah menu).
 * Juga menampilkan progress bar di atas halaman selama transisi.
 * 
 * PENTING: Tidak menggunakan CSS `transform` atau `will-change` secara persisten
 * karena itu akan membuat containing block baru dan merusak `position: fixed`
 * pada modal di dalam children.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [key, setKey] = useState(pathname);
  const [animClass, setAnimClass] = useState("");

  useEffect(() => {
    if (pathname !== key) {
      // Mulai transisi: fade-out cepat
      setIsTransitioning(true);
      setAnimClass("page-fade-out");

      // Setelah fade-out selesai, ganti konten dan fade-in
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setKey(pathname);
        setIsTransitioning(false);
        setAnimClass("page-fade-in");

        // Hapus class animasi setelah selesai agar tidak ada
        // transform/will-change yang merusak position:fixed di modal
        const cleanup = setTimeout(() => setAnimClass(""), 350);
        return () => clearTimeout(cleanup);
      }, 150);

      return () => clearTimeout(timer);
    } else {
      setDisplayChildren(children);
    }
  }, [pathname, children, key]);

  return (
    <>
      {/* Progress Bar */}
      {isTransitioning && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          height: 3,
          background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)",
          animation: "progressBar 1.5s ease-in-out infinite",
        }} />
      )}

      {/* Content — TANPA inline transform/will-change agar position:fixed modal tetap benar */}
      <div key={key} className={animClass}>
        {displayChildren}
      </div>
    </>
  );
}
