import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * GET /api/dashboard/summary — Semua data dashboard KPI dengan filter
 */
export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);

    // Ambil parameter filter
    const academicYearId = searchParams.get("academicYearId") ? Number(searchParams.get("academicYearId")) : null;
    const semester = searchParams.get("semester"); // "ganjil" | "genap"
    const month = searchParams.get("month");
    const classroomId = searchParams.get("classroomId") ? Number(searchParams.get("classroomId")) : null;
    const gender = searchParams.get("gender");

    // 1. Tentukan Tahun Ajaran Aktif jika tidak difilter
    let targetAcademicYearId = academicYearId;
    if (!targetAcademicYearId) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { isActive: true, deletedAt: null },
      });
      targetAcademicYearId = activeYear?.id || null;
    }

    // 2. Siapkan Rentang Waktu (Bulan/Semester) untuk Transaksi Keuangan
    const now = new Date();
    let dateFilter: any = {};

    if (month) {
      // Jika filter bulan dipilih, ambil awal & akhir bulan tersebut
      // Kita asumsikan tahun kalender sekarang jika tidak spesifik
      const monthMap: Record<string, number> = {
        "Januari": 0, "Februari": 1, "Maret": 2, "April": 3, "Mei": 4, "Juni": 5,
        "Juli": 6, "Agustus": 7, "September": 8, "Oktober": 9, "November": 10, "Desember": 11
      };
      const mIdx = monthMap[month] ?? now.getMonth();
      const start = new Date(now.getFullYear(), mIdx, 1);
      const end = new Date(now.getFullYear(), mIdx + 1, 0, 23, 59, 59);
      dateFilter = { gte: start, lte: end };
    } else if (semester) {
      // Ganjil: Juli - Des, Genap: Jan - Jun
      const isGanjil = semester.toLowerCase() === "ganjil";
      const start = new Date(now.getFullYear(), isGanjil ? 6 : 0, 1);
      const end = new Date(now.getFullYear(), isGanjil ? 11 : 5, 31, 23, 59, 59);
      dateFilter = { gte: start, lte: end };
    } else {
      // Default: Bulan ini
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      dateFilter = { gte: start, lte: end };
    }

    // 3. Bangun Filter untuk Siswa (Hanya yang terdaftar di Tahun Ajaran tersebut)
    const studentEnrollmentWhere: any = { deletedAt: null };
    if (targetAcademicYearId) studentEnrollmentWhere.academicYearId = targetAcademicYearId;
    if (classroomId) studentEnrollmentWhere.classroomId = classroomId;
    if (gender) studentEnrollmentWhere.student = { gender };

    // 4. Bangun Filter untuk Keuangan & Tagihan
    const billWhere: any = { status: "belum_lunas", deletedAt: null };
    if (targetAcademicYearId) billWhere.academicYearId = targetAcademicYearId;
    if (month) billWhere.month = month;
    if (classroomId) billWhere.student = { classroomId };
    if (gender) billWhere.student = { ...billWhere.student, gender };

    // Hitung paralel
    const [
      siswaTerdaftar,
      totalGuru,
      totalStaff,
      totalKelas,
      tunggakanCount,
      tunggakanSum,
      ppdbStats,
      pemasukanPeriode,
      pengeluaranPeriode,
      totalSaldoTabungan,
      totalSaldoKas,
    ] = await Promise.all([
      // Siswa aktif di tahun ajaran terpilih (via Enrollment)
      prisma.studentEnrollment.count({ where: studentEnrollmentWhere }),
      
      prisma.employee.count({ where: { deletedAt: null, position: { contains: "guru", mode: "insensitive" }, status: "aktif" } }),
      prisma.employee.count({ where: { deletedAt: null, status: "aktif" } }),
      
      prisma.classroom.count({ 
        where: { 
          deletedAt: null, 
          ...(targetAcademicYearId ? { academicYearId: targetAcademicYearId } : {}) 
        } 
      }),

      prisma.infaqBill.count({ where: billWhere }),
      prisma.infaqBill.aggregate({ where: billWhere, _sum: { nominal: true } }),

      prisma.ppdbRegistration.groupBy({
        by: ["status"],
        where: { 
          deletedAt: null,
          ...(gender ? { gender } : {}),
          // Tambahkan filter unitId jika perlu
        },
        _count: true,
      }),

      prisma.generalTransaction.aggregate({
        where: { type: "in", status: "valid", deletedAt: null, createdAt: dateFilter },
        _sum: { amount: true },
      }),
      prisma.generalTransaction.aggregate({
        where: { type: "out", status: "valid", deletedAt: null, createdAt: dateFilter },
        _sum: { amount: true },
      }),

      prisma.studentSaving.aggregate({
        where: { 
          deletedAt: null,
          ...(gender ? { student: { gender } } : {})
        },
        _sum: { amount: true },
      }),
      prisma.cashAccount.aggregate({ where: { deletedAt: null }, _sum: { balance: true } }),
    ]);

    const ppdbMap: Record<string, number> = {};
    ppdbStats.forEach((p: any) => { ppdbMap[p.status] = p._count; });

    return NextResponse.json({
      success: true,
      data: {
        siswaAktif: siswaTerdaftar,
        totalGuru,
        totalStaff,
        totalKelas,
        tunggakan: { count: tunggakanCount, total: tunggakanSum._sum.nominal || 0 },
        ppdb: {
          total: Object.values(ppdbMap).reduce((s, c) => s + c, 0),
          menunggu: (ppdbMap["menunggu"] || 0) + (ppdbMap["pending"] || 0),
          diterima: ppdbMap["diterima"] || 0,
          ditolak: ppdbMap["ditolak"] || 0,
          converted: ppdbMap["converted"] || 0,
        },
        pemasukanPeriode: pemasukanPeriode._sum.amount || 0,
        pengeluaranPeriode: pengeluaranPeriode._sum.amount || 0,
        totalSaldoTabungan: totalSaldoTabungan._sum.amount || 0,
        totalSaldoKas: totalSaldoKas._sum.balance || 0,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Dashboard summary error:", error);
    return NextResponse.json({ success: false, message: "Gagal memuat dashboard" }, { status: 500 });
  }
}
