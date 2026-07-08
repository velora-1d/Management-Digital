"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Button from "@/components/ui/Button";

interface MutationCheckerProps {
  user: { name: string; role: string };
}

/**
 * Komponen MutationChecker mendeteksi siswa aktif tanpa enrollment di tahun ajaran baru.
 * Menampilkan popup edukatif berisi Alasan & Alur Kerja (Flow) mutasi untuk Admin/Superadmin.
 */
export default function MutationChecker({ user }: MutationCheckerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [unmutatedCount, setUnmutatedCount] = useState(0);
  const [activeYearLabel, setActiveYearLabel] = useState("");
  const [showFlowGuide, setShowFlowGuide] = useState(false);

  const isAdmin = ["superadmin", "admin"].includes(
    user.role.toLowerCase().replace(/\s+/g, "")
  );

  useEffect(() => {
    // Hanya berlaku untuk Admin/Superadmin di luar halaman mutasi itu sendiri
    if (!isAdmin || pathname === "/mutations") return;

    // Cek jika peringatan telah diabaikan dalam sesi browser saat ini
    const isDismissed = sessionStorage.getItem("dismissed-mutation-warning") === "true";
    if (isDismissed) return;

    const checkEnrollmentAudit = async () => {
      try {
        const res = await fetch("/api/students/enrollment-audit", {
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const count = json.data.summary.activeStudentsWithoutEnrollment || 0;
            const yearLabel = json.data.activeYear?.year || "";

            if (count > 0) {
              setUnmutatedCount(count);
              setActiveYearLabel(yearLabel);
              setShowModal(true);
            }
          }
        }
      } catch (err) {
        console.error("Gagal memproses pengecekan mutasi siswa:", err);
      }
    };

    checkEnrollmentAudit();
  }, [pathname, isAdmin]);

  const handleDismiss = () => {
    sessionStorage.setItem("dismissed-mutation-warning", "true");
    setShowModal(false);
  };

  const handleNavigateToMutations = () => {
    setShowModal(false);
    router.push("/mutations");
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 overflow-y-auto">
      {/* Dark Overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" 
        onClick={handleDismiss} 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 md:p-8 overflow-hidden animate-fade-in-up select-none">
        
        {/* Amber Line Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-amber-600" />

        {/* Warning Icon Banner */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-xl text-slate-800 tracking-tight">
              Peringatan Transisi Tahun Ajaran
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tahun Ajaran Aktif: <span className="font-semibold text-slate-600">{activeYearLabel}</span>
            </p>
          </div>
        </div>

        {/* Highlight Box */}
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-5 text-left">
          <p className="text-xs text-rose-800 leading-relaxed">
            Terdeteksi sebanyak <strong className="text-rose-900 font-extrabold">{unmutatedCount} siswa aktif</strong> belum didaftarkan masuk kelas pada tahun ajaran baru ini.
          </p>
        </div>

        {/* Alasan Utama Section */}
        <div className="text-left space-y-3 mb-6">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            ⚠️ Mengapa Mutasi Ini Wajib Dilakukan?
          </h4>
          <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside bg-slate-50 p-3 rounded-lg border border-slate-100">
            <li>
              <strong className="text-slate-800 font-semibold">Siswa Hilang di Kelas:</strong> Guru tidak dapat mengisi absensi dan memberikan nilai karena daftar siswa di kelas tersebut kosong di tahun ajaran baru.
            </li>
            <li>
              <strong className="text-slate-800 font-semibold">Keuangan Tersumbat:</strong> Sistem infaq/SPP tidak akan menerbitkan tagihan bulanan untuk siswa yang belum terdaftar di kelas aktif.
            </li>
            <li>
              <strong className="text-slate-800 font-semibold">Ketidakcocokan Data:</strong> Menyebabkan ketidakselarasan laporan audit data statistik sekolah antara kelas master dan kelas pendaftaran.
            </li>
          </ul>
        </div>

        {/* Collapsible Flow Guide */}
        <div className="border border-slate-200/80 rounded-xl overflow-hidden mb-6 text-left">
          <button 
            onClick={() => setShowFlowGuide(!showFlowGuide)}
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors"
          >
            <span>🗺️ LIHAT ALUR KERJA (FLOW) MUTASI</span>
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${showFlowGuide ? "rotate-180" : ""}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showFlowGuide && (
            <div className="p-4 border-t border-slate-200/80 bg-white space-y-3.5 text-xs text-slate-600">
              <div className="flex gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-50 font-bold text-indigo-600 shrink-0">1</span>
                <div>
                  <strong className="text-slate-800 block">Siapkan Kelas Tujuan</strong>
                  Pastikan kelas-kelas baru untuk tahun ajaran aktif sudah dibuat di menu <strong className="text-slate-700">Data Master &gt; Kelas</strong>.
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-50 font-bold text-indigo-600 shrink-0">2</span>
                <div>
                  <strong className="text-slate-800 block">Tugaskan Wali Kelas & Guru</strong>
                  Atur penugasan guru di menu <strong className="text-slate-700">Akademik &gt; Penugasan Guru</strong>.
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-50 font-bold text-indigo-600 shrink-0">3</span>
                <div>
                  <strong className="text-slate-800 block">Jalankan Mutasi Siswa</strong>
                  Buka halaman <strong className="text-slate-700">Mutasi Siswa</strong>. Pilih kelas asal (kelas lama), pilih siswa, pilih kelas tujuan (kelas baru), lalu klik <strong className="text-slate-700">Eksekusi</strong>.
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-50 font-bold text-indigo-600 shrink-0">4</span>
                <div>
                  <strong className="text-slate-800 block">Ubah Status Siswa Non-Aktif/Lulus</strong>
                  Bagi siswa kelas akhir yang sudah lulus atau siswa yang pindah sekolah, pilih aksi <strong className="text-slate-700">Kelulusan</strong> atau <strong className="text-slate-700">Pindah Sekolah</strong> untuk mengupdate status master mereka.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleNavigateToMutations} 
            variant="primary" 
            size="lg" 
            className="w-full font-bold active:scale-[0.98]"
          >
            Buka Menu Mutasi Sekarang
          </Button>
          <button 
            onClick={handleDismiss} 
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 py-2.5 transition-colors cursor-pointer text-center"
          >
            Nanti Saja, Siapkan Kelas Terlebih Dahulu
          </button>
        </div>
      </div>
    </div>
  );
}
