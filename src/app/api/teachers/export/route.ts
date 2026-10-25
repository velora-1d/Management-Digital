import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { isNull, asc } from "drizzle-orm";

/**
 * GET /api/teachers/export — Export data guru/staf ke CSV
 * (model Employee di schema)
 */
export async function GET() {
  try {
    await requireAuth();
    const results = await db
      .select()
      .from(employees)
      .where(isNull(employees.deletedAt))
      .orderBy(asc(employees.name));

    const rows = results.map((e, i) => ({
      no: i + 1,
      nip: e.nip || "-",
      nama: (e.name || "").replace(/"/g, '""'),
      tipe: e.type || "-",
      jabatan: (e.position || "").replace(/"/g, '""'),
      status: e.status || "-",
      telepon: e.phone || "-",
      alamat: (e.address || "").replace(/"/g, '""'),
      tgl_masuk: e.joinDate || "-",
      gaji_pokok: e.baseSalary || 0,
    }));

    const header = "No,NIP,Nama,Tipe,Jabatan,Status,Telepon,Alamat,Tanggal Masuk,Gaji Pokok\n";
    const csv = header + rows.map(r =>
      `${r.no},"${r.nip}","${r.nama}","${r.tipe}","${r.jabatan}","${r.status}","${r.telepon}","${r.alamat}","${r.tgl_masuk}",${r.gaji_pokok}`
    ).join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="guru_staf_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal export" }, { status: 500 });
  }
}
