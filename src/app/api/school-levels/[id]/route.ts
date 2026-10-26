import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { schoolLevels, classrooms, students } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getTenantContext } from "@/lib/tenant";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { tenantId } = await getTenantContext();
    const { id } = await props.params;
    const levelId = Number(id);

    if (!levelId || isNaN(levelId)) {
      return NextResponse.json({ success: false, message: "ID jenjang tidak valid" }, { status: 400 });
    }

    const [level] = await db
      .select({
        id: schoolLevels.id,
        code: schoolLevels.code,
        name: schoolLevels.name,
        orderNumber: schoolLevels.orderNumber,
        isActive: schoolLevels.isActive,
        hasPin: sql<boolean>`CASE WHEN ${schoolLevels.pin} IS NOT NULL AND ${schoolLevels.pin} != '' THEN true ELSE false END`,
      })
      .from(schoolLevels)
      .where(and(eq(schoolLevels.id, levelId), eq(schoolLevels.tenantId, tenantId)))
      .limit(1);

    if (!level) {
      return NextResponse.json({ success: false, message: "Jenjang tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, level });
  } catch (error) {
    console.error("GET school-level error:", error);
    return NextResponse.json({ success: false, message: "Gagal memuat jenjang" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { tenantId } = await getTenantContext();
    const { id } = await props.params;
    const levelId = Number(id);

    if (!levelId || isNaN(levelId)) {
      return NextResponse.json({ success: false, message: "ID jenjang tidak valid" }, { status: 400 });
    }

    const body = await req.json();
    const { code, name, orderNumber, isActive, pin } = body;

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (code !== undefined) updateData.code = String(code).trim().toUpperCase();
    if (name !== undefined) updateData.name = String(name).trim();
    if (orderNumber !== undefined) updateData.orderNumber = Number(orderNumber) || 1;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (pin !== undefined) {
      updateData.pin = pin ? String(pin).trim() : null;
    }

    const [updated] = await db
      .update(schoolLevels)
      .set(updateData)
      .where(and(eq(schoolLevels.id, levelId), eq(schoolLevels.tenantId, tenantId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ success: false, message: "Jenjang tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Jenjang ${updated.name} berhasil diperbarui.`,
      level: updated,
    });
  } catch (error) {
    console.error("PUT school-level error:", error);
    return NextResponse.json({ success: false, message: "Gagal memperbarui jenjang" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { tenantId } = await getTenantContext();
    const { id } = await props.params;
    const levelId = Number(id);

    if (!levelId || isNaN(levelId)) {
      return NextResponse.json({ success: false, message: "ID jenjang tidak valid" }, { status: 400 });
    }

    // 1. Cek apakah ada rombel/kelas yang terikat
    const [classroomCount] = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(classrooms)
      .where(eq(classrooms.schoolLevelId, levelId));

    if ((classroomCount?.count || 0) > 0) {
      return NextResponse.json({
        success: false,
        message: `Tidak dapat menghapus jenjang karena masih memiliki ${classroomCount.count} rombongan belajar (kelas) aktif. Hapus atau pindahkan kelas terlebih dahulu.`,
      }, { status: 400 });
    }

    // 2. Cek apakah ada siswa yang terikat
    const [studentCount] = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(students)
      .where(eq(students.schoolLevelId, levelId));

    if ((studentCount?.count || 0) > 0) {
      return NextResponse.json({
        success: false,
        message: `Tidak dapat menghapus jenjang karena masih memiliki ${studentCount.count} siswa terdaftar. Pindahkan siswa terlebih dahulu.`,
      }, { status: 400 });
    }

    const [deleted] = await db
      .delete(schoolLevels)
      .where(and(eq(schoolLevels.id, levelId), eq(schoolLevels.tenantId, tenantId)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ success: false, message: "Jenjang tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Jenjang ${deleted.name} (${deleted.code}) berhasil dihapus.`,
    });
  } catch (error) {
    console.error("DELETE school-level error:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus jenjang" }, { status: 500 });
  }
}
