import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

/**
 * POST /api/teachers/import — Import guru/staf dari CSV
 * Body: FormData dengan field 'file' (CSV)
 * Header CSV: NIP,Nama,Tipe (guru/staf),Jabatan,Status (aktif/nonaktif),Telepon,Alamat,Tanggal Masuk,Gaji Pokok
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

    for (let i = 0; i < rows.length; i++) {
      try {
        const cols = parseCSVLine(rows[i]);
        if (cols.length < 2) {
          errors.push(`Baris ${i + 2}: kolom tidak lengkap`);
          gagal++;
          continue;
        }

        const [nip, nama, tipe, jabatan, status, telepon, alamat, tglMasuk, gajiStr] = cols;

        if (!nama || !nama.trim()) {
          errors.push(`Baris ${i + 2}: nama kosong`);
          gagal++;
          continue;
        }

        // Skip duplicate NIP
        if (nip && nip.trim()) {
          const [existing] = await db
            .select()
            .from(employees)
            .where(and(eq(employees.nip, nip.trim()), isNull(employees.deletedAt)))
            .limit(1);
            
          if (existing) {
            skip++;
            continue;
          }
        }

        await db.insert(employees).values({
          nip: nip?.trim() || "",
          name: nama.trim(),
          type: (tipe?.trim()?.toLowerCase() || "guru") as any,
          position: jabatan?.trim() || "",
          status: (status?.trim()?.toLowerCase() || "aktif") as any,
          phone: telepon?.trim() || "",
          address: alamat?.trim() || "",
          joinDate: tglMasuk?.trim() || "",
          baseSalary: gajiStr ? parseFloat(gajiStr) || 0 : 0,
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
