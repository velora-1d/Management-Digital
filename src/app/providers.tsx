"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,       // Data dianggap fresh selama 5 menit
            gcTime: 1000 * 60 * 10,          // Cache disimpan 10 menit
            refetchOnWindowFocus: false,      // Jangan refetch saat user klik tab
            retry: 1,                         // Coba ulang 1x kalau gagal
          },
        },
      })
  );

  useEffect(() => {
    const handleActionError = (msg: string) => {
      // Deteksi error Next.js Server Action ketika terjadi deployment baru
      if (
        msg.includes("Failed to find Server Action") ||
        msg.includes("older or newer deployment") ||
        msg.includes("Failed to execute action")
      ) {
        Swal.fire({
          title: "Aplikasi Diperbarui",
          text: "Sistem mendeteksi adanya pembaruan aplikasi di server. Harap muat ulang halaman agar fitur berjalan dengan normal.",
          icon: "info",
          confirmButtonText: "Muat Ulang Halaman",
          confirmButtonColor: "#4f46e5",
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
        return true;
      }
      return false;
    };

    const handleWindowError = (event: ErrorEvent) => {
      handleActionError(event.message || "");
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : String(reason);
      if (handleActionError(message)) {
        event.preventDefault(); // Mencegah error log unhandled merah di console
      }
    };

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
