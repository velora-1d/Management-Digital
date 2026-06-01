import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { eq, and, isNull, asc, ilike, or } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // 'guru' or 'staf'
  const search = searchParams.get("q") || "";

  try {
    const conditions = [isNull(employees.deletedAt)];
    if (type) {
      conditions.push(eq(employees.type, type));
    }
    if (search) {
      const searchCondition = or(
        ilike(employees.name, `%${search}%`),
        ilike(employees.nip, `%${search}%`)
      );
      if (searchCondition) conditions.push(searchCondition);
    }

    const data = await db
      .select({
        id: employees.id,
        name: employees.name,
        nip: employees.nip,
        type: employees.type,
        position: employees.position,
        status: employees.status,
        phone: employees.phone,
      })
      .from(employees)
      .where(and(...conditions))
      .orderBy(asc(employees.name));

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Employees GET error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data pegawai" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ success: false, message: "Nama pegawai wajib diisi" }, { status: 400 });
    }

    // Cek duplikasi NIP manual
    if (body.nip) {
      const existing = await db.select().from(employees)
        .where(and(eq(employees.nip, body.nip.trim()), isNull(employees.deletedAt)))
        .limit(1);
      
      if (existing.length > 0) {
        return NextResponse.json({ success: false, message: `Pegawai dengan NIP ${body.nip} sudah terdaftar dan aktif.` }, { status: 400 });
      }
    }

    const [newEmployee] = await db.insert(employees).values({
      name: body.name,
      nip: body.nip || "",
      type: (body.type as string) || "staf",
      position: body.position || "",
      status: (body.status as string) || "aktif",
      phone: body.phone || "",
      address: body.address || "",
      joinDate: body.joinDate || "",
      baseSalary: body.baseSalary ? Number(body.baseSalary) : 0,
    }).returning();

    return NextResponse.json({ success: true, message: "Pegawai berhasil ditambahkan", data: newEmployee });
  } catch (error) {
    console.error("POST Employee error:", error);
    return NextResponse.json({ success: false, message: "Gagal menambah pegawai" }, { status: 500 });
  }
}
