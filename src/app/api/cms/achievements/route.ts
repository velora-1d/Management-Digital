
import { NextResponse } from "next/server";
import { db } from "@/db";
import { webAchievements } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const achievements = await db.query.webAchievements.findMany({
      orderBy: [desc(webAchievements.year)]
    });
    return NextResponse.json({ success: true, data: achievements });
  } catch (error) {
    console.error("[CMS_ACHIEVEMENTS_GET_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data prestasi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ...values } = body;

    if (id) {
      await db.update(webAchievements).set({ ...values, updatedAt: new Date() }).where(eq(webAchievements.id, Number(id)));
    } else {
      await db.insert(webAchievements).values(values);
    }

    revalidatePath("/admin/cms/achievements");
    return NextResponse.json({ success: true, message: "Prestasi berhasil disimpan" });
  } catch (error) {
    console.error("[CMS_ACHIEVEMENTS_POST_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan prestasi" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID diperlukan" }, { status: 400 });
    }

    await db.delete(webAchievements).where(eq(webAchievements.id, Number(id)));
    revalidatePath("/admin/cms/achievements");
    return NextResponse.json({ success: true, message: "Prestasi berhasil dihapus" });
  } catch (error) {
    console.error("[CMS_ACHIEVEMENTS_DELETE_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus prestasi" }, { status: 500 });
  }
}
