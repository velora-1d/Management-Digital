import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { academicYears, classrooms } from "@/db/schema";
import { getClassroomsList } from "@/lib/classrooms";
import { and, asc, eq, ilike, isNull } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const optionsOnly = searchParams.get("options") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const q = searchParams.get("q") || "";
    const reqAcademicYearId = searchParams.get("academicYearId");

    // Tentukan tahun ajaran: gunakan query param jika ada, jika tidak → tahun aktif
    // Kirim "all" untuk tampilkan semua tahun ajaran
    let academicYearId: number | null = null;
    if (reqAcademicYearId && reqAcademicYearId !== "all") {
      academicYearId = Number(reqAcademicYearId);
    } else if (!reqAcademicYearId) {
      const [activeYear] = await db
        .select({ id: academicYears.id })
        .from(academicYears)
        .where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)))
        .limit(1);
      academicYearId = activeYear?.id ?? null;
    }

    if (optionsOnly) {
      const conditions = [isNull(classrooms.deletedAt)];
      if (q) {
        conditions.push(ilike(classrooms.name, `%${q}%`));
      }
      if (academicYearId) {
        conditions.push(eq(classrooms.academicYearId, academicYearId));
      }

      const data = await db.select({
        id: classrooms.id,
        name: classrooms.name,
        academicYearId: classrooms.academicYearId,
      })
        .from(classrooms)
        .where(and(...conditions))
        .orderBy(asc(classrooms.level), asc(classrooms.name));

      return NextResponse.json(
        {
          success: true,
          data,
        },
        { headers: { "Cache-Control": "private, max-age=300, stale-while-revalidate=600" } }
      );
    }

    const result = await getClassroomsList({ page, limit, q, academicYearId });

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        pagination: result.pagination,
        total: result.pagination.total,
        page: result.pagination.page,
        limit: result.pagination.limit,
        totalPages: result.pagination.totalPages,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: unknown) {
    console.error("GET classrooms error:", error);
    const message = error instanceof Error ? error.message : "Server Error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, level, academicYearId, waliKelasId, infaqNominal } = body;

    if (!name) {
      return NextResponse.json({ success: false, message: "Nama kelas wajib diisi" }, { status: 400 });
    }

    // 1. Cek apakah ada record dengan nama yang sama (termasuk yang di-soft delete)
    const existing = await db.select()
      .from(classrooms)
      .where(ilike(classrooms.name, name))
      .limit(1);

    if (existing.length > 0) {
      const record = existing[0];

      // Jika record aktif sudah ada, kembalikan error duplikasi
      if (!record.deletedAt) {
        return NextResponse.json({
          success: false,
          message: `Kelas dengan nama "${name}" sudah ada dan masih aktif.`,
        }, { status: 400 });
      }

      // Jika record terhapus ditemukan, lakukan Restore
      const [restored] = await db.update(classrooms)
        .set({
          level: level ? Number(level) : 1,
          academicYearId: (academicYearId && academicYearId !== "null") ? Number(academicYearId) : null,
          waliKelasId: (waliKelasId && waliKelasId !== "null") ? Number(waliKelasId) : null,
          infaqNominal: (infaqNominal && infaqNominal !== "null") ? Number(infaqNominal) : 0,
          deletedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(classrooms.id, record.id))
        .returning();

      return NextResponse.json({
        success: true,
        message: "Kelas yang sebelumnya terhapus telah diaktifkan kembali.",
        data: restored,
        isRestored: true,
      });
    }

    // 2. Jika tidak ada, insert baru
    const [newClassroom] = await db.insert(classrooms).values({
      name: name,
      level: level ? Number(level) : 1,
      academicYearId: (academicYearId && academicYearId !== "null") ? Number(academicYearId) : null,
      waliKelasId: (waliKelasId && waliKelasId !== "null") ? Number(waliKelasId) : null,
      infaqNominal: (infaqNominal && infaqNominal !== "null") ? Number(infaqNominal) : 0,
    }).returning();

    return NextResponse.json({ success: true, message: "Kelas berhasil ditambahkan", data: newClassroom });
  } catch (error: unknown) {
    console.error("POST Classroom error:", error);
    const message = error instanceof Error ? error.message : "Gagal menambah kelas";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
