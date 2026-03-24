import { NextResponse } from "next/server";
import { db } from "@/db";
import { 
    academicYears, 
    schoolSettings, 
    classrooms, 
    students, 
    employees, 
    users, 
    cashAccounts, 
    transactionCategories, 
    salaryComponents, 
    employeeSalaries, 
    inventories, 
    generalTransactions, 
    studentSavings,
    infaqBills,
    infaqPayments,
    ppdbRegistrations,
    reRegistrations,
    registrationPayments,
    payrolls,
    payrollDetails,
    wakafDonors,
    wakafPurposes
} from "@/db/schema";
import { isNull, sql as drizzleSql } from "drizzle-orm";
import { requireAuth, requireRole, AuthError } from "@/lib/rbac";

// Note: export is now JSON to prevent SQL injection during restore.

/**
 * Daftar tabel dan query Drizzle untuk di-backup.
 */
const TABLE_QUERIES = [
  { table: "academic_years",         schema: academicYears, query: () => db.select().from(academicYears).where(isNull(academicYears.deletedAt)) },
  { table: "school_settings",       schema: schoolSettings, query: () => db.select().from(schoolSettings) },
  { table: "classrooms",            schema: classrooms, query: () => db.select().from(classrooms).where(isNull(classrooms.deletedAt)) },
  { table: "students",              schema: students, query: () => db.select().from(students).where(isNull(students.deletedAt)) },
  { table: "employees",             schema: employees, query: () => db.select().from(employees).where(isNull(employees.deletedAt)) },
  { table: "users",                 schema: users, query: () => db.select({ id: users.id, name: users.name, email: users.email, password: users.password, role: users.role, status: users.status, unitId: users.unitId, createdAt: users.createdAt, updatedAt: users.updatedAt }).from(users) },
  { table: "cash_accounts",         schema: cashAccounts, query: () => db.select().from(cashAccounts).where(isNull(cashAccounts.deletedAt)) },
  { table: "transaction_categories", schema: transactionCategories, query: () => db.select().from(transactionCategories).where(isNull(transactionCategories.deletedAt)) },
  { table: "salary_components",     schema: salaryComponents, query: () => db.select().from(salaryComponents).where(isNull(salaryComponents.deletedAt)) },
  { table: "employee_salaries",     schema: employeeSalaries, query: () => db.select().from(employeeSalaries).where(isNull(employeeSalaries.deletedAt)) },
  { table: "inventories",           schema: inventories, query: () => db.select().from(inventories).where(isNull(inventories.deletedAt)) },
  { table: "general_transactions",  schema: generalTransactions, query: () => db.select().from(generalTransactions).where(isNull(generalTransactions.deletedAt)) },
  { table: "student_savings",       schema: studentSavings, query: () => db.select().from(studentSavings).where(isNull(studentSavings.deletedAt)) },
  { table: "infaq_bills",           schema: infaqBills, query: () => db.select().from(infaqBills).where(isNull(infaqBills.deletedAt)) },
  { table: "infaq_payments",        schema: infaqPayments, query: () => db.select().from(infaqPayments).where(isNull(infaqPayments.deletedAt)) },
  { table: "ppdb_registrations",    schema: ppdbRegistrations, query: () => db.select().from(ppdbRegistrations).where(isNull(ppdbRegistrations.deletedAt)) },
  { table: "re_registrations",      schema: reRegistrations, query: () => db.select().from(reRegistrations).where(isNull(reRegistrations.deletedAt)) },
  { table: "registration_payments", schema: registrationPayments, query: () => db.select().from(registrationPayments).where(isNull(registrationPayments.deletedAt)) },
  { table: "payrolls",              schema: payrolls, query: () => db.select().from(payrolls).where(isNull(payrolls.deletedAt)) },
  { table: "payroll_details",       schema: payrollDetails, query: () => db.select().from(payrollDetails).where(isNull(payrollDetails.deletedAt)) },
  { table: "wakaf_donors",          schema: wakafDonors, query: () => db.select().from(wakafDonors).where(isNull(wakafDonors.deletedAt)) },
  { table: "wakaf_purposes",        schema: wakafPurposes, query: () => db.select().from(wakafPurposes).where(isNull(wakafPurposes.deletedAt)) },
];

export async function GET() {
  try {
    const user = await requireAuth();
    requireRole(user, ["superadmin"]);

    const now = new Date().toISOString();
    const data: Record<string, any[]> = {};

    for (const entry of TABLE_QUERIES) {
      const rows = await entry.query();
      if (rows.length === 0) continue;
      data[entry.table] = rows;
    }

    const backup = {
      meta: {
        exportedAt: now,
        exportedBy: user.userId,
        version: "1.0",
      },
      data,
    };

    const json = JSON.stringify(backup, null, 2);
    const dateStr = now.split("T")[0];

    return new Response(json, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="backup_${dateStr}.json"`,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Backup error:", error);
    return NextResponse.json({ success: false, message: "Gagal membuat backup" }, { status: 500 });
  }
}
