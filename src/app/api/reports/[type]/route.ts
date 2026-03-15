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
    transactionCategories
} from "@/db/schema";
import { eq, and, isNull, desc, sql } from "drizzle-orm";
import { requireAuth, AuthError } from "@/lib/rbac";

export async function GET(
  request: Request,
  props: { params: Promise<{ type: string }> }
) {
  const params = await props.params;
  try {
    await requireAuth();
    const { type } = params;

    if (type === "infaq") {
      const bills = await db
        .select({
          id: infaqBills.id,
          month: infaqBills.month,
          year: infaqBills.year,
          nominal: infaqBills.nominal,
          studentName: students.name,
          paid: sql<number>`COALESCE((SELECT SUM(amount_paid) FROM infaq_payments WHERE bill_id = ${infaqBills.id} AND deleted_at IS NULL), 0)`.mapWith(Number)
        })
        .from(infaqBills)
        .leftJoin(students, eq(infaqBills.studentId, students.id))
        .where(isNull(infaqBills.deletedAt));

      const result = bills.map((bill) => {
        const paid = bill.paid;
        const amount = bill.nominal || 0;
        const remaining = amount - paid;
        return {
          id: bill.id,
          student_name: bill.studentName || "Anonim",
          month: bill.month + " " + bill.year,
          amount,
          paid,
          remaining: remaining > 0 ? remaining : 0,
          status: remaining <= 0 ? "paid" : "unpaid",
        };
      });

      return NextResponse.json({ success: true, data: result });
    }

    if (type === "pendaftaran") {
      const registrations = await db
        .select()
        .from(ppdbRegistrations)
        .where(isNull(ppdbRegistrations.deletedAt))
        .orderBy(desc(ppdbRegistrations.id));
      return NextResponse.json({ success: true, data: registrations });
    }

    if (type === "tabungan") {
      const resultData = await db
        .select({
          student_id: students.id,
          student_name: students.name,
          classroom: classrooms.name,
          balance: sql<number>`COALESCE((SELECT SUM(CASE WHEN type = 'setor' THEN amount WHEN type = 'tarik' THEN -amount ELSE 0 END) FROM student_savings WHERE student_id = ${students.id} AND status = 'active' AND deleted_at IS NULL), 0)`.mapWith(Number)
        })
        .from(students)
        .leftJoin(classrooms, eq(students.classroomId, classrooms.id))
        .where(isNull(students.deletedAt));

      const result = resultData
        .filter((r) => r.balance !== 0)
        .map((r) => ({
          student_id: r.student_id,
          student_name: r.student_name,
          classroom: r.classroom || "-",
          balance: r.balance,
        }));

      return NextResponse.json({ success: true, data: result });
    }

    if (type === "aruskas") {
      const transactions = await db
        .select({
          id: generalTransactions.id,
          date: generalTransactions.date,
          createdAt: generalTransactions.createdAt,
          description: generalTransactions.description,
          type: generalTransactions.type,
          amount: generalTransactions.amount,
          status: generalTransactions.status,
          categoryName: transactionCategories.name
        })
        .from(generalTransactions)
        .leftJoin(transactionCategories, eq(generalTransactions.categoryId, transactionCategories.id))
        .where(
            and(
                isNull(generalTransactions.deletedAt),
                eq(generalTransactions.status, "valid")
            )
        )
        .orderBy(desc(generalTransactions.createdAt));

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

      return NextResponse.json({
        success: true,
        data: { total_income, total_expense, balance: total_income - total_expense, transactions: formatted },
      });
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
