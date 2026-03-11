"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { SIDEBAR_PERMISSIONS, type Role } from "@/lib/rbac-permissions";

const menuItems = [
  { group: "UTAMA", items: [
    { name: "Dashboard", short: "Dashboard", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  ]},
  { group: "PENERIMAAN", items: [
    { name: "Penerimaan PPDB", short: "PPDB", href: "/ppdb", icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" },
    { name: "Daftar Ulang", short: "Daftar Ulang", href: "/re-registration", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
  ]},
  { group: "DATA MASTER", items: [
    { name: "Data Siswa", short: "Siswa", href: "/students", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { name: "Mutasi & Kenaikan", short: "Mutasi", href: "/mutations", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
    { name: "Kelas", short: "Kelas", href: "/classrooms", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { name: "Tahun Ajaran", short: "Tahun", href: "/academic-years", icon: "M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 19v-7a2 2 0 012-2h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
    { name: "Kategori Keuangan", short: "Kategori", href: "/transaction-categories", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
  ]},
  { group: "AKADEMIK", items: [
    { name: "Mata Pelajaran", short: "Mapel", href: "/subjects", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
    { name: "Penugasan Guru", short: "Penugasan", href: "/teaching-assignments", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
    { name: "Jadwal Pelajaran", short: "Jadwal", href: "/schedules", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { name: "Absensi Siswa", short: "Absensi", href: "/attendance", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { name: "Manajemen Kurikulum", short: "Kurikulum", href: "/curriculum", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { name: "Input Nilai Siswa", short: "Nilai", href: "/grades", icon: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" },
    { name: "Rapor Digital", short: "Rapor", href: "/report-cards", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { name: "Ekstrakurikuler", short: "Ekskul", href: "/extracurricular", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" },
    { name: "Bimbingan Konseling", short: "BK", href: "/counseling", icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" },
    { name: "Kalender Akademik", short: "Kalender", href: "/calendar", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  ]},
  { group: "KEUANGAN", items: [
    { name: "Infaq / SPP", short: "Infaq", href: "/infaq-bills", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { name: "Tabungan Siswa", short: "Tabungan", href: "/tabungan", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
    { name: "Wakaf & Donasi", short: "Wakaf", href: "/wakaf", icon: "M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" },
    { name: "Jurnal Umum", short: "Jurnal", href: "/journal", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { name: "Laporan", short: "Laporan", href: "/reports", icon: "M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" },
  ]},
  { group: "SDM", items: [
    { name: "Data Guru", short: "Guru", href: "/teachers", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { name: "Data Staf", short: "Staf", href: "/staff", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { name: "Payroll", short: "Gaji", href: "/payroll", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" },
    { name: "Inventaris", short: "Inventaris", href: "/inventory", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  ]},
  { group: "KOPERASI", items: [
    { name: "Produk Koperasi", short: "Produk", href: "/coop/products", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
    { name: "Transaksi / Kasir", short: "Kasir", href: "/coop/transactions", icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" },
    { name: "Piutang Siswa", short: "Piutang", href: "/coop/credits", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" },
  ]},
  { group: "TATA USAHA", items: [
    { name: "Absensi Pegawai", short: "Absensi", href: "/employee-attendance", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { name: "Manajemen Surat", short: "Surat", href: "/letters", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { name: "Pengumuman", short: "Pengumuman", href: "/announcements", icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" },
    { name: "Profil Sekolah", short: "Profil", href: "/school-profile", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  ]},
  { group: "SISTEM", items: [
    { name: "Pengaturan", short: "Setting", href: "/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  ]},
];

function hasMenuAccess(href: string, role: string): boolean {
  if (role === "superadmin") return true;
  const allowed = SIDEBAR_PERMISSIONS[href];
  if (!allowed) return true;
  return allowed.includes(role as Role);
}

export default function Sidebar({ user, collapsed, onToggle }: { user: { name: string; role: string }; collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState<{ name: string; logo: string } | null>(null);

  useEffect(() => {
    fetch("/api/settings/profile")
      .then(res => res.json())
      .then(data => setProfile({ name: data.name, logo: data.logo }))
      .catch(console.error);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const initial = (user.name || "A").charAt(0).toUpperCase();

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className={`flex items-center flex-shrink-0 ${collapsed ? "px-3 py-5 justify-center" : "px-5 py-5"}`} style={{ borderBottom: "1px solid rgba(99,102,241,0.15)" }}>
        {profile?.logo ? (
          <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center p-0.5" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
            <img src={profile.logo} alt="Logo" className="w-full h-full object-contain rounded-lg" />
          </div>
        ) : (
          <div className="shrink-0" style={{ padding: 7, background: "linear-gradient(135deg, #f59e0b, #f97316)", borderRadius: 10, boxShadow: "0 4px 12px rgba(245,158,11,0.3)" }}>
            <span className="w-7 h-7 flex items-center justify-center font-extrabold text-sm" style={{ color: "#1e1b4b" }}>
              {profile?.name ? profile.name.charAt(0).toUpperCase() : "M"}
            </span>
          </div>
        )}
        {!collapsed && (
          <div className="ml-3 overflow-hidden">
            <span className="text-lg font-bold text-white tracking-tight whitespace-nowrap">{profile?.name || "Nama Madrasah"}</span>
            <p className="text-[10px] font-semibold text-indigo-400/60 tracking-wider uppercase">Management Digital</p>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="hidden md:flex absolute -right-3 top-[72px] z-50 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center shadow-md hover:bg-indigo-50 hover:border-indigo-300 transition-colors cursor-pointer"
      >
        <svg className={`w-3 h-3 text-slate-500 transition-transform ${collapsed ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Nav */}
      <div id="sidebar-nav" className="flex-1 overflow-y-auto py-4">
        <nav className={collapsed ? "px-2 space-y-0.5" : "px-3 space-y-0.5"}>
          {menuItems.map((group, gi) => {
            const visibleItems = group.items.filter(item => hasMenuAccess(item.href, user.role));
            if (visibleItems.length === 0) return null;

            return (
              <div key={gi}>
                {!collapsed && (
                  <div className={`px-3 pb-2 ${gi > 0 ? "pt-5 mt-3" : "pt-2"}`} style={gi > 0 ? { borderTop: "1px solid rgba(99,102,241,0.1)" } : {}}>
                    <span className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: "rgba(129,140,248,0.45)" }}>{group.group}</span>
                  </div>
                )}
                {collapsed && gi > 0 && <div className="my-3 mx-2 border-t border-indigo-900/30" />}
                {visibleItems.map((item, ii) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
                  return (
                    <Link
                      key={ii}
                      href={item.href}
                      title={collapsed ? item.name : undefined}
                      className={[
                        "group flex items-center rounded-xl transition-all duration-200",
                        collapsed ? "justify-center p-3 my-0.5" : "px-3 py-2.5 gap-3",
                        isActive
                          ? "bg-gradient-to-r from-indigo-600/30 to-violet-600/20 text-white shadow-sm"
                          : "text-indigo-200/70 hover:bg-indigo-600/15 hover:text-white",
                      ].join(" ")}
                    >
                      <svg
                        className={[
                          "shrink-0 transition-colors duration-200",
                          collapsed ? "w-5 h-5" : "w-[18px] h-[18px]",
                          isActive ? "text-amber-400" : "text-indigo-400/60 group-hover:text-indigo-300",
                        ].join(" ")}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      {!collapsed && (
                        <span className={`text-[13px] font-semibold truncate ${isActive ? "text-white" : ""}`}>
                          {item.name}
                        </span>
                      )}
                      {isActive && !collapsed && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>


      {/* User Footer */}
      <div className={`flex-shrink-0 ${collapsed ? "p-3" : "p-4"}`} style={{ borderTop: "1px solid rgba(99,102,241,0.2)", background: "rgba(15,12,60,0.5)" }}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="w-9 h-9 flex items-center justify-center font-bold text-sm rounded-lg shrink-0" style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", color: "#1e1b4b" }}>
            {initial}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] font-bold text-amber-400/80 uppercase tracking-wider">{user.role}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white border border-slate-200 rounded-xl shadow-lg flex items-center justify-center text-slate-600 cursor-pointer"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 h-full flex flex-col animate-fade-in" style={{ background: "#0f0c3c" }}>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={[
          "hidden md:flex flex-col h-full flex-shrink-0 relative transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-[272px]",
        ].join(" ")}
        style={{ background: "linear-gradient(180deg, #1e1b4b 0%, #0f0c3c 100%)" }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
