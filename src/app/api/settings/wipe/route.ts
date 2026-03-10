import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, AuthError } from "@/lib/rbac";

export async function POST() {
  try {
    // Verifikasi auth + role (hanya superadmin yang boleh wipe)
    const user = await requireAuth();
    requireRole(user, ["superadmin"]);

    // Operasi SANGAT BERBAHAYA: hapus semua data transaksi dan master
    await prisma.$transaction([
      prisma.payrollDetail.deleteMany({}),
      prisma.payroll.deleteMany({}),
      prisma.registrationPayment.deleteMany({}),
      prisma.reRegistration.deleteMany({}),
      prisma.ppdbRegistration.deleteMany({}),
      prisma.infaqPayment.deleteMany({}),
      prisma.infaqBill.deleteMany({}),
      prisma.studentSaving.deleteMany({}),
      prisma.generalTransaction.deleteMany({}),
      prisma.employeeSalary.deleteMany({}),
      prisma.inventory.deleteMany({}),
      prisma.salaryComponent.deleteMany({}),
      prisma.student.deleteMany({}),
      prisma.employee.deleteMany({}),
      prisma.transactionCategory.deleteMany({}),
      prisma.classroom.deleteMany({}),
      // User accounts dan settings TIDAK dihapus
    ]);

    return NextResponse.json({ success: true, message: "Semua data transaksi dan master telah dihapus." });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error(error);
    return NextResponse.json({ error: "Gagal menghapus semua data" }, { status: 500 });
  }
}
