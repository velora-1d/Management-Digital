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

  const pages = [
    {
      title: "Halaman Beranda",
      path: "/",
      badge: "Utama",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
      desc: "Banner utama, statistik cepat, program unggulan, dan ajakan PPDB.",
      sections: [
        { name: "Hero Banner & Tagline", href: "/admin/cms/settings?tab=beranda" },
        { name: `Banner Slideshow (${stats.heroes})`, href: "/admin/cms/heroes" },
        { name: `Statistik Cepat (${stats.stats})`, href: "/admin/cms/stats" },
        { name: `Program Unggulan (${stats.programs})`, href: "/admin/cms/programs" },
        { name: "Banner Ajakan PPDB", href: "/admin/cms/settings?tab=beranda" },
      ],
      primaryAction: { label: "Edit Section Beranda", href: "/admin/cms/settings?tab=beranda" }
    },
    {
      title: "Halaman Tentang Kami",
      path: "/tentang",
      badge: "Profil",
      icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      desc: "Visi & Misi (+ Tambah Poin), Sejarah Singkat, Nilai Karakter, dan Dewan Guru.",
      sections: [
        { name: "Banner Header Tentang", href: "/admin/cms/settings?tab=tentang" },
        { name: "Sejarah & Motto Sekolah", href: "/admin/cms/settings?tab=tentang" },
        { name: "Visi & Misi (+ Tambah Poin)", href: "/admin/cms/settings?tab=tentang" },
        { name: "Pilar Karakter Santri", href: "/admin/cms/settings?tab=tentang" },
        { name: `Data Tenaga Pendidik (${stats.teachers})`, href: "/admin/cms/teachers" },
        { name: `Sarana & Fasilitas (${stats.facilities})`, href: "/admin/cms/facilities" },
      ],
      primaryAction: { label: "Edit Section Tentang", href: "/admin/cms/settings?tab=tentang" }
    },
    {
      title: "Halaman Prestasi",
      path: "/prestasi",
      badge: `${stats.achievements} Data`,
      icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
      desc: "Daftar capaian prestasi santri dan lembaga dari tingkat kecamatan s/d internasional.",
      sections: [
        { name: "Galeri Prestasi & Sertifikat", href: "/admin/cms/achievements" },
        { name: "Filter Tingkat Kompetisi", href: "/admin/cms/achievements" },
      ],
      primaryAction: { label: "Kelola Prestasi", href: "/admin/cms/achievements" }
    },
    {
      title: "Halaman Berita & Informasi",
      path: "/informasi",
      badge: `${stats.posts} Berita`,
      icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2zM7 8h5m-5 4h5m-5 4h10",
      desc: "Artikel kegiatan madrasah, pengumuman resmi, dan publikasi agenda.",
      sections: [
        { name: "Daftar Artikel & Berita", href: "/admin/cms/posts" },
        { name: "Pengumuman Penting", href: "/admin/cms/posts" },
      ],
      primaryAction: { label: "Kelola Artikel", href: "/admin/cms/posts" }
    },
    {
      title: "Halaman PPDB Online",
      path: "/ppdb",
      badge: `${stats.ppdb.total} Siswa`,
      icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222",
      desc: "Informasi alur pendaftaran, kuota penerimaan, biaya, dan database pendaftar.",
      sections: [
        { name: "Informasi Kuota & Biaya", href: "/admin/cms/settings?tab=ppdb" },
        { name: "Alur & WhatsApp PPDB", href: "/admin/cms/settings?tab=ppdb" },
        { name: `Verifikasi Data Masuk (${stats.ppdb.total})`, href: "/admin/cms/ppdb" },
      ],
      primaryAction: { label: "Edit Section PPDB", href: "/admin/cms/settings?tab=ppdb" }
    },
    {
      title: "Identitas Lembaga & Global",
      path: "Header & Footer",
      badge: "Sistem",
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
      desc: "Logo madrasah, alamat resmi, NPSN, akreditasi, telepon, dan media sosial.",
      sections: [
        { name: "Logo & Nama Lembaga", href: "/admin/cms/settings?tab=identitas" },
        { name: "Alamat, Telepon & Email", href: "/admin/cms/settings?tab=identitas" },
        { name: "Instagram, YouTube, FB", href: "/admin/cms/settings?tab=identitas" },
        { name: "Google Maps Lokasi", href: "/admin/cms/settings?tab=identitas" },
      ],
      primaryAction: { label: "Edit Identitas Global", href: "/admin/cms/settings?tab=identitas" }
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-blue-600">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Pendaftar Masuk</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-4xl font-black text-slate-900">{stats.ppdb.total}</span>
            <span className="text-slate-500 text-sm mb-1 font-semibold">Calon Santri</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <svg className="w-16 h-16 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Sumber Dari Web Profil</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-4xl font-black text-slate-900">{stats.ppdb.web}</span>
            <div className="flex flex-col mb-1">
              <span className="text-emerald-600 text-xs font-bold">+{stats.ppdb.conversion}%</span>
              <span className="text-slate-400 text-[10px]">Pendaftar Online</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">Page-Builder CMS</span>
            <h1 className="text-xl font-black text-slate-900 mt-1">Struktur Menu Halaman</h1>
            <p className="text-slate-500 text-xs mt-0.5">Kelola konten per halaman &amp; per section</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </div>
        </div>
      </div>

      {/* Grid Menu Halaman */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">Daftar Menu Halaman Web</h2>
            <p className="text-xs text-slate-500">Pilih halaman yang ingin Anda edit teks, banner, atau poin-poinnya.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((p, i) => (
            <div 
              key={i} 
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-blue-400 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={p.icon} />
                    </svg>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                      {p.badge}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 mt-1">{p.path}</span>
                  </div>
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-1">{p.title}</h3>
                <p className="text-xs text-slate-500 mb-5 leading-relaxed">{p.desc}</p>

                {/* Section List */}
                <div className="space-y-1.5 border-t border-slate-100 pt-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Section Tersedia:</p>
                  {p.sections.map((sec, si) => (
                    <Link 
                      key={si} 
                      href={sec.href}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-500" />
                        {sec.name}
                      </span>
                      <span className="text-[10px] text-slate-400 group-hover:text-blue-600">Kelola &rarr;</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100">
                <Link
                  href={p.primaryAction.href}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <span>{p.primaryAction.label}</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
