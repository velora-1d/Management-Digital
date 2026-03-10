import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
      const bills = await prisma.infaqBill.findMany({
        where: { deletedAt: null },
        include: {
          student: { select: { id: true, name: true } },
          payments: { where: { deletedAt: null } },
        },
      });

      const result = bills.map((bill) => {
        const paid = bill.payments.reduce((sum, p) => sum + p.amountPaid, 0);
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
      const registrations = await prisma.ppdbRegistration.findMany({
        where: { deletedAt: null },
        orderBy: { id: "desc" },
      });
      return NextResponse.json({ success: true, data: registrations });
    }

    if (type === "tabungan") {
      const students = await prisma.student.findMany({
        where: { deletedAt: null },
        include: {
          classroom: { select: { id: true, name: true } },
          savings: { where: { deletedAt: null, status: "active" } },
        },
      });

      const result = students
        .map((s) => {
          let balance = 0;
          s.savings.forEach((sv) => {
            if (sv.type === "setor") balance += sv.amount;
            else if (sv.type === "tarik") balance -= sv.amount;
          });
          return {
            student_id: s.id,
            student_name: s.name,
            classroom: s.classroom?.name || "-",
            balance,
          };
        })
        .filter((s) => s.balance !== 0);

      return NextResponse.json({ success: true, data: result });
    }

    if (type === "aruskas") {
      const transactions = await prisma.generalTransaction.findMany({
        where: { deletedAt: null, status: "valid" },
        include: {
          category: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      let total_income = 0;
      let total_expense = 0;

      const formatted = transactions.map((t) => {
        if (t.type === "in") total_income += t.amount;
        if (t.type === "out") total_expense += t.amount;
        return {
          id: t.id,
          date: t.date || t.createdAt,
          description: t.description,
          category: t.category?.name || "Umum",
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
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal mengambil data laporan" }, { status: 500 });
  }
}
