"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  School,
  Check,
  ChevronsUpDown,
  Building2,
  GraduationCap,
  SlidersHorizontal,
  Lock,
  X,
  ShieldCheck,
} from "lucide-react";
import Swal from "sweetalert2";

export interface SchoolLevelItem {
  id: number;
  code: string;
  name: string;
  orderNumber: number;
  hasPin?: boolean;
}

export default function TenantSwitcher() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [levels, setLevels] = useState<SchoolLevelItem[]>([]);
  const [activeLevel, setActiveLevel] = useState<SchoolLevelItem | null>(null);

  // State PIN Modal
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingLevel, setPendingLevel] = useState<SchoolLevelItem | null>(null);
  const [pinDigits, setPinDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isSubmittingPin, setIsSubmittingPin] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const fetchLevels = async () => {
    try {
      const res = await fetch("/api/school-levels");
      const data = await res.json();
      if (data.success) {
        setLevels(data.levels || []);
        setActiveLevel(data.activeLevel || data.levels?.[0] || null);

        // Sync initial level to global event
        if (data.activeLevel) {
          window.dispatchEvent(
            new CustomEvent("school-level-synced", { detail: data.activeLevel })
          );
        }
      }
    } catch (err) {
      console.error("Gagal memuat daftar tingkatan sekolah:", err);
    }
  };

  useEffect(() => {
    fetchLevels();

    // Close on outside click
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus first PIN input on modal open
  useEffect(() => {
    if (pinModalOpen) {
      setPinDigits(["", "", "", "", "", ""]);
      setPinError(null);
      setTimeout(() => {
        pinInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [pinModalOpen]);

  const handleSelectLevel = (level: SchoolLevelItem) => {
    if (level.id === activeLevel?.id) {
      setIsOpen(false);
      return;
    }

    setIsOpen(false);

    if (level.hasPin) {
      setPendingLevel(level);
      setPinModalOpen(true);
    } else {
      executeSwitch(level);
    }
  };

  const executeSwitch = async (level: SchoolLevelItem, pin?: string) => {
    try {
      setIsSubmittingPin(true);
      const res = await fetch("/api/school-levels/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolLevelId: level.id, pin }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setActiveLevel(data.activeLevel || level);
        setPinModalOpen(false);
        setPendingLevel(null);

        // Broadcast perubahan jenjang ke Header & Sidebar secara real-time
        window.dispatchEvent(
          new CustomEvent("school-level-changed", { detail: data.activeLevel || level })
        );

        // Notifikasi SweetAlert Toast estetik
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: data.message || `Beralih ke jenjang ${level.name}`,
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });

        // Full browser reload agar semua server component, query client, dan cookie tersinkronisasi 100%
        setTimeout(() => {
          window.location.reload();
        }, 300);
      } else {
        if (pinModalOpen) {
          setPinError(data.message || "PIN otorisasi tidak valid.");
          setPinDigits(["", "", "", "", "", ""]);
          pinInputRefs.current[0]?.focus();
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal Beralih Tingkatan",
            text: data.message || "Tidak dapat beralih ke jenjang yang dipilih.",
            confirmButtonColor: "#2563eb",
          });
        }
      }
    } catch {
      if (pinModalOpen) {
        setPinError("Terjadi gangguan jaringan saat verifikasi PIN.");
      }
    } finally {
      setIsSubmittingPin(false);
    }
  };

  const handlePinDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    const updated = [...pinDigits];
    updated[index] = clean;
    setPinDigits(updated);
    setPinError(null);

    if (clean && index < 5) {
      pinInputRefs.current[index + 1]?.focus();
    }

    if (clean && index === 5 && updated.every((d) => d !== "") && pendingLevel) {
      executeSwitch(pendingLevel, updated.join(""));
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!pinDigits[index] && index > 0) {
        const updated = [...pinDigits];
        updated[index - 1] = "";
        setPinDigits(updated);
        pinInputRefs.current[index - 1]?.focus();
      } else {
        const updated = [...pinDigits];
        updated[index] = "";
        setPinDigits(updated);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      pinInputRefs.current[index + 1]?.focus();
    }
  };

  const isPesantren = (code?: string) => {
    if (!code) return false;
    const c = code.toUpperCase();
    return c.includes("PONDOK") || c.includes("PONPES") || c.includes("MAHAD");
  };

  const displayLevel = activeLevel || {
    id: 1,
    code: "MTS",
    name: "Madrasah Tsanawiyah (MTs)",
    orderNumber: 1,
  };

  return (
    <>
      <div ref={containerRef} className="relative inline-block text-left">
        {/* Trigger Button: Pill Style 1:1 Edu-sistem */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Pilih Tingkatan Sekolah Aktif"
          className="h-9 px-3.5 border border-slate-200 bg-white hover:bg-slate-50 text-[#1B3B4B] flex items-center gap-2.5 max-w-[210px] sm:max-w-[260px] shadow-xs transition-all rounded-full cursor-pointer select-none"
        >
          {/* Circular Badge with Level Code */}
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white shadow-xs font-mono text-[9px] font-bold">
            {displayLevel.code ? displayLevel.code.slice(0, 3) : <School className="h-3 w-3" />}
          </div>

          {/* Name & Active Status */}
          <div className="flex flex-col text-left truncate flex-1 leading-none">
            <span className="text-[11px] font-bold truncate text-[#1B3B4B]">
              {displayLevel.name}
            </span>
            <span className="text-[9.5px] text-[#557B8F] truncate mt-0.5 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-mono">{displayLevel.code}</span>
              <span className="text-slate-400 font-normal">• Aktif</span>
            </span>
          </div>

          {/* Chevrons */}
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-[#557B8F]" />
        </button>

        {/* Dropdown Menu 1:1 Edu-sistem */}
        {isOpen && (
          <div className="absolute right-0 sm:left-0 mt-2 w-72 p-2 rounded-2xl border border-slate-200 bg-white shadow-xl text-[#1B3B4B] z-50 animate-fade-in">
            {/* Header */}
            <div className="px-2.5 py-1.5 text-xs font-semibold text-[#557B8F] flex items-center justify-between">
              <span className="font-mono uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-teal-600" />
                <span>Tingkatan Sekolah</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 border border-teal-500/20 font-semibold font-mono">
                {levels.length} Jenjang
              </span>
            </div>

            <div className="my-1.5 border-t border-slate-100" />

            {/* List Jenjang */}
            <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-none">
              {levels.map((level) => {
                const isSelected = level.id === displayLevel.id;
                return (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => handleSelectLevel(level)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs transition-colors text-left ${
                      isSelected
                        ? "bg-teal-50 text-teal-800 font-semibold"
                        : "hover:bg-slate-50 text-[#1B3B4B]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {/* Icon Container */}
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] text-xs font-mono font-bold ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 border border-slate-200 text-slate-600"
                        }`}
                      >
                        {isPesantren(level.code) ? (
                          <Building2 className="h-3.5 w-3.5" />
                        ) : (
                          <GraduationCap className="h-3.5 w-3.5" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex flex-col truncate">
                        <span className="truncate text-xs">{level.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Kode: {level.code} {level.hasPin && "• Terkunci PIN"}
                        </span>
                      </div>
                    </div>

                    {/* Selected Check */}
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-blue-600 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer Action */}
            <div className="my-1.5 border-t border-slate-100" />
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push("/settings");
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-blue-600 hover:bg-blue-50 cursor-pointer rounded-lg font-medium transition-colors text-left"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
              <span>Kelola Jenjang di Pengaturan</span>
            </button>
          </div>
        )}
      </div>

      {/* PIN Dialog (jika jenjang diproteksi PIN) */}
      {pinModalOpen && pendingLevel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setPinModalOpen(false);
                setPendingLevel(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Otorisasi Perpindahan Jenjang
              </h3>
              <p className="text-xs text-slate-500">
                Masukkan 6-digit PIN keamanan untuk beralih ke{" "}
                <span className="font-semibold text-slate-700">{pendingLevel.name}</span>
              </p>
            </div>

            {/* PIN Inputs */}
            <div className="mt-5 flex justify-center gap-2">
              {pinDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    pinInputRefs.current[i] = el;
                  }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(i, e)}
                  disabled={isSubmittingPin}
                  className="w-10 h-12 text-center text-lg font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-800"
                />
              ))}
            </div>

            {pinError && (
              <p className="mt-3 text-center text-xs text-rose-600 font-medium font-mono">
                {pinError}
              </p>
            )}

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setPinModalOpen(false);
                  setPendingLevel(null);
                }}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={pinDigits.some((d) => d === "") || isSubmittingPin}
                onClick={() => executeSwitch(pendingLevel, pinDigits.join(""))}
                className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
              >
                {isSubmittingPin ? "Memverifikasi..." : "Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
