import { NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { inArray, eq, isNull, and } from "drizzle-orm";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * POST /api/mutations/execute — Execute mutasi batch (pindah kelas / naik kelas / lulus)
 * Input: { sourceClassroomId, targetClassroomId, newStatus, studentIds[] }
 */
export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const { studentIds, targetClassroomId, newStatus } = body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ success: false, message: "Pilih minimal 1 siswa" }, { status: 400 });
    }

    if (!targetClassroomId && !newStatus) {
      return NextResponse.json({ success: false, message: "Tentukan kelas tujuan atau status baru" }, { status: 400 });
    }

    const result = await db.transaction(async (tx) => {
      const updateData: any = { updatedAt: new Date() };
      if (targetClassroomId) updateData.classroomId = Number(targetClassroomId);
      if (newStatus) updateData.status = newStatus;

      const updated = await tx
        .update(students)
        .set(updateData)
        .where(
            and(
                inArray(students.id, studentIds.map(Number)),
                isNull(students.deletedAt)
            )
        )
        .returning();

      return { count: updated.length };
    });
    
    // I need to import 'and' - wait, I forgot to import it.
    // Let me fix the imports in the write_to_file call below.

    const action = newStatus
      ? `Status ${result.count} siswa diubah ke "${newStatus}"`
      : `${result.count} siswa dipindahkan ke kelas baru`;

    return NextResponse.json({
      success: true,
      message: action,
      data: { affected: result.count },
    });
  } catch (error) {
     console.error("Mutation error:", error);
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal eksekusi mutasi" }, { status: 500 });
  }
}
