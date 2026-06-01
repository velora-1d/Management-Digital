
import { NextResponse } from "next/server";
import { db } from "@/db";
import { webStats } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const stats = await db.query.webStats.findMany({
      orderBy: [webStats.order]
    });
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("[CMS_STATS_GET_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data statistik" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ...values } = body;

    if (id) {
      await db.update(webStats).set({ ...values, updatedAt: new Date() }).where(eq(webStats.id, Number(id)));
    } else {
      await db.insert(webStats).values(values);
    }

    revalidatePath("/admin/cms/stats");
    return NextResponse.json({ success: true, message: "Statistik berhasil disimpan" });
  } catch (error) {
    console.error("[CMS_STATS_POST_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan statistik" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID diperlukan" }, { status: 400 });
    }

    await db.delete(webStats).where(eq(webStats.id, Number(id)));
    revalidatePath("/admin/cms/stats");
    return NextResponse.json({ success: true, message: "Statistik berhasil dihapus" });
  } catch (error) {
    console.error("[CMS_STATS_DELETE_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus statistik" }, { status: 500 });
  }
}
