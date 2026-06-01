import { NextResponse } from "next/server";
import { db } from "@/db";
import { letters } from "@/db/schema";
import { eq, or, ilike, desc, sql, and } from "drizzle-orm";

function isMissingColumnError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "42703";
}

// GET /api/letters?type=masuk|keluar
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const academicYearId = searchParams.get("academicYearId");
    const semester = searchParams.get("semester");
    const month = searchParams.get("month");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const filters = [];
    if (type) filters.push(eq(letters.type, type));
    if (academicYearId) filters.push(eq(letters.academicYearId, parseInt(academicYearId)));
    if (semester) filters.push(eq(letters.semester, semester));
    if (month) filters.push(eq(letters.month, month));
    if (status && status !== "all") filters.push(eq(letters.status, status));
    if (search) {
      filters.push(
        or(
          ilike(letters.subject, `%${search}%`),
          ilike(letters.number, `%${search}%`),
          ilike(letters.sender, `%${search}%`),
          ilike(letters.receiver, `%${search}%`)
        )
      );
    }

    const combinedWhere = filters.length > 0 ? and(...filters) : undefined;

    try {
      const [data, totalResult] = await Promise.all([
        db
          .select({
            id: letters.id,
            type: letters.type,
            number: letters.number,
            subject: letters.subject,
            sender: letters.sender,
            receiver: letters.receiver,
            date: letters.date,
            status: letters.status,
            fileUrl: letters.fileUrl,
            academicYearId: letters.academicYearId,
            semester: letters.semester,
            month: letters.month,
          })
          .from(letters)
          .where(combinedWhere)
          .orderBy(desc(letters.createdAt))
          .limit(limit)
          .offset(skip),
        db
          .select({ count: sql<number>`count(*)`.mapWith(Number) })
          .from(letters)
          .where(combinedWhere)
      ]);

      const total = totalResult[0]?.count || 0;

      return NextResponse.json({
        success: true,
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      if (!isMissingColumnError(error)) {
        throw error;
      }

      const legacyFilters = [];
      if (type) legacyFilters.push(eq(letters.type, type));
      if (status && status !== "all") legacyFilters.push(eq(letters.status, status));
      if (search) {
        legacyFilters.push(
          or(
            ilike(letters.subject, `%${search}%`),
            ilike(letters.number, `%${search}%`),
            ilike(letters.sender, `%${search}%`),
            ilike(letters.receiver, `%${search}%`)
          )
        );
      }

      const legacyWhere = legacyFilters.length > 0 ? and(...legacyFilters) : undefined;

      const [data, totalResult] = await Promise.all([
        db
          .select({
            id: letters.id,
            type: letters.type,
            number: letters.number,
            subject: letters.subject,
            sender: letters.sender,
            receiver: letters.receiver,
            date: letters.date,
            status: letters.status,
            fileUrl: letters.fileUrl,
            academicYearId: sql<number | null>`null`,
            semester: sql<string | null>`null`,
            month: sql<string | null>`null`,
          })
          .from(letters)
          .where(legacyWhere)
          .orderBy(desc(letters.createdAt))
          .limit(limit)
          .offset(skip),
        db
          .select({ count: sql<number>`count(*)`.mapWith(Number) })
          .from(letters)
          .where(legacyWhere)
      ]);

      const total = totalResult[0]?.count || 0;

      return NextResponse.json({
        success: true,
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    }
  } catch (error: unknown) {
    console.error("Letters GET error:", error);
    const msg = error instanceof Error ? error.message : "Gagal memuat surat";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/letters
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, subject, sender, receiver, date, fileUrl, status } = body;

    if (!subject) return NextResponse.json({ error: "Perihal surat wajib" }, { status: 400 });

    // Auto generate nomor surat untuk surat keluar
    let number = body.number || "";
    if (type === "keluar" && !number) {
      const [countResult] = await db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(letters)
        .where(eq(letters.type, "keluar"));
      
      const count = countResult?.count || 0;
      const now = new Date();
      number = `${String(count + 1).padStart(3, "0")}/SM/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
    }

    // Cek duplikasi nomor surat manual sebagai pre-validation
    if (number) {
      const existing = await db.select().from(letters).where(eq(letters.number, number.trim())).limit(1);
      if (existing.length > 0) {
        return NextResponse.json({ error: "Nomor surat sudah terdaftar. Gunakan nomor lain." }, { status: 400 });
      }
    }

    const [data] = await db
      .insert(letters)
      .values({
        type: type || "masuk",
        number,
        subject,
        sender: sender || "",
        receiver: receiver || "",
        date: date || new Date().toISOString().split("T")[0],
        fileUrl: fileUrl || "",
        status: status || "belum_disposisi",
      })
      .returning();

    const responseData = {
      ...data,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
    };

    return NextResponse.json({ success: true, data: responseData }, { status: 201 });
  } catch (error: unknown) {
    console.error("Letters POST error:", error);
    const msg = error instanceof Error ? error.message : "Gagal menambah surat";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
