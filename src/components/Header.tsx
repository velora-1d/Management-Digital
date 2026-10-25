"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Swal from "sweetalert2";

// Comprehensive Breadcrumb label mapping
const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  ppdb: "PPDB",
  "re-registration": "Daftar Ulang",
  students: "Data Siswa",
  mutations: "Mutasi",
  classrooms: "Kelas",
  "academic-years": "Tahun Ajaran",
  "transaction-categories": "Kategori Keuangan",
  subjects: "Mata Pelajaran",
  "teaching-assignments": "Penugasan Guru",
  schedules: "Jadwal Pelajaran",
  attendance: "Absensi Siswa",
  curriculum: "Kurikulum",
  grades: "Input Nilai",
  "report-cards": "Rapor Digital",
  extracurricular: "Ekstrakurikuler",
  counseling: "Bimbingan Konseling",
  calendar: "Kalender Akademik",
  "infaq-bills": "Infaq / SPP",
  "cash-accounts": "Akun Kas",
  tabungan: "Tabungan Siswa",
  wakaf: "Wakaf & Donasi",
  journal: "Jurnal Umum",
  reports: "Laporan",
  coop: "Koperasi",
  products: "Produk",
  transactions: "Transaksi",
  credits: "Piutang",
  teachers: "Data Guru",
  staff: "Data Staf",
  payroll: "Payroll",
  "employee-attendance": "Absensi Pegawai",
  letters: "Surat",
  announcements: "Pengumuman",
  inventory: "Inventaris",
  "school-profile": "Profil Sekolah",
  settings: "Pengaturan",
  profile: "Profil",
  new: "Tambah Baru",
  edit: "Edit",
};

const searchableNavigation = [
  { name: "Dashboard", href: "/dashboard", group: "Utama" },
  { name: "Penerimaan PPDB", href: "/ppdb", group: "Penerimaan" },
  { name: "Daftar Ulang Siswa", href: "/re-registration", group: "Penerimaan" },
  { name: "Data Siswa", href: "/students", group: "Data Master" },
  { name: "Mutasi & Kenaikan", href: "/mutations", group: "Data Master" },
  { name: "Kelas & Rombel", href: "/classrooms", group: "Data Master" },
  { name: "Tahun Ajaran", href: "/academic-years", group: "Data Master" },
  { name: "Kategori Keuangan", href: "/transaction-categories", group: "Data Master" },
  { name: "Mata Pelajaran", href: "/subjects", group: "Akademik" },
  { name: "Penugasan Guru", href: "/teaching-assignments", group: "Akademik" },
  { name: "Jadwal Pelajaran", href: "/schedules", group: "Akademik" },
  { name: "Absensi Siswa", href: "/attendance", group: "Akademik" },
  { name: "Kurikulum", href: "/curriculum", group: "Akademik" },
  { name: "Input Nilai Siswa", href: "/grades", group: "Akademik" },
  { name: "Rapor Digital", href: "/report-cards", group: "Akademik" },
  { name: "Infaq / SPP Siswa", href: "/infaq-bills", group: "Keuangan" },
  { name: "Akun Kas & Bank", href: "/cash-accounts", group: "Keuangan" },
  { name: "Tabungan Siswa", href: "/tabungan", group: "Keuangan" },
  { name: "Wakaf & Donasi", href: "/wakaf", group: "Keuangan" },
  { name: "Jurnal Umum Akuntansi", href: "/journal", group: "Keuangan" },
  { name: "Laporan Keuangan", href: "/reports", group: "Keuangan" },
  { name: "Koperasi Produk", href: "/coop/products", group: "Koperasi" },
  { name: "Koperasi Kasir", href: "/coop/transactions", group: "Koperasi" },
  { name: "Koperasi Piutang", href: "/coop/credits", group: "Koperasi" },
  { name: "Data Guru", href: "/teachers", group: "SDM" },
  { name: "Data Staf", href: "/staff", group: "SDM" },
  { name: "Payroll Pegawai", href: "/payroll", group: "SDM" },
  { name: "Absensi Pegawai", href: "/employee-attendance", group: "Tata Usaha" },
  { name: "Manajemen Surat", href: "/letters", group: "Tata Usaha" },
  { name: "Pengumuman", href: "/announcements", group: "Tata Usaha" },
  { name: "Inventaris Sarpras", href: "/inventory", group: "Tata Usaha" },
  { name: "Profil Sekolah", href: "/school-profile", group: "Tata Usaha" },
  { name: "Pengaturan Sistem", href: "/settings", group: "Sistem" },
  { name: "Profil Saya", href: "/profile", group: "Sistem" },
];

