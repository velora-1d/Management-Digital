"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, BookOpen, Settings, Wallet,
  Building2, Database, Shield, FileText, Home, Activity
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  // Determine current context based on URL route
  const isOwner = pathname.startsWith('/owner-dashboard');
  const isYayasan = pathname.startsWith('/yayasan-dashboard');
  const isSekolah = pathname.startsWith('/sekolah');
  const isPesantren = pathname.startsWith('/pesantren');
  const isSiswa = pathname.startsWith('/siswa');
  const isWali = pathname.startsWith('/wali');

  // Menu Definition based on brief requirements
  const menus = {
    owner: [
      { name: "SaaS Metrics", icon: Activity, href: "/owner-dashboard" },
      { name: "Tenants", icon: Building2, href: "#" },
      { name: "System Settings", icon: Database, href: "#" },
    ],
    yayasan: [
      { name: "Dashboard", icon: LayoutDashboard, href: "/yayasan-dashboard" },
      { name: "Unit Pendidikan", icon: Building2, href: "#" },
      { name: "Laporan Konsolidasi", icon: FileText, href: "#" },
    ],
    sekolah: [
      { name: "Dashboard", icon: LayoutDashboard, href: "/sekolah/dashboard" },
      { name: "Data Siswa", icon: Users, href: "/sekolah/siswa" },
      { name: "Pembayaran SPP", icon: Wallet, href: "/sekolah/keuangan/spp" },
      { name: "Akademik", icon: BookOpen, href: "#" },
      { name: "Pengaturan", icon: Settings, href: "#" },
    ],
    pesantren: [
      { name: "Dashboard", icon: LayoutDashboard, href: "/pesantren/dashboard" },
      { name: "Santri & Asrama", icon: Home, href: "/pesantren/asrama" },
      { name: "Halaqah Tahfidz", icon: BookOpen, href: "#" },
      { name: "Keuangan", icon: Wallet, href: "#" },
      { name: "Pelanggaran", icon: Shield, href: "#" },
    ],
    siswa: [
      { name: "Beranda", icon: LayoutDashboard, href: "/siswa/siswa-dashboard" },
      { name: "Tugas", icon: BookOpen, href: "#" },
      { name: "Jadwal", icon: Activity, href: "#" },
    ],
    wali: [
      { name: "Beranda Wali", icon: LayoutDashboard, href: "/wali/wali-dashboard" },
      { name: "Tagihan", icon: Wallet, href: "#" },
      { name: "Perkembangan Anak", icon: Activity, href: "#" },
    ]
  };

  let activeMenu = menus.sekolah; // fallback
  let title = "EduVera";
  let subtitle = "SaaS MVP";

  if (isOwner) { activeMenu = menus.owner; title = "EduVera Owner"; subtitle = "Super Admin"; }
  else if (isYayasan) { activeMenu = menus.yayasan; title = "Al-Falah"; subtitle = "Yayasan Admin"; }
  else if (isSekolah) { activeMenu = menus.sekolah; title = "SDIT Al-Falah"; subtitle = "Unit Sekolah"; }
  else if (isPesantren) { activeMenu = menus.pesantren; title = "Pesantren Al-Falah"; subtitle = "Unit Pesantren"; }
  else if (isSiswa) { activeMenu = menus.siswa; title = "Portal Siswa"; subtitle = "Budi Santoso"; }
  else if (isWali) { activeMenu = menus.wali; title = "Portal Wali"; subtitle = "Orang Tua Budi"; }

  return (
    <div className="w-64 bg-sidebar text-sidebar-foreground h-screen flex flex-col border-r border-sidebar-border shadow-xl relative z-20">
      <div className="p-5 border-b border-sidebar-border flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold shadow-sm">
          {title.charAt(0)}
        </div>
        <div>
          <h2 className="font-bold text-lg leading-tight truncate w-40">{title}</h2>
          <p className="text-xs text-sidebar-foreground/70">{subtitle}</p>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {activeMenu.map((item, idx) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm font-medium'
                  : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/80'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/50 text-center">
        EduVera Platform v1.0
      </div>
    </div>
  );
}
