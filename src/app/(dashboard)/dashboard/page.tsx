export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from "@/db";
import { 
  academicYears, studentEnrollments, students, employees, classrooms, 
  ppdbRegistrations, generalTransactions, studentSavings, infaqBills, 
  coopTransactions, studentCredits, counselingRecords, announcements, letters,
  transactionCategories
} from "@/db/schema";
import { getAuthUser, JwtPayload } from "@/lib/auth";
import FilterBar from "@/components/FilterBar";
import DashboardTabs from "@/components/DashboardTabs";
import { Suspense } from "react";
import DashboardCharts from "@/components/DashboardCharts";
import { and, eq, ilike, gte, lte, isNull, inArray, isNotNull, not, or, sql } from "drizzle-orm";

// Halaman berjalan full dynamic SSR — tidak ada ISR/caching
// untuk menghindari tekanan koneksi database berlebih.

const getCachedDashboardData = async (searchParams: { [key: string]: string | undefined }) => {
  const academicYearId = searchParams.academicYearId ? Number(searchParams.academicYearId) : null;
  const semester = searchParams.semester;
  const month = searchParams.month;
  const classroomId = searchParams.classroomId ? Number(searchParams.classroomId) : null;
  const gender = searchParams.gender;

  // 1. Tentukan Tahun Ajaran Target & Detailnya
  let targetAcademicYearId = academicYearId;
  const activeYearRes = await db.select()
    .from(academicYears)
    .where(and(
      targetAcademicYearId ? eq(academicYears.id, targetAcademicYearId) : eq(academicYears.isActive, true),
      isNull(academicYears.deletedAt)
    ))
    .limit(1);
  
  const activeYearData = activeYearRes[0];
  targetAcademicYearId = activeYearData?.id || null;
  const yearLabel = activeYearData?.year || ""; // Misal "2025/2026"
  const yearParts = yearLabel.split('/');
  const now = new Date();
  const startYear = yearParts[0] ? Number(yearParts[0]) : now.getFullYear();
  const endYear = yearParts[1] ? Number(yearParts[1]) : startYear + 1;

  // 2. Logika Rentang Waktu
  const monthMap: Record<string, number> = {
    "Januari": 0, "Februari": 1, "Maret": 2, "April": 3, "Mei": 4, "Juni": 5,
    "Juli": 6, "Agustus": 7, "September": 8, "Oktober": 9, "November": 10, "Desember": 11
  };
  const monthsList = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const getYearForMonth = (mIdx: number) => (mIdx >= 0 && mIdx <= 5) ? endYear : startYear;

  // Range Bulan Berjalan (Selalu bulan sekarang)
  const thisMonthIdx = now.getMonth();
  const thisMonthYear = getYearForMonth(thisMonthIdx);
  const thisMonthStart = new Date(thisMonthYear, thisMonthIdx, 1);
  const thisMonthEnd = new Date(thisMonthYear, thisMonthIdx + 1, 0, 23, 59, 59);

  // Range Periode (Berdasarkan filter atau default Tahun Ajaran)
  let dateStart: Date, dateEnd: Date;
  if (month) {
    const mIdx = monthMap[month] ?? now.getMonth();
    const mYear = getYearForMonth(mIdx);
    dateStart = new Date(mYear, mIdx, 1);
    dateEnd = new Date(mYear, mIdx + 1, 0, 23, 59, 59);
  } else if (semester) {
    const isGanjil = semester.toLowerCase() === "ganjil";
    dateStart = new Date(startYear, isGanjil ? 6 : 0, 1);
    dateEnd = new Date(isGanjil ? startYear : endYear, isGanjil ? 12 : 6, 0, 23, 59, 59);
  } else {
    // Default: Seluruh Tahun Ajaran (Juli s/d Juni)
    dateStart = new Date(startYear, 6, 1);
    dateEnd = new Date(endYear, 6, 0, 23, 59, 59);
  }

  // 3. Filter Query
  const enrollmentConds = [isNull(studentEnrollments.deletedAt), isNull(students.deletedAt), eq(students.status, "aktif")];
  if (targetAcademicYearId) enrollmentConds.push(eq(studentEnrollments.academicYearId, targetAcademicYearId));
  if (classroomId) enrollmentConds.push(eq(studentEnrollments.classroomId, classroomId));
  const enrollmentWhere = and(...enrollmentConds);

  const billConds = [eq(infaqBills.status, "belum_lunas"), isNull(infaqBills.deletedAt)];
  if (targetAcademicYearId) billConds.push(eq(infaqBills.academicYearId, targetAcademicYearId));
  if (month) billConds.push(eq(infaqBills.month, month));
  if (semester) {
    const ganjilMonths = ["Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const genapMonths = ["Januari", "Februari", "Maret", "April", "Mei", "Juni"];
    billConds.push(inArray(infaqBills.month, semester.toLowerCase() === "ganjil" ? ganjilMonths : genapMonths));
  }
  const billWhere = and(...billConds);

  // --- EKSEKUSI ---
  const [
    enrollmentCounts, employeesGroup, classroomsCountRes, ppdbGroup,
    incomePeriodeRes, expensePeriodeRes,
    incomeThisMonthRes, expenseThisMonthRes,
    savingsAggRes, billAggRes, wakafAggRes,
    coopTrxAggRes, coopCreditAggRes,
    counselingCountRes, announcementsCountRes, lettersCountRes,
  ] = await Promise.all([
    db.select({ 
      total: sql<number>`count(distinct ${students.id})`.mapWith(Number),
      putra: sql<number>`count(distinct case when ${students.gender} = 'L' then ${students.id} end)`.mapWith(Number),
      putri: sql<number>`count(distinct case when ${students.gender} = 'P' then ${students.id} end)`.mapWith(Number)
    })
    .from(studentEnrollments)
    .innerJoin(students, eq(studentEnrollments.studentId, students.id))
    .where(gender ? and(enrollmentWhere, eq(students.gender, gender)) : enrollmentWhere),

    db.select({ type: employees.type, count: sql<number>`count(*)`.mapWith(Number) })
      .from(employees)
      .where(and(isNull(employees.deletedAt), eq(employees.status, "aktif")))
      .groupBy(employees.type),

    db.select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(classrooms)
      .where(and(isNull(classrooms.deletedAt), targetAcademicYearId ? eq(classrooms.academicYearId, targetAcademicYearId) : undefined)),

    db.select({ status: ppdbRegistrations.status, count: sql<number>`count(*)`.mapWith(Number) })
      .from(ppdbRegistrations)
      .where(and(isNull(ppdbRegistrations.deletedAt), gender ? eq(ppdbRegistrations.gender, gender) : undefined))
      .groupBy(ppdbRegistrations.status),

    db.select({ sum: sql<number>`sum(${generalTransactions.amount})`.mapWith(Number) })
      .from(generalTransactions)
      .where(and(eq(generalTransactions.type, "in"), eq(generalTransactions.status, "valid"), isNull(generalTransactions.deletedAt), gte(generalTransactions.createdAt, dateStart), lte(generalTransactions.createdAt, dateEnd))),
    db.select({ sum: sql<number>`sum(${generalTransactions.amount})`.mapWith(Number) })
      .from(generalTransactions)
      .where(and(eq(generalTransactions.type, "out"), eq(generalTransactions.status, "valid"), isNull(generalTransactions.deletedAt), gte(generalTransactions.createdAt, dateStart), lte(generalTransactions.createdAt, dateEnd))),

    db.select({ sum: sql<number>`sum(${generalTransactions.amount})`.mapWith(Number) })
      .from(generalTransactions)
      .where(and(eq(generalTransactions.type, "in"), eq(generalTransactions.status, "valid"), isNull(generalTransactions.deletedAt), gte(generalTransactions.createdAt, thisMonthStart), lte(generalTransactions.createdAt, thisMonthEnd))),
    db.select({ sum: sql<number>`sum(${generalTransactions.amount})`.mapWith(Number) })
      .from(generalTransactions)
      .where(and(eq(generalTransactions.type, "out"), eq(generalTransactions.status, "valid"), isNull(generalTransactions.deletedAt), gte(generalTransactions.createdAt, thisMonthStart), lte(generalTransactions.createdAt, thisMonthEnd))),

    db.select({ sum: sql<number>`sum(${studentSavings.amount})`.mapWith(Number) })
      .from(studentSavings)
      .leftJoin(students, eq(studentSavings.studentId, students.id))
      .where(and(isNull(studentSavings.deletedAt), gender ? eq(students.gender, gender) : undefined)),

    db.select({ 
      totalNominal: sql<number>`sum(${infaqBills.nominal})`.mapWith(Number),
      count: sql<number>`count(*)`.mapWith(Number),
      pa: sql<number>`count(case when ${students.gender} = 'L' then 1 end)`.mapWith(Number),
      pi: sql<number>`count(case when ${students.gender} = 'P' then 1 end)`.mapWith(Number),
      uniqSiswa: sql<number>`count(distinct ${infaqBills.studentId})`.mapWith(Number)
    })
    .from(infaqBills)
    .leftJoin(students, eq(infaqBills.studentId, students.id))
    .leftJoin(studentEnrollments, and(eq(studentEnrollments.studentId, infaqBills.studentId), eq(studentEnrollments.academicYearId, infaqBills.academicYearId), isNull(studentEnrollments.deletedAt)))
    .where(classroomId ? and(billWhere, eq(studentEnrollments.classroomId, classroomId)) : billWhere),

    db.select({ 
      totalIn: sql<number>`sum(case when ${generalTransactions.type} = 'in' then ${generalTransactions.amount} else 0 end)`.mapWith(Number),
      totalOut: sql<number>`sum(case when ${generalTransactions.type} = 'out' then ${generalTransactions.amount} else 0 end)`.mapWith(Number),
    })
    .from(generalTransactions)
    .leftJoin(transactionCategories, eq(generalTransactions.transactionCategoryId, transactionCategories.id))
    .where(and(
      eq(generalTransactions.status, "valid"),
      isNull(generalTransactions.deletedAt),
      or(
        isNotNull(generalTransactions.wakafDonorId),
        isNotNull(generalTransactions.wakafPurposeId),
        ilike(transactionCategories.name, "%wakaf%"),
        ilike(transactionCategories.name, "%waqaf%"),
        ilike(generalTransactions.description, "%wakaf%"),
        ilike(generalTransactions.description, "%waqaf%")
      )
    )),

    db.select({ sumValue: sql<number>`sum(${coopTransactions.total})`.mapWith(Number), count: sql<number>`count(*)`.mapWith(Number) })
      .from(coopTransactions)
      .where(and(gte(coopTransactions.createdAt, dateStart), lte(coopTransactions.createdAt, dateEnd))),

    db.select({ sumAmount: sql<number>`sum(${studentCredits.amount})`.mapWith(Number), sumPaid: sql<number>`sum(${studentCredits.paidAmount})`.mapWith(Number) })
      .from(studentCredits)
      .where(not(eq(studentCredits.status, "lunas"))),

    db.select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(counselingRecords)
      .where(gte(counselingRecords.date, dateStart.toISOString())),

    db.select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(announcements)
      .where(eq(announcements.status, "aktif")),

    db.select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(letters)
      .where(gte(letters.date, dateStart.toISOString().split('T')[0])),
  ]);

  const stats = enrollmentCounts[0];
  const totalSiswa = stats.total || 0;
  const billStats = billAggRes[0];

  return {
    totalSiswa,
    totalSiswaPa: stats.putra || 0,
    totalSiswaPi: stats.putri || 0,
    totalGuru: employeesGroup.find(e => e.type === "guru")?.count || 0,
    totalStaff: employeesGroup.find(e => e.type === "staf")?.count || 0,
    totalKelas: classroomsCountRes[0]?.count || 0,
    ppdbPending: ppdbGroup.find(p => p.status === "pending" || p.status === "menunggu")?.count || 0,
    ppdbDiterima: ppdbGroup.find(p => p.status === "diterima")?.count || 0,
    pemasukanBulanIni: incomeThisMonthRes[0]?.sum || 0,
    pengeluaranBulanIni: expenseThisMonthRes[0]?.sum || 0,
    pemasukanPeriode: incomePeriodeRes[0]?.sum || 0,
    pengeluaranPeriode: expensePeriodeRes[0]?.sum || 0,
    saldoTabungan: savingsAggRes[0]?.sum || 0,
    wakafIn: wakafAggRes[0]?.totalIn || 0,
    wakafOut: wakafAggRes[0]?.totalOut || 0,
    wakafNet: (wakafAggRes[0]?.totalIn || 0) - (wakafAggRes[0]?.totalOut || 0),
    tunggakanTotal: billStats.count || 0,
    tunggakanTotalNominal: billStats.totalNominal || 0,
    tunggakanPa: billStats.pa || 0,
    tunggakanPi: billStats.pi || 0,
    complianceRate: totalSiswa > 0 ? Math.round(((totalSiswa - (billStats.uniqSiswa || 0)) / totalSiswa) * 100) : 0,
    coopTotal: coopTrxAggRes[0]?.sumValue || 0,
    coopCount: coopTrxAggRes[0]?.count || 0,
    piutangKoperasi: (coopCreditAggRes[0]?.sumAmount || 0) - (coopCreditAggRes[0]?.sumPaid || 0),
    counselingCount: counselingCountRes[0]?.count || 0,
    announcementsCount: announcementsCountRes[0]?.count || 0,
    lettersCount: lettersCountRes[0]?.count || 0,
    currentMonthName: month || monthsList[now.getMonth()],
  };
};

function fmtRp(n: number) {
  return "Rp " + (n || 0).toLocaleString("id-ID");
}

export default async function DashboardPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const user = await getAuthUser();

  const roleTabs: Record<string, string[]> = {
    superadmin: ["overview", "finance", "academic", "hr"],
    admin: ["overview", "finance", "academic", "hr"],
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

  const suspenseKey = `${activeTab}-${searchParams.academicYearId || 'all'}-${searchParams.month || 'all'}-${searchParams.classroomId || 'all'}`;

  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="h-16 bg-white/50 rounded-2xl animate-pulse" />}>
        <FilterBar />
      </Suspense>
      
      <Suspense fallback={<div className="h-12 bg-white/50 rounded-xl animate-pulse" />}>
        <DashboardTabs initialTab={activeTab} allowedTabs={allowedTabs} />
      </Suspense>
      
      <Suspense key={suspenseKey} fallback={<DashboardContentLoading />}>
        <DashboardContent searchParams={searchParams} activeTab={activeTab} user={user} />
      </Suspense>
    </div>
  );
}

