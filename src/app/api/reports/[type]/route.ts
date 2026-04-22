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
import { eq, and, isNull, desc, inArray } from "drizzle-orm";
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

      // ⚡ Bolt: Fixed N+1 query by batch fetching infaq payments
      const billIds = bills.map((b) => b.id);
      let allPayments: { billId: number | null; amountPaid: number }[] = [];
      if (billIds.length > 0) {
          allPayments = await db
              .select({ billId: infaqPayments.billId, amountPaid: infaqPayments.amountPaid })
              .from(infaqPayments)
              .where(
                  and(
                      inArray(infaqPayments.billId, billIds),
                      isNull(infaqPayments.deletedAt)
                  )
              );
      }

      const paymentsByBill = new Map<number, number>();
      for (const p of allPayments) {
          if (p.billId !== null) {
              const current = paymentsByBill.get(p.billId) || 0;
              paymentsByBill.set(p.billId, current + p.amountPaid);
          }
      }

      const result = bills.map((bill) => {
        const paid = paymentsByBill.get(bill.id) || 0;
        const amount = bill.nominal || 0;
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

      // ⚡ Bolt: Fixed N+1 query by batch fetching student savings
      const studentIds = activeStudents.map((s) => s.id);
      let allSavings: { studentId: number | null; type: string; amount: number }[] = [];
      if (studentIds.length > 0) {
          allSavings = await db
              .select({ studentId: studentSavings.studentId, type: studentSavings.type, amount: studentSavings.amount })
              .from(studentSavings)
              .where(
                  and(
                      inArray(studentSavings.studentId, studentIds),
                      eq(studentSavings.status, "active"),
                      isNull(studentSavings.deletedAt)
                  )
              );
      }

      const savingsByStudent = new Map<number, number>();
      for (const sv of allSavings) {
          if (sv.studentId !== null) {
              let current = savingsByStudent.get(sv.studentId) || 0;
              if (sv.type === "setor") {
                  current += sv.amount;
              } else if (sv.type === "tarik") {
                  current -= sv.amount;
              }
              savingsByStudent.set(sv.studentId, current);
          }
      }

      const result = [];
      for (const s of activeStudents) {
          const balance = savingsByStudent.get(s.id) || 0;
          if (balance !== 0) {
              result.push({
                student_id: s.id,
                student_name: s.name,
                classroom: s.classroomName || "-",
                balance,
              });
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
