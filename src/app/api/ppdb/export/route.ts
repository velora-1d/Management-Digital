import { NextResponse } from "next/server";
import { db } from "@/db";
import { ppdbRegistrations } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { isNull, and, eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const conditions = [isNull(ppdbRegistrations.deletedAt)];
    if (status) conditions.push(eq(ppdbRegistrations.status, status as any));

    const list = await db.select().from(ppdbRegistrations).where(and(...conditions)).orderBy(desc(ppdbRegistrations.createdAt));

    const rows = list.map((r, i) => ({
      no: i + 1, no_form: r.formNo || "-", nama: (r.name || "").replace(/"/g, '""'),
      jenis_kelamin: r.gender === "L" ? "Laki-laki" : "Perempuan", tempat_lahir: r.birthPlace || "-",
      tanggal_lahir: r.birthDate || "-", nisn: r.nisn || "-", nik: r.nik || "-",
      ayah: (r.fatherName || "").replace(/"/g, '""'), ibu: (r.motherName || "").replace(/"/g, '""'),
      telepon: r.phone || "-", alamat: (r.address || "").replace(/"/g, '""'),
      asal_sekolah: (r.previousSchool || "").replace(/"/g, '""'), kelas_tujuan: r.targetClassroom || "-", status: r.status,
    }));

    const header = "No,No Form,Nama,Jenis Kelamin,Tempat Lahir,Tanggal Lahir,NISN,NIK,Ayah,Ibu,Telepon,Alamat,Asal Sekolah,Kelas Tujuan,Status\n";
    const csv = header + rows.map(r =>
      `${r.no},"${r.no_form}","${r.nama}","${r.jenis_kelamin}","${r.tempat_lahir}","${r.tanggal_lahir}","${r.nisn}","${r.nik}","${r.ayah}","${r.ibu}","${r.telepon}","${r.alamat}","${r.asal_sekolah}","${r.kelas_tujuan}","${r.status}"`
    ).join("\n");

    return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="ppdb_${new Date().toISOString().split("T")[0]}.csv"` } });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    return NextResponse.json({ success: false, message: "Gagal export" }, { status: 500 });
  }
}
