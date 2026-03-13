import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, classrooms } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { isNull, eq } from "drizzle-orm";

/**
 * POST /api/students/import — Import siswa dari CSV
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

    const rows = lines.slice(1);
    let sukses = 0;
    let gagal = 0;
    let skip = 0;
    const errors: string[] = [];

    const classroomList = await db.select({ id: classrooms.id, name: classrooms.name })
      .from(classrooms).where(isNull(classrooms.deletedAt));
    const classMap: Record<string, number> = {};
    classroomList.forEach((c) => { classMap[c.name.toLowerCase()] = c.id; });

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

        if (nisn && nisn.trim()) {
          const [existing] = await db.select({ id: students.id })
            .from(students)
            .where(eq(students.nisn, nisn.trim()))
            .limit(1);
          if (existing) {
            skip++;
            continue;
          }
        }

        const classroomId = kelas ? (classMap[kelas.trim().toLowerCase()] || null) : null;

        await db.insert(students).values({
          nisn: nisn?.trim() || "",
          nis: nis?.trim() || "",
          nik: nik?.trim() || "",
          noKk: noKk?.trim() || "",
          name: nama.trim(),
          gender: jk?.trim()?.toUpperCase() === "P" ? "P" : "L",
          classroomId,
          status: (status?.trim() || "aktif") as any,
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

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === "," && !inQuotes) { result.push(current.trim()); current = ""; }
    else { current += ch; }
  }
  result.push(current.trim());
  return result;
}
