import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/letters?type=masuk|keluar
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: "insensitive" } },
        { number: { contains: search, mode: "insensitive" } },
        { sender: { contains: search, mode: "insensitive" } },
        { receiver: { contains: search, mode: "insensitive" } }
      ];
    }

    const [data, total] = await Promise.all([
      prisma.letter.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.letter.count({ where })
    ]);

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
  } catch (error: unknown) {
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
      const count = await prisma.letter.count({ where: { type: "keluar" } });
      const now = new Date();
      number = `${String(count + 1).padStart(3, "0")}/SM/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
    }

    const data = await prisma.letter.create({
      data: {
        type: type || "masuk",
        number,
        subject,
        sender: sender || "",
        receiver: receiver || "",
        date: date || new Date().toISOString().split("T")[0],
        fileUrl: fileUrl || "",
        status: status || "belum_disposisi",
      },
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menambah surat";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
