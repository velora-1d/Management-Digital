import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, classrooms } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { isNull, and, eq, asc } from "drizzle-orm";

/**
 * GET /api/students/export — Export data siswa ke CSV
 */
export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get("classroomId");
    const status = searchParams.get("status");

    const conditions = [isNull(students.deletedAt)];
    if (classroomId) conditions.push(eq(students.classroomId, Number(classroomId)));
    if (status) conditions.push(eq(students.status, status as any));

    const studentList = await db.select({
      id: students.id,
      nisn: students.nisn,
      nis: students.nis,
      nik: students.nik,
      name: students.name,
      gender: students.gender,
      status: students.status,
      birthPlace: students.birthPlace,
      birthDate: students.birthDate,
      fatherName: students.fatherName,
      motherName: students.motherName,
      phone: students.phone,
      address: students.address,
      infaqNominal: students.infaqNominal,
      classroomName: classrooms.name,
    })
    .from(students)
    .leftJoin(classrooms, eq(students.classroomId, classrooms.id))
    .where(and(...conditions))
    .orderBy(asc(students.name));

    const rows = studentList.map((s, i) => ({
      no: i + 1,
      nisn: s.nisn || "-",
      nis: s.nis || "-",
      nik: s.nik || "-",
      nama: (s.name || "").replace(/"/g, '""'),
      jk: s.gender === "L" ? "Laki-laki" : "Perempuan",
      kelas: s.classroomName || "-",
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
