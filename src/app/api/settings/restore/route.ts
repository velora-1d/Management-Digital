import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, AuthError } from "@/lib/rbac";

/**
 * POST /api/settings/restore — Restore data dari file backup JSON
 * Format harus sesuai dengan output dari /api/settings/backup
 * Hanya superadmin yang boleh
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    requireRole(user, ["superadmin"]);

    const body = await req.json();

    // Validasi format backup
    if (!body.meta || !body.data) {
      return NextResponse.json({ success: false, error: "Format backup tidak valid. Pastikan file berasal dari fitur Backup." }, { status: 400 });
    }

    if (!body.meta.version || !body.meta.exportedAt) {
      return NextResponse.json({ success: false, error: "Metadata backup tidak valid." }, { status: 400 });
    }

    const d = body.data;
    let restored: string[] = [];

    // Restore dalam transaksi — hapus dulu (wipe), lalu insert data backup
    await prisma.$transaction(async (tx) => {
      // 1. Wipe existing data (urutan sesuai foreign key)
      await tx.payrollDetail.deleteMany({});
      await tx.payroll.deleteMany({});
      await tx.registrationPayment.deleteMany({});
      await tx.reRegistration.deleteMany({});
      await tx.ppdbRegistration.deleteMany({});
      await tx.infaqPayment.deleteMany({});
      await tx.infaqBill.deleteMany({});
      await tx.studentSaving.deleteMany({});
      await tx.generalTransaction.deleteMany({});
      await tx.employeeSalary.deleteMany({});
      await tx.inventory.deleteMany({});
      await tx.salaryComponent.deleteMany({});
      await tx.student.deleteMany({});
      await tx.employee.deleteMany({});
      await tx.transactionCategory.deleteMany({});
      await tx.classroom.deleteMany({});
      await tx.wakafDonor.deleteMany({});
      await tx.wakafPurpose.deleteMany({});
      await tx.academicYear.deleteMany({});
      await tx.cashAccount.deleteMany({});
      await tx.schoolSetting.deleteMany({});

      // 2. Restore data (urutan sesuai dependency)
      if (d.academicYears?.length) {
        for (const r of d.academicYears) { await tx.academicYear.create({ data: r }); }
        restored.push(`Tahun Ajaran: ${d.academicYears.length}`);
      }
      if (d.classrooms?.length) {
        for (const r of d.classrooms) { await tx.classroom.create({ data: r }); }
        restored.push(`Kelas: ${d.classrooms.length}`);
      }
      if (d.students?.length) {
        for (const r of d.students) { await tx.student.create({ data: r }); }
        restored.push(`Siswa: ${d.students.length}`);
      }
      if (d.employees?.length) {
        for (const r of d.employees) { await tx.employee.create({ data: r }); }
        restored.push(`Pegawai: ${d.employees.length}`);
      }
      if (d.cashAccounts?.length) {
        for (const r of d.cashAccounts) { await tx.cashAccount.create({ data: r }); }
        restored.push(`Akun Kas: ${d.cashAccounts.length}`);
      }
      if (d.transactionCategories?.length) {
        for (const r of d.transactionCategories) { await tx.transactionCategory.create({ data: r }); }
        restored.push(`Kategori Transaksi: ${d.transactionCategories.length}`);
      }
      if (d.salaryComponents?.length) {
        for (const r of d.salaryComponents) { await tx.salaryComponent.create({ data: r }); }
        restored.push(`Komponen Gaji: ${d.salaryComponents.length}`);
      }
      if (d.employeeSalaries?.length) {
        for (const r of d.employeeSalaries) { await tx.employeeSalary.create({ data: r }); }
        restored.push(`Gaji Pegawai: ${d.employeeSalaries.length}`);
      }
      if (d.inventories?.length) {
        for (const r of d.inventories) { await tx.inventory.create({ data: r }); }
        restored.push(`Inventaris: ${d.inventories.length}`);
      }
      if (d.generalTransactions?.length) {
        for (const r of d.generalTransactions) { await tx.generalTransaction.create({ data: r }); }
        restored.push(`Transaksi: ${d.generalTransactions.length}`);
      }
      if (d.studentSavings?.length) {
        for (const r of d.studentSavings) { await tx.studentSaving.create({ data: r }); }
        restored.push(`Tabungan: ${d.studentSavings.length}`);
      }
      if (d.infaqBills?.length) {
        for (const r of d.infaqBills) { await tx.infaqBill.create({ data: r }); }
        restored.push(`Tagihan Infaq: ${d.infaqBills.length}`);
      }
      if (d.infaqPayments?.length) {
        for (const r of d.infaqPayments) { await tx.infaqPayment.create({ data: r }); }
        restored.push(`Pembayaran Infaq: ${d.infaqPayments.length}`);
      }
      if (d.ppdbRegistrations?.length) {
        for (const r of d.ppdbRegistrations) { await tx.ppdbRegistration.create({ data: r }); }
        restored.push(`PPDB: ${d.ppdbRegistrations.length}`);
      }
      if (d.reRegistrations?.length) {
        for (const r of d.reRegistrations) { await tx.reRegistration.create({ data: r }); }
        restored.push(`Daftar Ulang: ${d.reRegistrations.length}`);
      }
      if (d.registrationPayments?.length) {
        for (const r of d.registrationPayments) { await tx.registrationPayment.create({ data: r }); }
        restored.push(`Pembayaran Pendaftaran: ${d.registrationPayments.length}`);
      }
      if (d.payrolls?.length) {
        for (const r of d.payrolls) { await tx.payroll.create({ data: r }); }
        restored.push(`Payroll: ${d.payrolls.length}`);
      }
      if (d.payrollDetails?.length) {
        for (const r of d.payrollDetails) { await tx.payrollDetail.create({ data: r }); }
        restored.push(`Detail Payroll: ${d.payrollDetails.length}`);
      }
      if (d.wakafDonors?.length) {
        for (const r of d.wakafDonors) { await tx.wakafDonor.create({ data: r }); }
        restored.push(`Donatur Wakaf: ${d.wakafDonors.length}`);
      }
      if (d.wakafPurposes?.length) {
        for (const r of d.wakafPurposes) { await tx.wakafPurpose.create({ data: r }); }
        restored.push(`Tujuan Wakaf: ${d.wakafPurposes.length}`);
      }
      if (d.schoolSettings?.length) {
        for (const r of d.schoolSettings) { await tx.schoolSetting.create({ data: r }); }
        restored.push(`Pengaturan Sekolah: ${d.schoolSettings.length}`);
      }
    }, { timeout: 120000 }); // Timeout 2 menit untuk data besar

    return NextResponse.json({
      success: true,
      message: "Data berhasil di-restore dari backup.",
      restored,
      backupMeta: {
        exportedAt: body.meta.exportedAt,
        version: body.meta.version,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Restore error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: `Gagal restore data: ${msg}` }, { status: 500 });
  }
}
