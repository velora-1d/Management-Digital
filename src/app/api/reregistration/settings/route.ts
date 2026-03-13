import { NextResponse } from "next/server";
import { db } from "@/db";
import { schoolSettings } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";


// GET /api/reregistration/settings
export async function GET() {
  try {
    const keys = ["re_registration_fee", "books_fee", "uniform_fee"];
    const settingsList = await db
      .select({ key: schoolSettings.key, value: schoolSettings.value })
      .from(schoolSettings)
      .where(inArray(schoolSettings.key, keys));

    const config: Record<string, number> = {
      re_registration_fee: 0,
      books_fee: 0,
      uniform_fee: 0,
    };

    settingsList.forEach((s) => {
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
        const [existing] = await db
          .select()
          .from(schoolSettings)
          .where(eq(schoolSettings.key, key))
          .limit(1);

        if (existing) {
          await db
            .update(schoolSettings)
            .set({ value: body[key].toString(), updatedAt: new Date() })
            .where(eq(schoolSettings.id, existing.id));
        } else {
          await db
            .insert(schoolSettings)
            .values({ key, value: body[key].toString() });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Pengaturan berhasil disimpan" });
  } catch (error) {
    console.error("Reregistration Settings POST error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan pengaturan" },
      { status: 500 }
    );
  }
}
