
import { NextResponse } from "next/server";
import { db } from "@/db";
import { webSettings } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { settings, group = 'umum' } = body;

    for (const [key, value] of Object.entries(settings as Record<string, string>)) {
      await db.insert(webSettings)
        .values({ key, value, group })
        .onConflictDoUpdate({ target: webSettings.key, set: { value, group } });
    }

    revalidatePath("/admin/cms/settings");
    revalidatePath("/api/web/settings");
    if (group === 'ppdb') revalidatePath("/api/web/ppdb/info");
    
    return NextResponse.json({ success: true, message: "Pengaturan berhasil disimpan" });
  } catch (error) {
    console.error("[CMS_SETTINGS_POST_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
}
