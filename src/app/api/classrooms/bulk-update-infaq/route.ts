import { NextResponse } from "next/server";
import { db } from "@/db";
import { classrooms, auditLogs } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { inArray, and, isNull } from "drizzle-orm";

/**
 * PATCH /api/classrooms/bulk-update-infaq
 * 
 * Update nominal infaq/SPP standar untuk banyak kelas sekaligus.
 * Input: { classIds: number[], nominal: number }
 */
export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();

    // Sesuaikan dengan ROUTE_PERMISSIONS di src/lib/rbac-permissions.ts
    // Fitur keuangan (SPP/Infaq) biasanya diakses oleh superadmin atau bendahara
    const allowedRoles = ["superadmin", "bendahara"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Fitur ini khusus untuk Superadmin atau Bendahara." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { classIds, nominal } = body;

    // 1. Validasi Input
    if (!classIds || !Array.isArray(classIds) || classIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Pilih minimal satu kelas." },
        { status: 400 }
      );
    }

    if (nominal === undefined || nominal < 0) {
      return NextResponse.json(
        { success: false, message: "Nominal tidak valid (minimal 0)." },
        { status: 400 }
      );
    }

    // 2. Eksekusi Update Masal
    const result = await db.update(classrooms)
      .set({ 
        infaqNominal: Number(nominal),
        updatedAt: new Date()
      })
      .where(and(
        inArray(classrooms.id, classIds.map(Number)),
        isNull(classrooms.deletedAt)
      ))
      .returning({ id: classrooms.id });

    // 3. Tambahkan Audit Log (opsional tapi disarankan sesuai schema Anda)
    await db.insert(auditLogs).values({
      userId: user.userId,
      action: "BULK_UPDATE_INFAQ_NOMINAL",
      modelType: "Classroom",
      modelId: classIds.join(","),
      newValues: JSON.stringify({ nominal, affectedRows: result.length }),
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil memperbarui biaya SPP untuk ${result.length} kelas.`,
      count: result.length,
    });

  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Bulk update infaq nominal error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui biaya kelas secara masal." },
      { status: 500 }
    );
  }
}
