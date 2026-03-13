import { NextResponse } from "next/server";
import { db } from "@/db";
import { ppdbRegistrations, students } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const params = await props.params;
    const regId = Number(params.id);
    if (isNaN(regId)) return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    const { classroomId, infaqNominal } = body as { classroomId?: number; infaqNominal?: number };

    const result = await db.transaction(async (tx) => {
      const [reg] = await tx.select().from(ppdbRegistrations).where(eq(ppdbRegistrations.id, regId)).limit(1);
      if (!reg) throw new Error("Pendaftar tidak ditemukan");
      if (reg.deletedAt) throw new Error("Data sudah dihapus");
      if (reg.status !== "diterima") throw new Error("Status harus 'diterima' untuk dikonversi ke siswa");

      if (reg.nisn) {
        const [existing] = await tx.select({ id: students.id, name: students.name })
          .from(students).where(and(eq(students.nisn, reg.nisn), isNull(students.deletedAt))).limit(1);
        if (existing) throw new Error(`Siswa dengan NISN ${reg.nisn} sudah ada: ${existing.name}`);
      }

      const [student] = await tx.insert(students).values({
        nisn: reg.nisn || "",
        nik: reg.nik || "",
        noKk: reg.noKk || "",
        name: reg.name,
        gender: reg.gender || "L",
        classroomId: classroomId ? Number(classroomId) : null,
        status: "aktif" as any,
        entryDate: new Date().toISOString().split("T")[0],
        unitId: user.unitId || "",
        fatherName: reg.fatherName || "",
        motherName: reg.motherName || "",
        guardianName: reg.guardianName || "",
        phone: reg.phone || "",
        address: reg.address || "",
        birthPlace: reg.birthPlace || "",
        birthDate: reg.birthDate || "",
        infaqNominal: infaqNominal || 0,
      }).returning();

      await tx.update(ppdbRegistrations).set({ status: "converted" as any, updatedAt: new Date() }).where(eq(ppdbRegistrations.id, regId));
      return { student };
    });

    return NextResponse.json({ success: true, message: `${result.student.name} berhasil dikonversi ke siswa aktif.`, data: { studentId: result.student.id } });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    const msg = error instanceof Error ? error.message : "Gagal konversi ke siswa";
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