interface HeaderProps {
  user: { name: string; role: string };
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [schoolName, setSchoolName] = useState<string>("Madrasah Digital");

  const searchRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Fetch tenant info
  useEffect(() => {
    fetch("/api/settings/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data?.name) setSchoolName(data.name);
      })
      .catch(() => {});
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Auto-focus search input
  useEffect(() => {
    if (showSearch) {
      searchRef.current?.focus();
    } else {
      setSearchQuery("");
    }
  }, [showSearch]);

  // Keyboard shortcut Ctrl+K or Cmd+K
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
    const label = labelMap[seg] || (seg.length > 12 ? seg.substring(0, 10) + "..." : seg);
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });

  // Filtered search results
  const filteredNav = searchQuery.trim()
    ? searchableNavigation.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.group.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  async function handleLogout() {
    const result = await Swal.fire({
      title: "Keluar Sistem?",
      text: "Anda akan keluar dari sesi kerja ini.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      background: "#ffffff",
      color: "#0f172a",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const initial = (user.name || "A").charAt(0).toUpperCase();

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 shrink-0 border-b border-slate-200 bg-white z-30 relative">
      {/* Left: Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm min-w-0 pl-11 md:pl-0">
        <Link
          href="/dashboard"
          className="text-slate-400 hover:text-blue-600 transition-colors shrink-0 p-1 rounded-md hover:bg-slate-100"
          title="Dashboard"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>

        {breadcrumbs.map((b) => (
          <span key={b.href} className="flex items-center gap-2 min-w-0">
            <svg className="w-3.5 h-3.5 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            {b.isLast ? (
              <span className="font-semibold text-slate-900 truncate">{b.label}</span>
            ) : (
              <Link
                href={b.href}
                className="text-slate-500 hover:text-blue-600 font-medium transition-colors truncate"
              >
                {b.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        {/* Tenant Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-slate-500 font-medium">Tenant:</span>
          <span className="font-semibold text-slate-800 truncate max-w-[160px]">{schoolName}</span>
        </div>

        {/* Quick Search */}
        <div ref={searchContainerRef} className="relative">
          {showSearch ? (
            <div className="flex items-center bg-white border border-blue-600 ring-2 ring-blue-100 rounded-lg px-3 py-1.5 gap-2 shadow-xs transition-all">
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setShowSearch(false);
                  if (e.key === "Enter" && filteredNav.length > 0) {
                    router.push(filteredNav[0].href);
                    setShowSearch(false);
                  }
                }}
                placeholder="Cari menu atau fitur..."
                className="bg-transparent text-sm text-slate-900 outline-none w-48 sm:w-64 placeholder:text-slate-400"
              />
              <kbd className="font-mono text-xs text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">ESC</kbd>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors text-slate-600 cursor-pointer"
              title="Cari Menu (Ctrl+K)"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-xs font-medium hidden sm:inline text-slate-600">Cari fitur...</span>
              <kbd className="font-mono text-xs text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">⌘K</kbd>
            </button>
          )}

          {/* Quick Search Dropdown Results */}
          {showSearch && searchQuery.trim() !== "" && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 overflow-hidden">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Hasil Pencarian ({filteredNav.length})
              </div>
              {filteredNav.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {filteredNav.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href);
                        setShowSearch(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-blue-50/70 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-800 group-hover:text-blue-700">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-400">{item.group}</div>
                      </div>
                      <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 text-xs text-slate-500 text-center">
                  Tidak ditemukan menu yang cocok.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Pusat Notifikasi"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer relative"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-900">Notifikasi Sistem</span>
                <span className="text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">Aktif</span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <p className="text-xs font-semibold text-slate-800">Layanan Berjalan Normal</p>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Sinkronisasi data PPDB, kas keuangan, dan absensi aktif secara realtime.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-slate-200 mx-0.5" />

        {/* User Profile & Menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
              {initial}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[120px]">{user.name}</p>
              <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">{user.role}</p>
            </div>
            <svg
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
              <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
                <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">{user.role}</p>
              </div>
              <Link
                href="/profile"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors font-medium"
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profil Saya
              </Link>
              <Link
                href="/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors font-medium"
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Pengaturan
              </Link>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium cursor-pointer"
              >
                <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
