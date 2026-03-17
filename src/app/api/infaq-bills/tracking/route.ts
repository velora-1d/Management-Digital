import { NextResponse } from "next/server";
import { db } from "@/db";
import { classrooms, students, infaqBills, infaqPayments } from "@/db/schema";
import { eq, and, isNull, inArray, asc, sql } from "drizzle-orm";

/**
 * GET /api/infaq-bills/tracking?classroomId=X&year=Y&semester=1|2|full
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = Number(searchParams.get("classroomId"));
    const year = searchParams.get("year") || new Date().getFullYear().toString();
    const semester = searchParams.get("semester") || "1";

    if (!classroomId || isNaN(classroomId)) {
      return NextResponse.json({ success: false, message: "classroomId wajib diisi" }, { status: 400 });
    }

    const [classroom] = await db.select({ id: classrooms.id, name: classrooms.name, infaqNominal: classrooms.infaqNominal })
      .from(classrooms).where(eq(classrooms.id, classroomId)).limit(1);
    if (!classroom) {
      return NextResponse.json({ success: false, message: "Kelas tidak ditemukan" }, { status: 404 });
    }

    const studentList = await db.select({ id: students.id, name: students.name, nisn: students.nisn, infaqNominal: students.infaqNominal, infaqStatus: students.infaqStatus })
      .from(students)
      .where(and(eq(students.classroomId, classroomId), isNull(students.deletedAt)))
      .orderBy(asc(students.name));

    let months: number[];
    if (semester === "full") months = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6];
    else if (semester === "2") months = [1, 2, 3, 4, 5, 6];
    else months = [7, 8, 9, 10, 11, 12];

    const monthNames: Record<number, string> = {
      1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "Mei", 6: "Jun",
      7: "Jul", 8: "Agu", 9: "Sep", 10: "Okt", 11: "Nov", 12: "Des",
    };

    const studentIds = studentList.map(s => s.id);
    let bills: any[] = [];
    if (studentIds.length > 0) {
      bills = await db.select()
        .from(infaqBills)
        .where(and(inArray(infaqBills.studentId, studentIds), eq(infaqBills.year, year), isNull(infaqBills.deletedAt)));
    }

    // Get payments for these bills
    const billIds = bills.map((b: any) => b.id);
    const paymentMap: Record<number, number> = {};
    if (billIds.length > 0) {
      const paymentSums = await db.select({
        billId: infaqPayments.billId,
        totalPaid: sql<number>`coalesce(sum(${infaqPayments.amountPaid}), 0)`.mapWith(Number),
      }).from(infaqPayments)
        .where(and(inArray(infaqPayments.billId, billIds), isNull(infaqPayments.deletedAt)))
        .groupBy(infaqPayments.billId);
      paymentSums.forEach(p => { 
        if (p.billId !== null) {
          paymentMap[p.billId] = p.totalPaid; 
        }
      });
    }

    const billMap = new Map<string, any>();
    for (const b of bills) {
      billMap.set(`${b.studentId}-${b.month}`, b);
    }

    const tracking = studentList.map(student => {
      const monthData = months.map(m => {
        const key = `${student.id}-${String(m)}`;
        const bill = billMap.get(key);
        if (!bill) {
          return { month: m, monthName: monthNames[m], billId: null, status: "belum_digenerate", nominal: 0, totalPaid: 0, remaining: 0 };
        }
        const totalPaid = paymentMap[bill.id] || 0;
        return { month: m, monthName: monthNames[m], billId: bill.id, status: bill.status, nominal: bill.nominal, totalPaid, remaining: Math.max(0, bill.nominal - totalPaid) };
      });

      const totalNominal = monthData.reduce((s, m) => s + m.nominal, 0);
      const totalPaid = monthData.reduce((s, m) => s + m.totalPaid, 0);

      return {
        id: student.id, name: student.name, nisn: student.nisn, infaqStatus: student.infaqStatus,
        months: monthData, totalNominal, totalPaid, totalRemaining: totalNominal - totalPaid,
        lunasCount: monthData.filter(m => m.status === "lunas").length,
      };
    });

    const summary = {
      totalStudents: studentList.length,
      totalNominal: tracking.reduce((s, t) => s + t.totalNominal, 0),
      totalPaid: tracking.reduce((s, t) => s + t.totalPaid, 0),
      totalRemaining: tracking.reduce((s, t) => s + t.totalRemaining, 0),
      allLunas: tracking.filter(t => t.months.every(m => m.status === "lunas" || m.status === "belum_digenerate")).length,
      hasArrears: tracking.filter(t => t.totalRemaining > 0).length,
    };

    return NextResponse.json({
      success: true,
      classroom: { id: classroom.id, name: classroom.name, infaqNominal: classroom.infaqNominal },
      year, semester: Number(semester),
      months: months.map(m => ({ month: m, name: monthNames[m] })),
      tracking, summary,
    });
  } catch (error) {
    console.error("Tracking per kelas error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data tracking" }, { status: 500 });
  }
}
