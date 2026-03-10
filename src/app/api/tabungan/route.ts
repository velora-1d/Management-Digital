import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classFilter = searchParams.get("classId") || "";
  const studentId = searchParams.get("studentId");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));

  try {
    // Jika request saldo siswa tertentu → return balance langsung
    if (studentId) {
      const savingsIn = await prisma.studentSaving.aggregate({
        where: { studentId: Number(studentId), type: "setor", status: "active", deletedAt: null },
        _sum: { amount: true },
      });
      const savingsOut = await prisma.studentSaving.aggregate({
        where: { studentId: Number(studentId), type: "tarik", status: "active", deletedAt: null },
        _sum: { amount: true },
      });
      const balance = (savingsIn._sum.amount || 0) - (savingsOut._sum.amount || 0);
      return NextResponse.json({ success: true, balance });
    }

    // Build where clause untuk siswa
    const studentWhere: any = {
      deletedAt: null,
      status: "aktif",
      ...(classFilter && { classroomId: Number(classFilter) }),
    };

    // Query siswa dengan pagination
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where: studentWhere,
        select: {
          id: true,
          name: true,
          nisn: true,
          classroom: { select: { id: true, name: true } },
        },
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.student.count({ where: studentWhere }),
    ]);

    // Hitung saldo menggunakan groupBy (jauh lebih efisien daripada findMany + loop)
    const studentIds = students.map(s => s.id);

    const balances = studentIds.length > 0
      ? await prisma.studentSaving.groupBy({
          by: ["studentId", "type"],
          where: {
            studentId: { in: studentIds },
            deletedAt: null,
            status: "active",
          },
          _sum: { amount: true },
        })
      : [];

    // Build balance map dari hasil groupBy
    const balanceMap: Record<number, number> = {};
    balances.forEach(b => {
      if (b.studentId == null) return;
      if (!balanceMap[b.studentId]) balanceMap[b.studentId] = 0;
      if (b.type === "setor") {
        balanceMap[b.studentId] += b._sum.amount || 0;
      } else if (b.type === "tarik") {
        balanceMap[b.studentId] -= b._sum.amount || 0;
      }
    });

    const data = students.map(s => ({
      id: s.id,
      name: s.name,
      nisn: s.nisn,
      classroom: s.classroom?.name || "-",
      balance: balanceMap[s.id] || 0,
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Tabungan GET error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
