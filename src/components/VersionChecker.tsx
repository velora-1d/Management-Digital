"use client";

import React, { useEffect, useState, useRef } from "react";
import VersionUpdateModal from "./ui/VersionUpdateModal";

const STORAGE_KEY = "next-build-id";
const CHECK_INTERVAL = 3 * 60 * 1000; // Polling berkala setiap 3 menit

/**
 * Komponen VersionChecker memantau konsistensi build ID antara client dan server.
 * Komponen ini mendaftarkan global listener untuk unhandledrejection, error, dan fetch 
 * guna memotong error Server Action ("Failed to find Server Action") atau ChunkLoadError,
 * serta mengecek update secara periodik (polling dan focus window).
 */
export default function VersionChecker() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const initialBuildIdRef = useRef<string | null>(null);

  const triggerUpdateModal = () => {
    setIsOpen(true);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Abaikan jika localStorage diblokir browser
    }
    
    // Hard refresh dengan query parameter timestamp unik guna menghindari cache browser/proxy
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("u_bust", Date.now().toString());
    window.location.href = currentUrl.toString();
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Dapatkan build ID dari meta tag yang dirender server
    let currentBuildId = document
      .querySelector('meta[name="next-build-id"]')
      ?.getAttribute("content");

    // Jika tidak ditemukan, coba ambil dari localStorage (fallback)
    if (!currentBuildId) {
      try {
        currentBuildId = localStorage.getItem(STORAGE_KEY);
      } catch {
        // Abaikan
      }
    }

    // Fungsi untuk membandingkan build ID client dengan server terbaru
    const checkVersionFromServer = async (currentLocalId: string) => {
      if (!currentLocalId || currentLocalId === "development") return false;

      try {
        const res = await fetch("/api/version", {
          cache: "no-store",
          headers: {
            "Pragma": "no-cache",
            "Cache-Control": "no-cache",
          },
        });

        if (res.ok) {
          const data = await res.json();
          const serverVersion = data.version;

          if (
            serverVersion &&
            serverVersion !== "development" &&
            serverVersion !== "unknown" &&
            serverVersion !== currentLocalId
          ) {
            console.warn(
              `[Version Mismatch] Client build ID: ${currentLocalId}, Server build ID: ${serverVersion}. Menampilkan popup update.`
            );
            triggerUpdateModal();
            return true;
          }
        }
      } catch (err) {
        console.error("Gagal melakukan pengecekan versi build server:", err);
      }
      return false;
    };

    // Fungsi inisialisasi versi build
    const initializeVersion = async () => {
      if (!currentBuildId) {
        try {
          const res = await fetch("/api/version");
          if (res.ok) {
            const data = await res.json();
            currentBuildId = data.version;
          }
        } catch {
          currentBuildId = "development";
        }
      }

      if (currentBuildId) {
        try {
          localStorage.setItem(STORAGE_KEY, currentBuildId);
        } catch {
          // Abaikan jika quota full atau private browsing
        }
        initialBuildIdRef.current = currentBuildId;
      }
    };

    initializeVersion();

    // 2. Detektor pesan error spesifik
    const isVersionError = (msg: string): boolean => {
      const lowerMsg = msg.toLowerCase();
      return (
        lowerMsg.includes("failed to find server action") ||
        lowerMsg.includes("older or newer deployment") ||
        lowerMsg.includes("failed to execute action") ||
        lowerMsg.includes("chunkloaderror") ||
        lowerMsg.includes("loading chunk") ||
        lowerMsg.includes("failed to fetch dynamically imported module")
      );
    };

    // 3. Listener error global (misal: chunk loading error)
    const handleErrorEvent = (event: ErrorEvent) => {
      if (isVersionError(event.message || "")) {
        console.error("Deteksi error versi build pada window.onerror:", event.message);
        triggerUpdateModal();
      }
    };

    // 4. Listener rejection Promise global (Server Action errors yang tidak ditangani)
    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : String(reason);
      if (isVersionError(message)) {
        console.error("Deteksi unhandled promise rejection terkait Server Action:", message);
        event.preventDefault(); // Menghentikan noise error di browser devtools console
        triggerUpdateModal();
      }
    };

    window.addEventListener("error", handleErrorEvent);
    window.addEventListener("unhandledrejection", handlePromiseRejection);

    // 5. Intercept window.fetch (Untuk menangkap error Server Action yang di-handle lewat try/catch di komponen)
    const originalFetch = window.fetch;
    window.fetch = async function (input, init) {
      try {
        const response = await originalFetch(input, init);

        // Server Action yang gagal akibat deployment baru biasanya menghasilkan status 404/500
        if (response.status === 404 || response.status === 500) {
          // Clone response agar pemanggil asli tetap bisa membaca body/stream aslinya
          const clone = response.clone();
          const contentType = clone.headers.get("content-type") || "";

          if (contentType.includes("text") || contentType.includes("json")) {
            const text = await clone.text();
            if (
              text.includes("Failed to find Server Action") ||
              text.includes("older or newer deployment")
            ) {
              console.error("Terdeteksi response error Server Action (404/500):", text);
              triggerUpdateModal();
            }
          }
        }
        return response;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        if (isVersionError(errMsg)) {
          console.error("Fetch melemparkan error build/action mismatch:", errMsg);
          triggerUpdateModal();
        }
        throw err; // Lempar kembali error asli ke alur aplikasi normal
      }
    };

    // 6. Polling berkala dan On-Focus Check
    const runCheck = () => {
      if (initialBuildIdRef.current) {
        checkVersionFromServer(initialBuildIdRef.current);
      }
    };

    // Jalankan timer polling berkala
    const intervalId = setInterval(runCheck, CHECK_INTERVAL);

    // Jalankan pengecekan setiap kali user kembali membuka tab aplikasi (tab focus)
    const handleFocus = () => {
      runCheck();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("error", handleErrorEvent);
      window.removeEventListener("unhandledrejection", handlePromiseRejection);
      window.fetch = originalFetch;
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <VersionUpdateModal
      isOpen={isOpen}
      onRefresh={handleRefresh}
      isLoading={isLoading}
    />
  );
}
