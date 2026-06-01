export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from "@/db";
import { 
  webPosts, webFacilities, 
  webAchievements, webHeroes,
  webPrograms, webStats, ppdbRegistrations,
  employees
} from "@/db/schema";
import { count, eq, and, isNull } from "drizzle-orm";
import Link from "next/link";

async function getCMSStats() {
  const [
    teachersCount,
    postsCount,
    facilitiesCount,
    achievementsCount,
    heroesCount,
    programsCount,
    statsCount,
    ppdbTotal,
    ppdbWeb
  ] = await Promise.all([
    db.select({ count: count() }).from(employees).where(
      and(
        eq(employees.type, 'guru'),
        isNull(employees.deletedAt)
      )
    ),
    db.select({ count: count() }).from(webPosts),
    db.select({ count: count() }).from(webFacilities),
    db.select({ count: count() }).from(webAchievements),
    db.select({ count: count() }).from(webHeroes),
    db.select({ count: count() }).from(webPrograms),
    db.select({ count: count() }).from(webStats),
    db.select({ count: count() }).from(ppdbRegistrations).where(isNull(ppdbRegistrations.deletedAt)),
    db.select({ count: count() }).from(ppdbRegistrations).where(
      and(
        eq(ppdbRegistrations.registrationSource, 'web_profil'),
        isNull(ppdbRegistrations.deletedAt)
      )
    ),
  ]);

  return {
    posts: postsCount[0]?.count || 0,
    teachers: teachersCount[0]?.count || 0,
    facilities: facilitiesCount[0]?.count || 0,
    achievements: achievementsCount[0]?.count || 0,
    heroes: heroesCount[0]?.count || 0,
    programs: programsCount[0]?.count || 0,
    stats: statsCount[0]?.count || 0,
    ppdb: {
      total: ppdbTotal[0]?.count || 0,
      web: ppdbWeb[0]?.count || 0,
      conversion: ppdbTotal[0]?.count > 0 
        ? Math.round(((ppdbWeb[0]?.count || 0) / ppdbTotal[0]?.count) * 100) 
        : 0
    }
  };
}

export default async function CMSPage() {
  const stats = await getCMSStats();

  const modules = [
    { name: "Berita & Pengumuman", href: "/admin/cms/posts", count: stats.posts, icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2zM7 8h5m-5 4h5m-5 4h10", color: "blue" },
    { name: "Program Unggulan", href: "/admin/cms/programs", count: stats.programs, icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", color: "emerald" },
    { name: "Statistik Sekolah", href: "/admin/cms/stats", count: stats.stats, icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", color: "orange" },
    { name: "Data Guru (Tampilan Web)", href: "/admin/cms/teachers", count: stats.teachers, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", color: "purple" },
    { name: "Sarana & Fasilitas", href: "/admin/cms/facilities", count: stats.facilities, icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", color: "green" },
    { name: "Prestasi & Penghargaan", href: "/admin/cms/achievements", count: stats.achievements, icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z", color: "amber" },
    { name: "Banner Slideshow (Beranda)", href: "/admin/cms/heroes", count: stats.heroes, icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", color: "rose" },
    { name: "Info PPDB & Pendaftaran", href: "/admin/cms/ppdb", count: null, icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222", color: "indigo" },
    { name: "Profil & Identitas Sekolah", href: "/admin/cms/settings", count: null, icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z", color: "slate" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-linear-to-br from-indigo-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200">
          <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider">Total Pendaftar PPDB</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-4xl font-black">{stats.ppdb.total}</span>
            <span className="text-indigo-200 text-sm mb-1">Siswa</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <svg className="w-16 h-16 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
          </div>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Dari Web Profil (KPI)</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-4xl font-black text-slate-900">{stats.ppdb.web}</span>
            <div className="flex flex-col mb-1">
              <span className="text-emerald-600 text-xs font-bold">+{stats.ppdb.conversion}%</span>
              <span className="text-slate-400 text-[10px]">Kontribusi Web</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Website Profil Madrasah</h1>
            <p className="text-slate-500 text-sm mt-0.5">Pusat Kontrol Konten Publik</p>
          </div>
          <div className="bg-indigo-50 p-2.5 rounded-xl">
             <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
      </div>

      {/* Grid Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod, i) => (
          <Link 
            key={i} 
            href={mod.href}
            className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 relative overflow-hidden flex flex-col items-center text-center"
          >
            <div className={`w-16 h-16 rounded-2xl bg-${mod.color}-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <svg className={`w-8 h-8 text-${mod.color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mod.icon} />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{mod.name}</h3>
            {mod.count !== null && (
              <p className="text-sm font-medium text-slate-500">{mod.count} entri data</p>
            )}
            <div className="mt-6 w-full py-2 bg-slate-50 rounded-xl text-slate-600 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              Kelola Modul
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
