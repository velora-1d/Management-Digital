import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// GET /api/reregistration/settings
export async function GET() {
  try {
    const keys = ["re_registration_fee", "books_fee", "uniform_fee"];
    const settings = await prisma.schoolSetting.findMany({
      where: { key: { in: keys } },
    });

    const config: Record<string, number> = {
      re_registration_fee: 0,
      books_fee: 0,
      uniform_fee: 0,
    };

    settings.forEach((s) => {
      config[s.key] = Number(s.value) || 0;
    });

    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil pengaturan" },
      { status: 500 }
    );
  }
}

// POST /api/reregistration/settings
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const keys = ["re_registration_fee", "books_fee", "uniform_fee"];

    // Update or Create settings
    for (const key of keys) {
      if (body[key] !== undefined) {
        const existing = await prisma.schoolSetting.findFirst({
          where: { key },
        });

        if (existing) {
          await prisma.schoolSetting.update({
            where: { id: existing.id },
            data: { value: body[key].toString() },
          });
        } else {
          await prisma.schoolSetting.create({
            data: { key, value: body[key].toString() },
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Pengaturan berhasil disimpan" });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menyimpan pengaturan" },
      { status: 500 }
    );
  }
}
