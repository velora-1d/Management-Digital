import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * GET /api/infaq-bills/export — Export data tagihan sebagai CSV
 * Query: ?month=&year=&status=
 */
export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const status = searchParams.get("status");

    const where: any = { deletedAt: null };
    if (month) where.month = Number(month);
    if (year) where.year = year;
    if (status) where.status = status;

    const bills = await prisma.infaqBill.findMany({
      where,
      include: { student: { select: { name: true, nisn: true, classroom: { select: { name: true } } } } },
      orderBy: [{ month: "asc" }, { createdAt: "asc" }],
    });

    const rows = bills.map((b, i) => ({
      no: i + 1,
      nama: b.student?.name || "-",
      nisn: b.student?.nisn || "-",
      kelas: b.student?.classroom?.name || "-",
      bulan: b.month,
      tahun: b.year || "-",
      nominal: b.nominal,
      status: b.status,
    }));

    const header = "No,Nama,NISN,Kelas,Bulan,Tahun,Nominal,Status\n";
    const csv = header + rows.map(r => `${r.no},"${r.nama}","${r.nisn}","${r.kelas}",${r.bulan},"${r.tahun}",${r.nominal},"${r.status}"`).join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="tagihan_infaq_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal export" }, { status: 500 });
  }
}
