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
import { eq, and, isNull, desc, sql, inArray } from "drizzle-orm";
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
          student: {
            id: students.id,
            name: students.name
          }
        })
        .from(infaqBills)
        .leftJoin(students, eq(infaqBills.studentId, students.id))
        .where(isNull(infaqBills.deletedAt));

      let result: any[] = [];
      if (bills.length > 0) {
        const billIds = bills.map((b) => b.id);
        const payments = await db
          .select({
            billId: infaqPayments.billId,
            amountPaid: infaqPayments.amountPaid,
          })
          .from(infaqPayments)
          .where(
            and(
              inArray(infaqPayments.billId, billIds),
              isNull(infaqPayments.deletedAt)
            )
          );

        const paymentsMap = new Map<string, number>();
        payments.forEach((p) => {
          if (!p.billId) return;
          const amountPaid = Number(p.amountPaid) || 0;
          paymentsMap.set(p.billId, (paymentsMap.get(p.billId) || 0) + amountPaid);
        });

        result = bills.map((bill) => {
          const paid = paymentsMap.get(bill.id) || 0;
          const amount = Number(bill.nominal) || 0;
          const remaining = amount - paid;
          return {
            id: bill.id,
            student_name: bill.student?.name || "Anonim",
            month: bill.month + " " + bill.year,
            amount,
            paid,
            remaining: remaining > 0 ? remaining : 0,
            status: remaining <= 0 ? "paid" : "unpaid",
          };
        });
      }

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
      const activeStudents = await db
        .select({
          id: students.id,
          name: students.name,
          classroomName: classrooms.name
        })
        .from(students)
        .leftJoin(classrooms, eq(students.classroomId, classrooms.id))
        .where(isNull(students.deletedAt));

      const result = [];
      if (activeStudents.length > 0) {
        const studentIds = activeStudents.map((s) => s.id);
        const savingsData = await db
          .select({
            studentId: studentSavings.studentId,
            type: studentSavings.type,
            amount: studentSavings.amount,
          })
          .from(studentSavings)
          .where(
            and(
              inArray(studentSavings.studentId, studentIds),
              eq(studentSavings.status, "active"),
              isNull(studentSavings.deletedAt)
            )
          );

        const savingsMap = new Map<string, number>();
        savingsData.forEach((sv) => {
          if (!sv.studentId) return;
          const amount = Number(sv.amount) || 0;
          let currentBalance = savingsMap.get(sv.studentId) || 0;
          if (sv.type === "setor") currentBalance += amount;
          else if (sv.type === "tarik") currentBalance -= amount;
          savingsMap.set(sv.studentId, currentBalance);
        });

        for (const s of activeStudents) {
          const balance = savingsMap.get(s.id) || 0;
          if (balance !== 0) {
            result.push({
              student_id: s.id,
              student_name: s.name,
              classroom: s.classroomName || "-",
              balance,
            });
          }
        }
      }

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
        const amount = Number(t.amount) || 0;
        if (t.type === "in") total_income += amount;
        if (t.type === "out") total_expense += amount;
        return {
          id: t.id,
          date: t.date || t.createdAt,
          description: t.description,
          category: t.categoryName || "Umum",
          type: t.type === "in" ? "income" : "expense",
          amount: amount,
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
