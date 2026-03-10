import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, AuthError } from "@/lib/rbac";

/**
 * GET /api/settings/backup — Download database backup sebagai JSON
 * Hanya superadmin yang boleh
 */
export async function GET() {
  try {
    const user = await requireAuth();
    requireRole(user, ["superadmin"]);

    // Export semua data penting sebagai JSON
    const [
      students,
      classrooms,
      employees,
      infaqBills,
      infaqPayments,
      generalTransactions,
      cashAccounts,
      transactionCategories,
      studentSavings,
      ppdbRegistrations,
      reRegistrations,
      registrationPayments,
      payrolls,
      payrollDetails,
      salaryComponents,
      employeeSalaries,
      inventories,
      wakafDonors,
      wakafPurposes,
      academicYears,
      schoolSettings,
      users,
    ] = await Promise.all([
      prisma.student.findMany({ where: { deletedAt: null } }),
      prisma.classroom.findMany({ where: { deletedAt: null } }),
      prisma.employee.findMany({ where: { deletedAt: null } }),
      prisma.infaqBill.findMany({ where: { deletedAt: null } }),
      prisma.infaqPayment.findMany({ where: { deletedAt: null } }),
      prisma.generalTransaction.findMany({ where: { deletedAt: null } }),
      prisma.cashAccount.findMany({ where: { deletedAt: null } }),
      prisma.transactionCategory.findMany({ where: { deletedAt: null } }),
      prisma.studentSaving.findMany({ where: { deletedAt: null } }),
      prisma.ppdbRegistration.findMany({ where: { deletedAt: null } }),
      prisma.reRegistration.findMany({ where: { deletedAt: null } }),
      prisma.registrationPayment.findMany({ where: { deletedAt: null } }),
      prisma.payroll.findMany({ where: { deletedAt: null } }),
      prisma.payrollDetail.findMany({ where: { deletedAt: null } }),
      prisma.salaryComponent.findMany({ where: { deletedAt: null } }),
      prisma.employeeSalary.findMany({ where: { deletedAt: null } }),
      prisma.inventory.findMany({ where: { deletedAt: null } }),
      prisma.wakafDonor.findMany({ where: { deletedAt: null } }),
      prisma.wakafPurpose.findMany({ where: { deletedAt: null } }),
      prisma.academicYear.findMany({ where: { deletedAt: null } }),
      prisma.schoolSetting.findMany({}),
      prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, status: true, unitId: true } }),
    ]);

    const backup = {
      meta: {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        exportedBy: user.userId,
      },
      data: {
        students,
        classrooms,
        employees,
        infaqBills,
        infaqPayments,
        generalTransactions,
        cashAccounts,
        transactionCategories,
        studentSavings,
        ppdbRegistrations,
        reRegistrations,
        registrationPayments,
        payrolls,
        payrollDetails,
        salaryComponents,
        employeeSalaries,
        inventories,
        wakafDonors,
        wakafPurposes,
        academicYears,
        schoolSettings,
        users,
      },
    };

    const json = JSON.stringify(backup, null, 2);

    return new Response(json, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="backup_${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal membuat backup" }, { status: 500 });
  }
}
