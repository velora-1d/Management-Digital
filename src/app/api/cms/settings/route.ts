import { NextResponse } from "next/server";
import { db } from "@/db";
import { webSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { settings, group = 'umum' } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ success: false, message: "Data pengaturan tidak valid" }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      for (const [key, value] of Object.entries(settings as Record<string, unknown>)) {
        const safeValue = value !== undefined && value !== null ? String(value) : '';
        const [existing] = await tx
          .select({ id: webSettings.id })
          .from(webSettings)
          .where(eq(webSettings.key, key))
          .limit(1);

        if (existing) {
          await tx
            .update(webSettings)
            .set({ value: safeValue, group, updatedAt: new Date() })
            .where(eq(webSettings.id, existing.id));
        } else {
          await tx
            .insert(webSettings)
            .values({ key, value: safeValue, group });
        }
      }
    });

    revalidatePath("/admin/cms/settings");
    revalidatePath("/api/web/settings");
    if (group === 'ppdb') revalidatePath("/api/web/ppdb/info");
    
    return NextResponse.json({ success: true, message: "Pengaturan berhasil disimpan" });
  } catch (error) {
    console.error("[CMS_SETTINGS_POST_ERROR]", error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, message: `Gagal menyimpan pengaturan: ${errMsg}` }, { status: 500 });
  }
}