function DashboardContentLoading() {
  return (
    <div className="space-y-6">
      <div className="h-[104px] rounded-2xl bg-indigo-50 animate-pulse border border-indigo-100"></div>
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

async function DashboardContent({ searchParams, activeTab, user }: { searchParams: { [key: string]: string | undefined }, activeTab: string, user: JwtPayload | null }) {
  const data = await getCachedDashboardData(searchParams);

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
          <KpiCard anim={2} label="Pemasukan (Netto)" value={fmtRp(data.pemasukanPeriode - data.pengeluaranPeriode)} color="#10b981" bg="#d1fae5" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" small
            footer={<><span>{data.currentMonthName}: <strong style={{ color: "#10b981" }}>{fmtRp(data.pemasukanBulanIni - data.pengeluaranBulanIni)}</strong></span></>}
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
            footer={<><span>{data.currentMonthName}</span><strong style={{ color: "#10b981" }}>{fmtRp(data.pemasukanBulanIni)}</strong></>}
          />
          <KpiCard anim={2} label="Pengeluaran Periode" value={fmtRp(data.pengeluaranPeriode)} color="#f43f5e" bg="#ffe4e6" icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" small valueColor="#f43f5e"
            footer={<><span>{data.currentMonthName}</span><strong style={{ color: "#f43f5e" }}>{fmtRp(data.pengeluaranBulanIni)}</strong></>}
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
          <KpiCard anim={6} label="Saldo Wakaf (Net)" value={fmtRp(data.wakafNet)} color="#0ea5e9" bg="#e0f2fe" icon="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" small
            footer={<><span>Kas Wakaf Tersedia</span><strong style={{ color: "#0ea5e9" }}>Netto</strong></>}
          />
          <KpiCard anim={7} label="Penyaluran Wakaf" value={fmtRp(data.wakafOut)} color="#f43f5e" bg="#ffe4e6" icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" small valueColor="#f43f5e"
            footer={<><span>Dana Disalurkan</span><strong style={{ color: "#f43f5e" }}>Out</strong></>}
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
          <KpiCard anim={4} label="Kasus/Catatan BK (Periode)" value={data.counselingCount} color="#6366f1" bg="#e0e7ff" icon="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
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
          <KpiCard anim={3} label="Omzet Koperasi (Periode)" value={fmtRp(data.coopTotal)} color="#10b981" bg="#d1fae5" icon="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" small
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
