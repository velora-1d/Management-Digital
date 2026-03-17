import { NextResponse } from "next/server";
import { db } from "@/db";
import { infaqBills, students, classrooms } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { isNull, and, eq, asc, sql, inArray } from "drizzle-orm";

/**
 * GET /api/infaq-bills/export — Export data tagihan sebagai CSV
 */
export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const status = searchParams.get("status");

    const conditions = [isNull(infaqBills.deletedAt)];
    if (month) conditions.push(eq(infaqBills.month, month));
    if (year) conditions.push(eq(infaqBills.year, year));
    if (status) conditions.push(eq(infaqBills.status, status as any));

    const bills = await db.select({
      id: infaqBills.id,
      month: infaqBills.month,
      year: infaqBills.year,
      nominal: infaqBills.nominal,
      status: infaqBills.status,
      studentName: students.name,
      studentNisn: students.nisn,
      studentClassroomId: students.classroomId,
    })
    .from(infaqBills)
    .leftJoin(students, eq(infaqBills.studentId, students.id))
    .where(and(...conditions))
    .orderBy(asc(infaqBills.month), asc(infaqBills.createdAt));

    // Get class names
    const classIds = [...new Set(bills.map(b => b.studentClassroomId).filter((id): id is number => id != null))];
    const classMap: Record<number, string> = {};
    if (classIds.length > 0) {
      const cls = await db.select({ id: classrooms.id, name: classrooms.name }).from(classrooms).where(sql`${classrooms.id} = ANY(${classIds})`);
      cls.forEach(c => { classMap[c.id] = c.name; });
    }

    const rows = bills.map((b, i) => ({
      no: i + 1,
      nama: b.studentName || "-",
      nisn: b.studentNisn || "-",
      kelas: b.studentClassroomId ? classMap[b.studentClassroomId] || "-" : "-",
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
