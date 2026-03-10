import { NextResponse } from "next/server";

/**
 * GET /api/students/template — Download template CSV import siswa
 */
export async function GET() {
  const header = "NISN,NIS,NIK,No KK,Nama,Jenis Kelamin (L/P),Kelas,Status,Tanggal Masuk,Ayah,Ibu,Wali,Telepon,Alamat,Tempat Lahir,Tanggal Lahir,Infaq Nominal\n";
  const example = '"1234567890","001","3201...","3201...","Ahmad Fauzi","L","1A","aktif","2025-07-01","Budi","Siti","","08123456789","Jl. Contoh No.1","Bandung","2015-03-15","150000"\n';

  return new Response(header + example, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="template_siswa.csv"',
    },
  });
}
