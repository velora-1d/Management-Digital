import { NextResponse } from "next/server";
import { db } from "@/db";
import { 
    infaqBills, 
    students, 
    infaqPayments, 
    ppdbRegistrations, 
    studentSavings, 
    classrooms,
    generalTransactions,
    transactionCategories,
    studentEnrollments,
    academicYears
} from "@/db/schema";
import { eq, and, isNull, desc, sql, gte, lte } from "drizzle-orm";
import { requireAuth, AuthError } from "@/lib/rbac";

export async function GET(
  request: Request,
  props: { params: Promise<{ type: string }> }
) {
  const params = await props.params;
  try {
    await requireAuth();
    const { type } = params;
    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get("academicYearId");
    const semester = searchParams.get("semester");
    const month = searchParams.get("month");

    let targetAcademicYearId = academicYearId ? Number(academicYearId) : null;
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (!targetAcademicYearId) {
      const [activeYear] = await db.select({ id: academicYears.id })
        .from(academicYears)
        .where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)))
        .limit(1);
      targetAcademicYearId = activeYear?.id || null;
    }

    if (targetAcademicYearId) {
      const ay = await db.query.academicYears.findFirst({
        where: eq(academicYears.id, targetAcademicYearId)
      });
      if (ay) {
        startDate = ay.startDate ? new Date(ay.startDate) : null;
        endDate = ay.endDate ? new Date(ay.endDate) : null;

        if (semester === "Ganjil") {
          endDate = startDate ? new Date(startDate.getFullYear(), startDate.getMonth() + 6, 0) : endDate;
        } else if (semester === "Genap") {
          startDate = startDate ? new Date(startDate.getFullYear(), startDate.getMonth() + 6, 1) : startDate;
        }

        if (month && month !== "Semua Bulan") {
          const monthIndex = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].indexOf(month);
          if (monthIndex !== -1) {
            let year = startDate ? startDate.getFullYear() : new Date().getFullYear();
            if (monthIndex < 6 && startDate && startDate.getMonth() >= 6) year++;
            else if (monthIndex >= 6 && startDate && startDate.getMonth() < 6) year--;
            startDate = new Date(year, monthIndex, 1);
            endDate = new Date(year, monthIndex + 1, 0);
          }
        }
      }
    }

    if (type === "infaq") {
      // Optimasi: Gunakan LEFT JOIN + SUM untuk menghindari N+1 Query
      const results = await db
        .select({
          id: infaqBills.id,
          month: infaqBills.month,
          year: infaqBills.year,
          nominal: infaqBills.nominal,
          studentName: students.name,
          totalPaid: sql<number>`coalesce(sum(${infaqPayments.amountPaid}), 0)`.mapWith(Number),
        })
        .from(infaqBills)
        .leftJoin(students, eq(infaqBills.studentId, students.id))
        .leftJoin(infaqPayments, and(
          eq(infaqBills.id, infaqPayments.billId),
          isNull(infaqPayments.deletedAt)
        ))
        .where(and(
          isNull(infaqBills.deletedAt),
          targetAcademicYearId ? eq(infaqBills.academicYearId, targetAcademicYearId) : undefined
        ))

        .groupBy(infaqBills.id, students.name)
        .orderBy(desc(infaqBills.createdAt));

      const formatted = results.map((b) => {
        const amount = b.nominal || 0;
        const paid = b.totalPaid || 0;
        const remaining = Math.max(0, amount - paid);
        return {
          id: b.id,
          student_name: b.studentName || "Anonim",
          month: b.month + " " + b.year,
          amount,
          paid,
          remaining,
          status: remaining <= 0 ? "paid" : "unpaid",
        };
      });

      const response = NextResponse.json({ success: true, data: formatted });
      response.headers.set('Cache-Control', 'no-store');
      return response;
    }

    if (type === "pendaftaran") {
      const registrations = await db
        .select()
        .from(ppdbRegistrations)
        .where(isNull(ppdbRegistrations.deletedAt))
        .orderBy(desc(ppdbRegistrations.id));
      
      const response = NextResponse.json({ success: true, data: registrations });
      response.headers.set('Cache-Control', 'no-store');
      return response;
    }

    if (type === "tabungan") {
      // Optimasi: Gunakan SUM & GROUP BY untuk menghitung saldo seluruh siswa dalam SATU query
      const savingsBalances = await db
        .select({
            studentId: students.id,
            studentName: students.name,
            classroomName: classrooms.name,
            balance: sql<number>`
                coalesce(sum(case when ${studentSavings.type} = 'setor' then ${studentSavings.amount} else 0 end), 0) -
                coalesce(sum(case when ${studentSavings.type} = 'tarik' then ${studentSavings.amount} else 0 end), 0)
            `.mapWith(Number)
        })
        .from(students)
        .leftJoin(
          studentEnrollments,
          and(
            eq(studentEnrollments.studentId, students.id),
            targetAcademicYearId ? eq(studentEnrollments.academicYearId, targetAcademicYearId) : undefined,
            isNull(studentEnrollments.deletedAt)
          )
        )
        .leftJoin(classrooms, eq(studentEnrollments.classroomId, classrooms.id))
        .leftJoin(studentSavings, and(
            eq(students.id, studentSavings.studentId),
            eq(studentSavings.status, "active"),
            isNull(studentSavings.deletedAt)
        ))
        .where(isNull(students.deletedAt))
        .groupBy(students.id, classrooms.name)
        .having(sql`abs(
            coalesce(sum(case when ${studentSavings.type} = 'setor' then ${studentSavings.amount} else 0 end), 0) -
            coalesce(sum(case when ${studentSavings.type} = 'tarik' then ${studentSavings.amount} else 0 end), 0)
        ) > 0`);

      const formatted = savingsBalances.map(s => ({
          student_id: s.studentId,
          student_name: s.studentName,
          classroom: s.classroomName || "-",
          balance: s.balance,
      }));

      const response = NextResponse.json({ success: true, data: formatted });
      response.headers.set('Cache-Control', 'no-store');
      return response;
    }

    if (type === "aruskas") {
      const transactions = await db
        .select({
          id: generalTransactions.id,
          date: generalTransactions.transactionDate,
          createdAt: generalTransactions.createdAt,
          description: generalTransactions.description,
          type: generalTransactions.type,
          amount: generalTransactions.amount,
          status: generalTransactions.status,
          categoryName: transactionCategories.name
        })
        .from(generalTransactions)
        .leftJoin(transactionCategories, eq(generalTransactions.transactionCategoryId, transactionCategories.id))
        .where(
            and(
                isNull(generalTransactions.deletedAt),
                eq(generalTransactions.status, "valid"),
                startDate && endDate ? gte(generalTransactions.transactionDate, startDate.toISOString().split("T")[0]) : undefined,
                startDate && endDate ? lte(generalTransactions.transactionDate, endDate.toISOString().split("T")[0]) : undefined
            )
        )
        .orderBy(desc(generalTransactions.transactionDate));

      let total_income = 0;
      let total_expense = 0;

      const formatted = transactions.map((t) => {
        if (t.type === "in") total_income += t.amount;
        if (t.type === "out") total_expense += t.amount;
        return {
          id: t.id,
          date: t.date || t.createdAt,
          description: t.description,
          category: t.categoryName || "Umum",
          type: t.type === "in" ? "income" : "expense",
          amount: t.amount,
          status: t.status,
        };
      });

      const response = NextResponse.json({
        success: true,
        data: { total_income, total_expense, balance: total_income - total_expense, transactions: formatted },
      });
      response.headers.set('Cache-Control', 'no-store');
      return response;
    }

    return NextResponse.json({ success: false, message: "Tipe laporan tidak dikenali" }, { status: 400 });
  } catch (error) {
    console.error("Reports error:", error);
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal mengambil data laporan" }, { status: 500 });
  }
}
