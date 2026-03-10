import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * POST /api/students/import — Import siswa dari CSV
 * Body: FormData dengan field 'file' (CSV)
 * Header CSV: NISN,NIS,NIK,No KK,Nama,Jenis Kelamin (L/P),Kelas,Status,Tanggal Masuk,Ayah,Ibu,Wali,Telepon,Alamat,Tempat Lahir,Tanggal Lahir,Infaq Nominal
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "File CSV wajib diupload" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split("\n").filter((l) => l.trim().length > 0);

    if (lines.length < 2) {
      return NextResponse.json({ success: false, message: "File kosong atau hanya berisi header" }, { status: 400 });
    }

    // Parse CSV (skip header row)
    const rows = lines.slice(1);
    let sukses = 0;
    let gagal = 0;
    let skip = 0;
    const errors: string[] = [];

    // Ambil daftar kelas untuk mapping nama → id
    const classrooms = await prisma.classroom.findMany({ where: { deletedAt: null } });
    const classMap: Record<string, number> = {};
    classrooms.forEach((c) => { classMap[c.name.toLowerCase()] = c.id; });

    for (let i = 0; i < rows.length; i++) {
      try {
        const cols = parseCSVLine(rows[i]);
        if (cols.length < 5) {
          errors.push(`Baris ${i + 2}: kolom tidak lengkap`);
          gagal++;
          continue;
        }

        const [nisn, nis, nik, noKk, nama, jk, kelas, status, tglMasuk, ayah, ibu, wali, telepon, alamat, tmptLahir, tglLahir, infaqStr] = cols;

        if (!nama || !nama.trim()) {
          errors.push(`Baris ${i + 2}: nama kosong`);
          gagal++;
          continue;
        }

        // Skip duplicate NISN
        if (nisn && nisn.trim()) {
          const existing = await prisma.student.findFirst({ where: { nisn: nisn.trim(), deletedAt: null } });
          if (existing) {
            skip++;
            continue;
          }
        }

        const classroomId = kelas ? (classMap[kelas.trim().toLowerCase()] || null) : null;

        await prisma.student.create({
          data: {
            nisn: nisn?.trim() || "",
            nis: nis?.trim() || "",
            nik: nik?.trim() || "",
            noKk: noKk?.trim() || "",
            name: nama.trim(),
            gender: jk?.trim()?.toUpperCase() === "P" ? "P" : "L",
            classroomId,
            status: status?.trim() || "aktif",
            entryDate: tglMasuk?.trim() || "",
            fatherName: ayah?.trim() || "",
            motherName: ibu?.trim() || "",
            guardianName: wali?.trim() || "",
            phone: telepon?.trim() || "",
            address: alamat?.trim() || "",
            birthPlace: tmptLahir?.trim() || "",
            birthDate: tglLahir?.trim() || "",
            infaqNominal: infaqStr ? parseFloat(infaqStr) || 0 : 0,
            unitId: user.unitId || "",
          },
        });
        sukses++;
      } catch (err) {
        errors.push(`Baris ${i + 2}: ${err instanceof Error ? err.message : "error"}`);
        gagal++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import selesai: ${sukses} berhasil, ${skip} skip (duplikat), ${gagal} gagal.`,
      data: { sukses, gagal, skip, errors: errors.slice(0, 10) },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal import" }, { status: 500 });
  }
}

/**
 * Parse satu baris CSV, handle quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}
