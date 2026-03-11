import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import DashboardCharts from "@/components/DashboardCharts";
import FilterBar from "@/components/FilterBar";
import DashboardTabs from "@/components/DashboardTabs";
import { Suspense } from "react";

// ISR: revalidate setiap 60 detik agar lebih ringan dan mengurangi SSR time (bottleneck LCP).
export const revalidate = 60;

async function getDashboardData(searchParams: any) {
  const academicYearId = searchParams.academicYearId ? Number(searchParams.academicYearId) : null;
  const semester = searchParams.semester;
  const month = searchParams.month;
  const classroomId = searchParams.classroomId ? Number(searchParams.classroomId) : null;
  const gender = searchParams.gender;

  // 1. Tentukan Tahun Ajaran Target
  let targetAcademicYearId = academicYearId;
  if (!targetAcademicYearId) {
    const activeYear = await prisma.academicYear.findFirst({
      where: { isActive: true, deletedAt: null },
    });
    targetAcademicYearId = activeYear?.id || null;
  }

  // 2. Rentang Waktu Keuangan
  const now = new Date();
  let dateFilter: any = {};
  if (month) {
    const monthMap: Record<string, number> = {
      "Januari": 0, "Februari": 1, "Maret": 2, "April": 3, "Mei": 4, "Juni": 5,
      "Juli": 6, "Agustus": 7, "September": 8, "Oktober": 9, "November": 10, "Desember": 11
    };
    const mIdx = monthMap[month] ?? now.getMonth();
    const start = new Date(now.getFullYear(), mIdx, 1);
    const end = new Date(now.getFullYear(), mIdx + 1, 0, 23, 59, 59);
    dateFilter = { gte: start, lte: end };
  } else {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    dateFilter = { gte: start, lte: end };
  }

  // 3. Filter Query
  const enrollmentWhere: any = { 
    deletedAt: null, 
    ...(targetAcademicYearId ? { academicYearId: targetAcademicYearId } : {}),
    ...(classroomId ? { classroomId } : {}),
    ...(gender ? { student: { gender } } : {})
  };

  const billWhere: any = { 
    status: "belum_lunas", 
    deletedAt: null,
    ...(targetAcademicYearId ? { academicYearId: targetAcademicYearId } : {}),
    ...(month ? { month } : {}),
    ...(classroomId ? { student: { classroomId } } : {}),
    ...(gender ? { student: { gender } } : {})
  };

  if (semester) {
    const ganjilMonths = ["Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const genapMonths = ["Januari", "Februari", "Maret", "April", "Mei", "Juni"];
    billWhere.month = { in: semester.toLowerCase() === "ganjil" ? ganjilMonths : genapMonths };
  }

  const [
    totalSiswa,
    totalSiswaPa,
    totalSiswaPi,
    employeesGroup,
    classroomsCount,
    ppdbGroup,
    incomePeriode,
    expensePeriode,
    savingsAgg,
    tunggakanCount,
    tunggakanTotalNominalAgg,
    tunggakanPa,
    tunggakanPi,
    tunggakanSiswaUniq,
    wakafAgg,
    coopTrxAgg,
    coopCreditAgg,
    counselingCount,
    announcementsCount,
    lettersCount,
  ] = await Promise.all([
    prisma.studentEnrollment.count({ where: enrollmentWhere }),
    prisma.studentEnrollment.count({ where: { ...enrollmentWhere, student: { gender: "L" } } }),
    prisma.studentEnrollment.count({ where: { ...enrollmentWhere, student: { gender: "P" } } }),
    prisma.employee.groupBy({ by: ["type"], _count: { id: true }, where: { deletedAt: null, status: "aktif" } }),
    prisma.classroom.count({ where: { deletedAt: null, ...(targetAcademicYearId ? { academicYearId: targetAcademicYearId } : {}) } }),
    prisma.ppdbRegistration.groupBy({ by: ["status"], _count: { id: true }, where: { deletedAt: null, ...(gender ? { gender } : {}) } }),
    prisma.generalTransaction.aggregate({
      where: { type: "in", status: "valid", deletedAt: null, createdAt: dateFilter },
      _sum: { amount: true },
    }),
    prisma.generalTransaction.aggregate({
      where: { type: "out", status: "valid", deletedAt: null, createdAt: dateFilter },
      _sum: { amount: true },
    }),
    prisma.studentSaving.aggregate({
      where: { deletedAt: null, ...(gender ? { student: { gender } } : {}) },
      _sum: { amount: true },
    }),
    prisma.infaqBill.count({ where: billWhere }),
    prisma.infaqBill.aggregate({ where: billWhere, _sum: { nominal: true } }),
    prisma.infaqBill.count({ where: { ...billWhere, student: { gender: "L" } } }),
    prisma.infaqBill.count({ where: { ...billWhere, student: { gender: "P" } } }),
    prisma.infaqBill.groupBy({ by: ["studentId"], where: billWhere }),
    prisma.generalTransaction.aggregate({
      where: { type: "in", status: "valid", deletedAt: null, createdAt: dateFilter, category: { name: { contains: "wakaf", mode: "insensitive" as any } } },
      _sum: { amount: true },
    }),
    prisma.coopTransaction.aggregate({
      where: { createdAt: dateFilter },
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.studentCredit.aggregate({
      where: { status: { not: "lunas" } },
      _sum: { amount: true, paidAmount: true },
    }),
    prisma.counselingRecord.count({
      where: { date: { startsWith: now.toISOString().substring(0, 7) } }
    }),
    prisma.announcement.count({
      where: { status: "aktif" }
    }),
    prisma.letter.count({
      where: { date: { startsWith: now.toISOString().substring(0, 7) } }
    }),
  ]);

  const totalGuru = employeesGroup.find(e => e.type === "guru")?._count.id || 0;
  const totalStaff = employeesGroup.find(e => e.type === "staf")?._count.id || 0;
  
  const ppdbPending = ppdbGroup.find(p => p.status === "pending" || p.status === "menunggu")?._count.id || 0;
  const ppdbDiterima = ppdbGroup.find(p => p.status === "diterima")?._count.id || 0;

  const tunggakanTotalNominal = tunggakanTotalNominalAgg._sum.nominal || 0;

  const lunasCount = totalSiswa - tunggakanSiswaUniq.length;
  const complianceRate = totalSiswa > 0 ? Math.round((lunasCount / totalSiswa) * 100) : 0;

  const piutangKoperasi = (coopCreditAgg._sum.amount || 0) - (coopCreditAgg._sum.paidAmount || 0);

  return {
    totalSiswa,
    totalSiswaPa,
    totalSiswaPi,
    totalGuru,
    totalStaff,
    totalKelas: classroomsCount,
    ppdbPending,
    ppdbDiterima,
    pemasukanPeriode: incomePeriode._sum.amount || 0,
    pengeluaranPeriode: expensePeriode._sum.amount || 0,
    // Alias agar kompatibel dengan DashboardCharts
    pemasukanBulanIni: incomePeriode._sum.amount || 0,
    pengeluaranBulanIni: expensePeriode._sum.amount || 0,
    saldoTabungan: savingsAgg._sum.amount || 0,
    totalWakaf: wakafAgg._sum.amount || 0,
    tunggakanTotal: tunggakanCount,
    tunggakanTotalNominal,
    tunggakanPa,
    tunggakanPi,
    complianceRate,
    // Modul Baru
    coopTotal: coopTrxAgg._sum.total || 0,
    coopCount: coopTrxAgg._count.id || 0,
    piutangKoperasi,
    counselingCount,
    announcementsCount,
    lettersCount,
  };
}

function fmtRp(n: number) {
  return "Rp " + (n || 0).toLocaleString("id-ID");
}

export default async function DashboardPage(props: { searchParams: Promise<any> }) {
  const searchParams = await props.searchParams;
  const user = await getAuthUser();

  const roleTabs: Record<string, string[]> = {
    superadmin: ["overview", "finance", "academic", "hr"],
    admin: ["overview", "academic", "hr"],
    bendahara: ["finance"],
    operator: ["overview", "academic"],
    guru: ["academic"],
    siswa: ["overview"]
  };

  const allowedTabs = roleTabs[user?.role || "operator"] || ["overview"];
  let activeTab = searchParams?.tab || allowedTabs[0];

  if (!allowedTabs.includes(activeTab)) {
    activeTab = allowedTabs[0];
  }

  // Gunakan key kombinasi tab dan filter agar skeleton muncul saat filter/tab berubah
  const suspenseKey = `${activeTab}-${JSON.stringify(searchParams)}`;

  return (
    <div className="space-y-6">
      <FilterBar />
      <DashboardTabs initialTab={activeTab} allowedTabs={allowedTabs} />
      
      <Suspense key={suspenseKey} fallback={<DashboardContentLoading />}>
        <DashboardContent searchParams={searchParams} activeTab={activeTab} user={user} />
      </Suspense>
    </div>
  );
}

function DashboardContentLoading() {
  return (
    <div className="space-y-6">
      {/* Hero Placeholder */}
      <div className="h-[104px] rounded-2xl bg-indigo-50 animate-pulse border border-indigo-100"></div>
      {/* Stats Grid Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-start gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0"></div>
            <div className="flex-1 space-y-3 py-1">
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              <div className="h-6 bg-slate-300 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="h-64 bg-slate-50 rounded-xl border border-slate-100 animate-pulse"></div>
    </div>
  );
}

async function DashboardContent({ searchParams, activeTab, user }: { searchParams: any, activeTab: string, user: any }) {
  const data = await getDashboardData(searchParams);

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="anim-hero" style={{ background: "linear-gradient(135deg,#312e81 0%,#1e1b4b 50%,#0f172a 100%)", borderRadius: "1rem", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, background: "rgba(255,255,255,0.04)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", right: 80, bottom: -40, width: 150, height: 150, background: "rgba(255,255,255,0.03)", borderRadius: "50%" }} />
        <div style={{ padding: "1.5rem 2rem", position: "relative", zIndex: 10 }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 flex items-center justify-center rounded-xl" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "1.5px solid rgba(255,255,255,0.15)" }}>
                <svg className="w-5.5 h-5.5" style={{ color: "#f59e0b" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              </div>
              <div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.25rem", color: "#fff" }}>Halo, {user?.name || "Administrator"}!</h2>
                <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)", marginTop: "0.125rem" }}>Ringkasan Data Panel: {
                  activeTab === 'overview' ? 'Utama / General' : 
                  activeTab === 'finance' ? 'Keuangan & Pembayaran' : 
                  activeTab === 'academic' ? 'Akademik & Kesiswaan' : 'HR & Operasional'
                }</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TAB OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard anim={1} label="Siswa Aktif (Enroll)" value={data.totalSiswa} color="#6366f1" bg="#e0e7ff" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            footer={<><span>Putra: <strong style={{ color: "#6366f1" }}>{data.totalSiswaPa}</strong></span><span>Putri: <strong style={{ color: "#f59e0b" }}>{data.totalSiswaPi}</strong></span></>}
          />
          <KpiCard anim={2} label="Pemasukan (Netto)" value={fmtRp(data.pemasukanBulanIni - data.pengeluaranBulanIni)} color="#10b981" bg="#d1fae5" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" small
            footer={<><span>In: <strong style={{ color: "#10b981" }}>{fmtRp(data.pemasukanPeriode)}</strong></span><span>Out: <strong style={{ color: "#f43f5e" }}>{fmtRp(data.pengeluaranPeriode)}</strong></span></>}
          />
          <KpiCard anim={3} label="Total Guru & Staff" value={data.totalGuru + data.totalStaff} color="#8b5cf6" bg="#ede9fe" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            footer={<><span>Guru: <strong style={{ color: "#8b5cf6" }}>{data.totalGuru}</strong></span><span>Staff: <strong style={{ color: "#a78bfa" }}>{data.totalStaff}</strong></span></>}
          />
          <KpiCard anim={4} label="Pendaftar PPDB" value={data.ppdbPending + data.ppdbDiterima} color="#0ea5e9" bg="#e0f2fe" icon="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            footer={<><span>Pending: <strong style={{ color: "#0ea5e9" }}>{data.ppdbPending}</strong></span><span>Diterima: <strong style={{ color: "#10b981" }}>{data.ppdbDiterima}</strong></span></>}
          />
          <KpiCard anim={5} label="Kepatuhan Lunas SPP" value={`${data.complianceRate}%`} color="#f59e0b" bg="#fef3c7" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            footer={<><span>Data Berdasarkan Filter Periode</span></>}
          />
        </div>
      )}

      {/* TAB KEUANGAN */}
      {activeTab === "finance" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard anim={1} label="Pemasukan Periode" value={fmtRp(data.pemasukanPeriode)} color="#10b981" bg="#d1fae5" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" small
            footer={<><span>Status Valid</span><strong style={{ color: "#10b981" }}>Lunas</strong></>}
          />
          <KpiCard anim={2} label="Pengeluaran Periode" value={fmtRp(data.pengeluaranPeriode)} color="#f43f5e" bg="#ffe4e6" icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" small valueColor="#f43f5e"
            footer={<><span>Status Valid</span><strong style={{ color: "#f43f5e" }}>Keluar</strong></>}
          />
          <KpiCard anim={3} label="Tunggakan SPP (Siswa)" value={data.tunggakanTotal} color="#f43f5e" bg="#ffe4e6" icon="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" valueColor="#f43f5e"
            footer={<><span>Siswa PA: <strong style={{ color: "#f43f5e" }}>{data.tunggakanPa}</strong></span><span>Siswa PI: <strong style={{ color: "#f43f5e" }}>{data.tunggakanPi}</strong></span></>}
          />
          <KpiCard anim={4} label="Estimasi Tunggakan (Nominal)" value={fmtRp(data.tunggakanTotalNominal)} color="#d97706" bg="#fef3c7" icon="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" small
            footer={<><span>Total Piutang SPP</span><strong style={{ color: "#d97706" }}>Periode</strong></>}
          />
          <KpiCard anim={5} label="Saldo Tabungan Siswa" value={fmtRp(data.saldoTabungan)} color="#06b6d4" bg="#cffafe" icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" small
            footer={<><span>Semua Kelas Aktif</span><strong style={{ color: "#06b6d4" }}>Balance</strong></>}
          />
          <KpiCard anim={6} label="Total Dana Wakaf" value={fmtRp(data.totalWakaf)} color="#65a30d" bg="#ecfccb" icon="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" small
            footer={<><span>Dana Abadi</span><strong style={{ color: "#65a30d" }}>Donasi</strong></>}
          />
        </div>
      )}

      {/* TAB AKADEMIK */}
      {activeTab === "academic" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard anim={1} label="Kelas Periode Ini" value={data.totalKelas} color="#22c55e" bg="#dcfce7" icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            footer={<><span>Aktif: <strong style={{ color: "#22c55e" }}>{data.totalKelas}</strong></span><span>Siswa: <strong style={{ color: "#6366f1" }}>{data.totalSiswa}</strong></span></>}
          />
          <KpiCard anim={2} label="Siswa Aktif Laki-Laki" value={data.totalSiswaPa} color="#0ea5e9" bg="#e0f2fe" icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            footer={<><span>Rasio Laki: <strong>{data.totalSiswa ? Math.round((data.totalSiswaPa/data.totalSiswa)*100) : 0}%</strong></span></>}
          />
          <KpiCard anim={3} label="Siswa Aktif Perempuan" value={data.totalSiswaPi} color="#ec4899" bg="#fce7f3" icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            footer={<><span>Rasio Perempuan: <strong>{data.totalSiswa ? Math.round((data.totalSiswaPi/data.totalSiswa)*100) : 0}%</strong></span></>}
          />
          <KpiCard anim={4} label="Kasus/Catatan BK (Bulan Ini)" value={data.counselingCount} color="#6366f1" bg="#e0e7ff" icon="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            footer={<><span>Riwayat Bimbingan</span><strong style={{ color: "#6366f1" }}>Konseling</strong></>}
          />
        </div>
      )}

      {/* TAB HR & UMUM */}
      {activeTab === "hr" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard anim={1} label="Total Tenaga Pengajar (Guru)" value={data.totalGuru} color="#8b5cf6" bg="#ede9fe" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            footer={<><span>Status Pegawai Aktif</span></>}
          />
          <KpiCard anim={2} label="Total Tenaga Kependidikan" value={data.totalStaff} color="#3b82f6" bg="#dbeafe" icon="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            footer={<><span>Staf & Tata Usaha</span></>}
          />
          <KpiCard anim={3} label="Omzet Koperasi (Bulan Ini)" value={fmtRp(data.coopTotal)} color="#10b981" bg="#d1fae5" icon="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" small
            footer={<><span>Total: <strong>{data.coopCount}</strong> Trx</span><strong style={{ color: "#10b981" }}>Koperasi</strong></>}
          />
          <KpiCard anim={4} label="Administrasi Tata Usaha" value={data.lettersCount} color="#94a3b8" bg="#f1f5f9" icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            footer={<><span>Surat: <strong>{data.lettersCount}</strong></span><span>Berita: <strong>{data.announcementsCount}</strong></span></>}
          />
        </div>
      )}

      <Suspense fallback={<div className="h-64 bg-slate-100 rounded-xl animate-pulse mt-8 border border-slate-200"></div>}>
        <DashboardCharts data={data} tab={activeTab} />
      </Suspense>
    </div>
  );
}

function KpiCard({ anim, label, value, color, bg, icon, footer, small, valueColor }: {
  anim: number; label: string; value: string | number; color: string; bg: string; icon: string; footer: React.ReactNode; small?: boolean; valueColor?: string;
}) {
  return (
    <div className={`kpi-card anim-card-${anim} bg-white p-5 rounded-xl border border-slate-200 relative overflow-hidden`}>
      <div style={{ position: "absolute", right: -16, bottom: -16, width: 80, height: 80, background: bg, borderRadius: "50%", opacity: 0.5 }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="kpi-icon w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
          <svg className="w-5 h-5" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} /></svg>
        </div>
        <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
        <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: small ? "1.25rem" : "1.5rem", color: valueColor || "#1e293b", marginTop: "0.25rem" }}>{value}</p>
        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between" style={{ fontSize: "0.6875rem", color: "#64748b" }}>
          {footer}
        </div>
      </div>
    </div>
  );
}

