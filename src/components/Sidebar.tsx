"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Swal from "sweetalert2";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ArrowLeftRight,
  Building2,
  Calendar,
  Coins,
  BookOpen,
  UserCheck,
  Clock,
  CheckSquare,
  BookMarked,
  FileSpreadsheet,
  Award,
  Sparkles,
  HeartHandshake,
  CalendarDays,
  CreditCard,
  Wallet,
  PiggyBank,
  Heart,
  Receipt,
  BarChart3,
  Boxes,
  ShoppingCart,
  BadgePercent,
  Briefcase,
  UserCog,
  Banknote,
  Mail,
  Megaphone,
  School,
  Globe,
  ExternalLink,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { SIDEBAR_PERMISSIONS, type Role } from "@/lib/rbac-permissions";
import { ensureHttpsUrl } from "@/lib/url";

interface MenuItem {
  name: string;
  short: string;
  href: string;
  icon: LucideIcon;
}

interface MenuGroup {
  group: string;
  items: MenuItem[];
}

const menuItems: MenuGroup[] = [
  {
    group: "UTAMA",
    items: [
      { name: "Dashboard", short: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    group: "PENERIMAAN",
    items: [
      { name: "Penerimaan PPDB", short: "PPDB", href: "/ppdb", icon: Users },
      { name: "Daftar Ulang", short: "Daftar Ulang", href: "/re-registration", icon: GraduationCap },
    ],
  },
  {
    group: "DATA MASTER",
    items: [
      { name: "Tingkatan Sekolah", short: "Jenjang", href: "/school-levels", icon: School },
      { name: "Data Siswa", short: "Siswa", href: "/students", icon: Users },
      { name: "Mutasi & Kenaikan", short: "Mutasi", href: "/mutations", icon: ArrowLeftRight },
      { name: "Kelas", short: "Kelas", href: "/classrooms", icon: Building2 },
      { name: "Tahun Ajaran", short: "Tahun", href: "/academic-years", icon: Calendar },
      { name: "Kategori Keuangan", short: "Kategori", href: "/transaction-categories", icon: Coins },
    ],
  },
  {
    group: "AKADEMIK",
    items: [
      { name: "Mata Pelajaran", short: "Mapel", href: "/subjects", icon: BookOpen },
      { name: "Penugasan Guru", short: "Penugasan", href: "/teaching-assignments", icon: UserCheck },
      { name: "Jadwal Pelajaran", short: "Jadwal", href: "/schedules", icon: Clock },
      { name: "Absensi Siswa", short: "Absensi", href: "/attendance", icon: CheckSquare },
      { name: "Manajemen Kurikulum", short: "Kurikulum", href: "/curriculum", icon: BookMarked },
      { name: "Input Nilai Siswa", short: "Nilai", href: "/grades", icon: FileSpreadsheet },
      { name: "Rapor Digital", short: "Rapor", href: "/report-cards", icon: Award },
      { name: "Ekstrakurikuler", short: "Ekskul", href: "/extracurricular", icon: Sparkles },
      { name: "Bimbingan Konseling", short: "BK", href: "/counseling", icon: HeartHandshake },
      { name: "Kalender Akademik", short: "Kalender", href: "/calendar", icon: CalendarDays },
    ],
  },
  {
    group: "KEUANGAN",
    items: [
      { name: "Infaq / SPP", short: "Infaq", href: "/infaq-bills", icon: CreditCard },
      { name: "Akun Kas", short: "Akun Kas", href: "/cash-accounts", icon: Wallet },
      { name: "Tabungan Siswa", short: "Tabungan", href: "/tabungan", icon: PiggyBank },
      { name: "Wakaf & Donasi", short: "Wakaf", href: "/wakaf", icon: Heart },
      { name: "Jurnal Umum", short: "Jurnal", href: "/journal", icon: Receipt },
      { name: "Laporan", short: "Laporan", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    group: "KOPERASI",
    items: [
      { name: "Produk Koperasi", short: "Produk", href: "/coop/products", icon: Boxes },
      { name: "Transaksi / Kasir", short: "Kasir", href: "/coop/transactions", icon: ShoppingCart },
      { name: "Piutang Siswa", short: "Piutang", href: "/coop/credits", icon: BadgePercent },
    ],
  },
  {
    group: "SDM",
    items: [
      { name: "Data Guru", short: "Guru", href: "/teachers", icon: Briefcase },
      { name: "Data Staf", short: "Staf", href: "/staff", icon: UserCog },
      { name: "Payroll", short: "Gaji", href: "/payroll", icon: Banknote },
    ],
  },
  {
    group: "TATA USAHA",
    items: [
      { name: "Absensi Pegawai", short: "Absensi", href: "/employee-attendance", icon: Clock },
      { name: "Manajemen Surat", short: "Surat", href: "/letters", icon: Mail },
      { name: "Pengumuman", short: "Pengumuman", href: "/announcements", icon: Megaphone },
      { name: "Inventaris", short: "Inventaris", href: "/inventory", icon: Boxes },
      { name: "Profil Sekolah", short: "Profil", href: "/school-profile", icon: School },
    ],
  },
  {
    group: "WEBSITE",
    items: [
      { name: "Website Profil Madrasah", short: "CMS", href: "/admin/cms", icon: Globe },
      { name: "Lihat Website", short: "Preview", href: "__external:https://profil.assaodah.santrix.my.id/", icon: ExternalLink },
    ],
  },
  {
    group: "SISTEM",
    items: [
      { name: "Pengaturan", short: "Setting", href: "/settings", icon: Settings },
    ],
  },
];

function hasMenuAccess(href: string, role: string): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase().replace(/\s+/g, "");
  if (normalizedRole === "superadmin") return true;
  const allowed = SIDEBAR_PERMISSIONS[href];
  if (!allowed) return true;
  return allowed.includes(normalizedRole as Role);
}

export default function Sidebar({
  user,
  collapsed,
  onToggle,
}: {
  user: { name: string; role: string };
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState<{ name: string; logo: string } | null>(null);
  const [activeLevelName, setActiveLevelName] = useState<string>("Tingkat Aktif");

  useEffect(() => {
    fetch("/api/settings/profile")
      .then((res) => res.json())
      .then((data) => setProfile({ name: data.name, logo: ensureHttpsUrl(data.logo) }))
      .catch(console.error);

    fetch("/api/school-levels")
      .then((res) => res.json())
      .then((data) => {
        if (data.activeLevel?.name) {
          setActiveLevelName(data.activeLevel.name);
        }
      })
      .catch(() => {});

    const handleLevelChange = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail?.name) {
        setActiveLevelName(custom.detail.name);
      }
    };

    window.addEventListener("school-level-changed", handleLevelChange);
    window.addEventListener("school-level-synced", handleLevelChange);

    return () => {
      window.removeEventListener("school-level-changed", handleLevelChange);
      window.removeEventListener("school-level-synced", handleLevelChange);
    };
  }, []);

  // Close mobile sidebar on route change
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setMobileOpen(false);
  }

  const schoolName = profile?.name || "Madrasah Digital";
  const schoolInitials = schoolName
    .replace(/^(SMK|SMA|SMP|SD|MI|MTs|MA|Pondok Pesantren|Ponpes|PKBM)\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "MD";

  const userInitials = (user.name || "A")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "A";

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Konfirmasi Keluar",
      text: "Apakah Anda yakin ingin keluar dari sistem?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#1B3B4B] text-[#CBDCE6] select-none relative overflow-hidden">
      {/* Mobile Close Button */}
      <button
        onClick={() => setMobileOpen(false)}
        className="md:hidden absolute top-4 right-4 text-[#7E9BAA] hover:text-white p-1.5 rounded-lg transition-colors z-30 cursor-pointer"
        aria-label="Tutup Menu"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Desktop Collapse Toggle Button (Top Right Header) */}
      <button
        type="button"
        onClick={onToggle}
        className={`hidden md:flex items-center justify-center rounded-lg text-[#7E9BAA] hover:text-white hover:bg-white/10 transition-all z-30 cursor-pointer ${
          collapsed
            ? "mx-auto mt-3 w-8 h-8"
            : "absolute top-3.5 right-3.5 w-7 h-7"
        }`}
        title={collapsed ? "Perluas Sidebar" : "Kecilkan Sidebar"}
        aria-label={collapsed ? "Perluas Sidebar" : "Kecilkan Sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* ─── School & Active Level Section (Top Avatar with Concentric Ring) ─── */}
      <div
        className={`flex flex-col items-center transition-all duration-200 border-b border-white/[0.06] ${
          collapsed ? "py-4 px-2" : "pt-7 pb-5 px-4"
        }`}
      >
        {/* School Avatar with concentric ring from Edu-sistem */}
        <div className="relative shrink-0">
          <div
            className={`p-1 rounded-full border-2 border-teal-400/40 bg-[#16313E] flex items-center justify-center transition-all duration-200 ${
              collapsed ? "w-11 h-11" : "w-20 h-20"
            }`}
            title={`${schoolName} - Management Digital`}
          >
            {profile?.logo ? (
              <div
                className={`rounded-full overflow-hidden bg-white flex items-center justify-center shadow-inner ${
                  collapsed ? "w-8 h-8 p-0.5" : "w-16 h-16 p-1"
                }`}
              >
                <Image
                  src={ensureHttpsUrl(profile.logo)}
                  alt="Logo"
                  width={collapsed ? 32 : 64}
                  height={collapsed ? 32 : 64}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
            ) : (
              <div
                className={`rounded-full bg-gradient-to-tr from-teal-500 to-sky-400 flex items-center justify-center font-bold text-white shadow-inner ${
                  collapsed ? "w-8 h-8 text-xs" : "w-16 h-16 text-lg tracking-wider"
                }`}
              >
                {schoolInitials}
              </div>
            )}
          </div>
          {/* Active online status badge */}
          <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#1B3B4B]" />
        </div>

        {/* School Name & Active Level */}
        {!collapsed && (
          <div className="mt-3 text-center w-full px-2 overflow-hidden">
            <p
              className="text-[14px] font-bold text-white truncate leading-tight tracking-tight"
              title={schoolName}
            >
              {schoolName}
            </p>
            <div className="mt-1 flex items-center justify-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span
                className="text-[11.5px] text-[#8CB4C8] font-medium truncate max-w-[190px]"
                title={activeLevelName}
              >
                {activeLevelName}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─── Navigation Items ─── */}
      <div
        id="sidebar-nav"
        className="flex-1 overflow-y-auto overflow-x-hidden py-3 scrollbar-none space-y-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {menuItems.map((group, gi) => {
          const visibleItems = group.items.filter((item) => {
            if (item.href === "/cash-accounts") return true;
            return hasMenuAccess(item.href, user.role);
          });
          if (visibleItems.length === 0) return null;

          return (
            <div key={gi} className="space-y-1">
              {/* Section Label */}
              {!collapsed && (
                <p className="px-5 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#557B8F]">
                  {group.group}
                </p>
              )}

              {collapsed && gi > 0 && (
                <div className="mx-3 my-1.5 border-t border-white/[0.08]" />
              )}

              {/* Nav items */}
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isExternal = item.href.startsWith("__external:");
                  const externalUrl = isExternal ? item.href.replace("__external:", "") : null;
                  const currentPath = pathname.replace(/\/+$/, "") || "/";
                  const itemPath = item.href.replace(/\/+$/, "") || "/";
                  const isActive =
                    !isExternal &&
                    (currentPath === itemPath ||
                      (itemPath !== "/" &&
                        itemPath !== "/dashboard" &&
                        currentPath.startsWith(itemPath)));

                  // Collapsed mode item
                  if (collapsed) {
                    if (isExternal) {
                      return (
                        <a
                          key={item.href}
                          href={externalUrl!}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={item.name}
                          className="relative flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-150 text-[#BACED8] hover:text-white hover:bg-white/[0.08]"
                        >
                          <Icon className="w-5 h-5 shrink-0" />
                        </a>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        title={item.name}
                        className={`relative flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-150 ${
                          isActive
                            ? "bg-slate-50 text-[#1B3B4B] shadow-md font-bold"
                            : "text-[#BACED8] hover:text-white hover:bg-white/[0.08]"
                        }`}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                      </Link>
                    );
                  }

                  // Expanded mode: Curved Tab Cutout (Inverted Border-Radius)
                  if (isActive) {
                    return (
                      <div key={item.href} className="relative w-full">
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="group relative flex items-center gap-3.5 w-[calc(100%-12px)] ml-auto pl-4 pr-3 py-3 bg-slate-50 text-[#1B3B4B] font-bold text-[13.5px] rounded-l-full z-10"
                        >
                          {/* Top concave curve (scoop into sidebar above) */}
                          <div className="absolute -top-6 right-0 w-6 h-6 pointer-events-none overflow-hidden z-20">
                            <svg
                              className="w-full h-full text-slate-50 fill-current"
                              viewBox="0 0 24 24"
                              preserveAspectRatio="none"
                            >
                              <path d="M0 24 C13.25 24 24 13.25 24 0 L24 25 L0 25 Z" />
                            </svg>
                          </div>

                          {/* Bottom concave curve (scoop into sidebar below) */}
                          <div className="absolute -bottom-6 right-0 w-6 h-6 pointer-events-none overflow-hidden z-20">
                            <svg
                              className="w-full h-full text-slate-50 fill-current"
                              viewBox="0 0 24 24"
                              preserveAspectRatio="none"
                            >
                              <path d="M0 0 C13.25 0 24 10.75 24 24 L24 -1 L0 -1 Z" />
                            </svg>
                          </div>

                          {/* Active Icon */}
                          <Icon className="w-4 h-4 shrink-0 text-[#1B3B4B] stroke-[2.3]" />

                          {/* Active Label */}
                          <span className="truncate flex-1 tracking-tight">
                            {item.name}
                          </span>
                        </Link>
                      </div>
                    );
                  }

                  // Inactive item
                  return (
                    <div key={item.href} className="px-3">
                      {isExternal ? (
                        <a
                          href={externalUrl!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-3.5 px-4 py-2 rounded-xl text-[13px] font-medium text-[#CBDCE6] hover:text-white hover:bg-white/[0.08] transition-all duration-150 ease-out hover:translate-x-0.5"
                        >
                          <Icon className="w-4 h-4 shrink-0 text-[#8EAFBF] group-hover:text-teal-300 transition-colors" />
                          <span className="truncate flex-1">{item.name}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#7E9BAA] group-hover:text-white shrink-0 ml-auto" />
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="group flex items-center gap-3.5 px-4 py-2 rounded-xl text-[13px] font-medium text-[#CBDCE6] hover:text-white hover:bg-white/[0.08] transition-all duration-150 ease-out hover:translate-x-0.5"
                        >
                          <Icon className="w-4 h-4 shrink-0 text-[#8EAFBF] group-hover:text-teal-300 transition-colors" />
                          <span className="truncate flex-1">{item.name}</span>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Bottom Actions (User Info & Logout) ─── */}
      <div className="border-t border-white/[0.06] p-3 space-y-1">
        {/* User Mini Card */}
        {!collapsed ? (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.04]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-sky-400 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-inner">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-[#8CB4C8] uppercase tracking-wider truncate font-mono">
                {user.role}
              </p>
            </div>
          </div>
        ) : (
          <div
            className="w-8 h-8 mx-auto rounded-full bg-gradient-to-tr from-teal-500 to-sky-400 flex items-center justify-center text-white font-bold text-xs shadow-inner"
            title={`${user.name} (${user.role})`}
          >
            {userInitials}
          </div>
        )}

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className={`group w-full flex items-center gap-3 rounded-xl text-[13px] font-medium text-[#8EAFBF] hover:text-red-300 hover:bg-red-500/10 transition-all duration-150 cursor-pointer ${
            collapsed ? "justify-center w-10 h-10 mx-auto p-0" : "px-4 py-2.5"
          }`}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger Trigger Button */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Buka menu navigasi"
        className="md:hidden fixed top-3.5 left-4 z-40 w-9 h-9 bg-[#1B3B4B] text-[#CBDCE6] border border-white/10 rounded-lg shadow-xs flex items-center justify-center hover:text-white hover:bg-white/10 cursor-pointer"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] h-full flex flex-col shadow-2xl animate-fade-in">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col h-full shrink-0 relative transition-all duration-300 ease-in-out ${
          collapsed ? "w-[72px]" : "w-[240px]"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
