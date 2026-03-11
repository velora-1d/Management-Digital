import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/letters?type=masuk|keluar
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const where: Record<string, unknown> = {};
    if (type) where.type = type;

    const data = await prisma.letter.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(data);
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
