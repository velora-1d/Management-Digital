import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, studentEnrollments, academicYears } from "@/db/schema";
import { inArray, eq, isNull, and } from "drizzle-orm";
import { requireAuth, AuthError } from "@/lib/rbac";
import { revalidateTag } from "next/cache";

/**
 * POST /api/mutations/execute — Execute mutasi batch (pindah kelas / naik kelas / lulus)
 * Input: { sourceClassroomId, targetClassroomId, newStatus, studentIds[] }
 */
export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const { studentIds, targetClassroomId, newStatus, action } = body;
    const resolvedStatus =
      typeof newStatus === "string" && newStatus
        ? newStatus
        : ["lulus", "pindah", "nonaktif"].includes(action)
          ? action
          : undefined;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ success: false, message: "Pilih minimal 1 siswa" }, { status: 400 });
    }

    if (!targetClassroomId && !resolvedStatus) {
      return NextResponse.json({ success: false, message: "Tentukan kelas tujuan atau status baru" }, { status: 400 });
    }

    const result = await db.transaction(async (tx) => {
      // 1. Cari Tahun Ajaran Aktif
      const activeYear = await tx
        .select({ id: academicYears.id })
        .from(academicYears)
        .where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)))
        .limit(1);
      
      const academicYearId = activeYear[0]?.id;

      // 2. Update Profil Siswa (Master)
      const updateData: { updatedAt: Date; classroomId?: number; status?: string } = { updatedAt: new Date() };
      if (targetClassroomId) updateData.classroomId = Number(targetClassroomId);
      if (resolvedStatus) updateData.status = resolvedStatus;

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

      // 3. Update Pendaftaran Siswa (Enrollment) - Penting untuk statistik & listing
      if (academicYearId && targetClassroomId) {
        const normalizedStudentIds = studentIds.map(Number);
        const existingEnrollments = await tx
          .select({
            id: studentEnrollments.id,
            studentId: studentEnrollments.studentId,
          })
          .from(studentEnrollments)
          .where(
            and(
              inArray(studentEnrollments.studentId, normalizedStudentIds),
              eq(studentEnrollments.academicYearId, academicYearId),
              isNull(studentEnrollments.deletedAt)
            )
          );

        const existingStudentIds = new Set(existingEnrollments.map((row) => row.studentId).filter((id): id is number => id !== null));

        await tx
          .update(studentEnrollments)
          .set({ 
            classroomId: Number(targetClassroomId),
            updatedAt: new Date()
          })
          .where(
            and(
              inArray(studentEnrollments.studentId, normalizedStudentIds),
              eq(studentEnrollments.academicYearId, academicYearId),
              isNull(studentEnrollments.deletedAt)
            )
          );

        const missingStudentIds = normalizedStudentIds.filter((id) => !existingStudentIds.has(id));
        if (missingStudentIds.length > 0) {
          await tx.insert(studentEnrollments).values(
            missingStudentIds.map((studentId: number) => ({
              studentId,
              classroomId: Number(targetClassroomId),
              academicYearId,
              enrollmentType: "mutasi",
            }))
          );
        }
      }

      return { count: updated.length };
    });
    
    // Invalidate cache agar daftar siswa langsung terupdate
    revalidateTag("students");

    const actionLabel = resolvedStatus
      ? `Status ${result.count} siswa diubah ke "${resolvedStatus}"`
      : `${result.count} siswa dipindahkan ke kelas baru`;

    return NextResponse.json({
      success: true,
      message: actionLabel,
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
