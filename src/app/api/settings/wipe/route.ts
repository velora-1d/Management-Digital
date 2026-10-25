import { NextResponse } from "next/server";
import { db } from "@/db";
import { 
    payrollDetails, payrolls, registrationPayments, reRegistrations, 
    ppdbRegistrations, infaqPayments, infaqBills, studentSavings, generalTransactions, 
    employeeSalaries, inventories, salaryComponents, students, employees, 
    transactionCategories, classrooms 
} from "@/db/schema";
import { requireAuth, requireRole, AuthError } from "@/lib/rbac";

export async function POST() {
  try {
    const user = await requireAuth();
    requireRole(user, ["superadmin"]);

    // Operasi SANGAT BERBAHAYA: hapus semua data transaksi dan master
    await db.transaction(async (tx) => {
      await tx.delete(payrollDetails);
      await tx.delete(payrolls);
      await tx.delete(registrationPayments);
      await tx.delete(reRegistrations);
      await tx.delete(ppdbRegistrations);
      await tx.delete(infaqPayments);
      await tx.delete(infaqBills);
      await tx.delete(studentSavings);
      await tx.delete(generalTransactions);
      await tx.delete(employeeSalaries);
      await tx.delete(inventories);
      await tx.delete(salaryComponents);
      await tx.delete(students);
      await tx.delete(employees);
      await tx.delete(transactionCategories);
      await tx.delete(classrooms);
    });

    return NextResponse.json({ success: true, message: "Semua data transaksi dan master telah dihapus." });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Wipe error:", error);
    return NextResponse.json({ error: "Gagal menghapus semua data" }, { status: 500 });
  }
}
