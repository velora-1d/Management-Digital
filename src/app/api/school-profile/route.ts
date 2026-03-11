import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/school-profile
export async function GET() {
  try {
    const settings = await prisma.schoolSetting.findMany();
    const profile: Record<string, string> = {};
    settings.forEach(s => { profile[s.key] = s.value; });
    return NextResponse.json(profile);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memuat profil sekolah";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT /api/school-profile
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const entries = Object.entries(body) as [string, string][];

    await prisma.$transaction(async (tx) => {
      for (const [key, value] of entries) {
        const existing = await tx.schoolSetting.findFirst({ where: { key } });
        if (existing) {
          await tx.schoolSetting.update({ where: { id: existing.id }, data: { value: String(value) } });
        } else {
          await tx.schoolSetting.create({ data: { key, value: String(value) } });
        }
      }
    });

    return NextResponse.json({ message: "Profil sekolah berhasil diperbarui" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menyimpan profil";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
