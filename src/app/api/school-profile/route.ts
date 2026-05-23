import { NextResponse } from "next/server";
import { db } from "@/db";
import { schoolSettings } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

// GET /api/school-profile
export async function GET() {
  try {
    const settings = await db.select().from(schoolSettings);
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

    const keys = entries.map(([key]) => key);

    await db.transaction(async (tx) => {
      if (keys.length === 0) return;

      // ⚡ Bolt: Fix N+1 query by batch fetching existing settings
      const existingSettings = await tx.select().from(schoolSettings).where(inArray(schoolSettings.key, keys));
      const existingMap = new Map(existingSettings.map((s) => [s.key, s]));

      const toInsert: { key: string; value: string }[] = [];

      for (const [key, value] of entries) {
        const existing = existingMap.get(key);
        if (existing) {
          await tx.update(schoolSettings).set({ value: String(value) }).where(eq(schoolSettings.id, existing.id));
        } else {
          toInsert.push({ key, value: String(value) });
        }
      }

      // ⚡ Bolt: Batch insert new settings
      if (toInsert.length > 0) {
        await tx.insert(schoolSettings).values(toInsert);
      }
    });

    return NextResponse.json({ message: "Profil sekolah berhasil diperbarui" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menyimpan profil";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
