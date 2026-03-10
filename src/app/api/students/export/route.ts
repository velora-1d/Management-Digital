import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * GET /api/students/export — Export data siswa ke CSV
 * Query: ?classroomId=&status=
 */
export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get("classroomId");
    const status = searchParams.get("status");

    const where: any = { deletedAt: null };
    if (classroomId) where.classroomId = Number(classroomId);
    if (status) where.status = status;

    const students = await prisma.student.findMany({
      where,
      include: { classroom: { select: { name: true } } },
      orderBy: { name: "asc" },
    });

    const rows = students.map((s, i) => ({
      no: i + 1,
      nisn: s.nisn || "-",
      nis: s.nis || "-",
      nik: s.nik || "-",
      nama: (s.name || "").replace(/"/g, '""'),
      jk: s.gender === "L" ? "Laki-laki" : "Perempuan",
      kelas: s.classroom?.name || "-",
      status: s.status || "-",
      tempat_lahir: s.birthPlace || "-",
      tanggal_lahir: s.birthDate || "-",
      ayah: (s.fatherName || "").replace(/"/g, '""'),
      ibu: (s.motherName || "").replace(/"/g, '""'),
      telepon: s.phone || "-",
      alamat: (s.address || "").replace(/"/g, '""'),
      infaq: s.infaqNominal || 0,
    }));

    const header = "No,NISN,NIS,NIK,Nama,JK,Kelas,Status,Tempat Lahir,Tanggal Lahir,Ayah,Ibu,Telepon,Alamat,Infaq\n";
    const csv = header + rows.map(r =>
      `${r.no},"${r.nisn}","${r.nis}","${r.nik}","${r.nama}","${r.jk}","${r.kelas}","${r.status}","${r.tempat_lahir}","${r.tanggal_lahir}","${r.ayah}","${r.ibu}","${r.telepon}","${r.alamat}",${r.infaq}`
    ).join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="siswa_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal export" }, { status: 500 });
  }
}
