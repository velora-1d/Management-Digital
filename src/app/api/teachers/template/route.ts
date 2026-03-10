import { NextResponse } from "next/server";

/**
 * GET /api/teachers/template — Download template CSV import guru/staf
 */
export async function GET() {
  const header = "NIP,Nama,Tipe (guru/staf),Jabatan,Status (aktif/nonaktif),Telepon,Alamat,Tanggal Masuk,Gaji Pokok\n";
  const example = '"198501012010011001","Ahmad Sofyan","guru","Guru Kelas","aktif","08123456789","Jl. Contoh No.5","2020-01-15","3500000"\n';

  return new Response(header + example, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="template_guru_staf.csv"',
    },
  });
}
