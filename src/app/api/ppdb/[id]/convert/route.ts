import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * POST /api/ppdb/[id]/convert — Konversi pendaftar PPDB ke siswa
 * Logic: buat Student + dalam $transaction
 */
export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const params = await props.params;
    const regId = Number(params.id);

    if (isNaN(regId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { classroomId, infaqNominal } = body as { classroomId?: number; infaqNominal?: number };

    const result = await prisma.$transaction(async (tx) => {
      const reg = await tx.ppdbRegistration.findUnique({ where: { id: regId } });
      if (!reg) throw new Error("Pendaftar tidak ditemukan");
      if (reg.deletedAt) throw new Error("Data sudah dihapus");
      if (reg.status !== "diterima") throw new Error("Status harus 'diterima' untuk dikonversi ke siswa");

      // Cek apakah sudah pernah dikonversi (cek student dgn NISN/NIK sama)
      if (reg.nisn) {
        const existing = await tx.student.findFirst({ where: { nisn: reg.nisn, deletedAt: null } });
        if (existing) throw new Error(`Siswa dengan NISN ${reg.nisn} sudah ada: ${existing.name}`);
      }

      // Buat Student
      const student = await tx.student.create({
        data: {
          nisn: reg.nisn || "",
          nik: reg.nik || "",
          noKk: reg.noKk || "",
          name: reg.name,
          gender: reg.gender || "L",
          classroomId: classroomId ? Number(classroomId) : null,
          status: "aktif",
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
        },
      });

      // Update status PPDB
      await tx.ppdbRegistration.update({
        where: { id: regId },
        data: { status: "converted" },
      });

      return { student };
    });

    return NextResponse.json({
      success: true,
      message: `${result.student.name} berhasil dikonversi ke siswa aktif.`,
      data: { studentId: result.student.id },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    const msg = error instanceof Error ? error.message : "Gagal konversi ke siswa";
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
