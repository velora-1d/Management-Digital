"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Swal from "sweetalert2";

// Breadcrumb label mapping
const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  ppdb: "PPDB",
  "re-registration": "Daftar Ulang",
  students: "Data Siswa",
  mutations: "Mutasi",
  classrooms: "Kelas",
  "academic-years": "Tahun Ajaran",
  "transaction-categories": "Kategori Keuangan",
  "infaq-bills": "Infaq / SPP",
  tabungan: "Tabungan",
  wakaf: "Wakaf",
  journal: "Jurnal Umum",
  reports: "Laporan",
  teachers: "Data Guru",
  staff: "Data Staf",
  payroll: "Payroll",
  inventory: "Inventaris",
  settings: "Pengaturan",
  profile: "Profil",
  new: "Tambah Baru",
  edit: "Edit",
};

interface HeaderProps {
  user: { name: string; role: string };
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Auto-focus search
  useEffect(() => {
    if (showSearch) searchRef.current?.focus();
  }, [showSearch]);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch((s) => !s);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Breadcrumbs
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = labelMap[seg] || (seg.length > 8 ? "..." : seg);
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });

  async function handleLogout() {
    const result = await Swal.fire({
      title: "Keluar Sistem?",
      text: "Anda akan keluar dari sesi ini.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Keluar"
    });
    if (!result.isConfirmed) return;
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const initial = (user.name || "A").charAt(0).toUpperCase();

  return (
    <header className="h-16 flex items-center justify-between px-6 flex-shrink-0 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl z-30 relative">
      {/* Left: Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm min-w-0">
        <Link href="/dashboard" className="text-slate-400 hover:text-indigo-600 transition-colors shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>
        {breadcrumbs.map((b) => (
          <span key={b.href} className="flex items-center gap-1.5 min-w-0">
            <svg className="w-3.5 h-3.5 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            {b.isLast ? (
              <span className="font-bold text-slate-800 truncate">{b.label}</span>
            ) : (
              <Link href={b.href} className="text-slate-500 hover:text-indigo-600 font-medium transition-colors truncate">
                {b.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        {showSearch ? (
          <div className="flex items-center bg-slate-100 rounded-xl px-3 py-1.5 gap-2 animate-fade-in">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") setShowSearch(false); }}
              placeholder="Cari menu atau halaman..."
              className="bg-transparent text-sm text-slate-700 outline-none w-48 placeholder:text-slate-400"
            />
            <kbd className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded">ESC</kbd>
          </div>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-500 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs font-medium hidden sm:inline">Cari</span>
            <kbd className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded hidden sm:inline">⌘K</kbd>
          </button>
        )}



        {/* Separator */}
        <div className="w-px h-7 bg-slate-200 mx-1" />

        {/* User Avatar + Dropdown */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {initial}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-700 leading-tight">{user.name}</p>
              <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wide">{user.role}</p>
            </div>
            <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-2 animate-fade-in-up z-50">
              <Link href="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profil Saya
              </Link>
              <Link href="/settings" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Pengaturan
              </Link>
              <div className="border-t border-slate-100 my-1" />
              <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
