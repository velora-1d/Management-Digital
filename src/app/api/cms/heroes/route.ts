
import { NextResponse } from "next/server";
import { db } from "@/db";
import { webHeroes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const heroes = await db.query.webHeroes.findMany();
    return NextResponse.json({ success: true, data: heroes });
  } catch (error) {
    console.error("[CMS_HEROES_GET_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data hero" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ...values } = body;

    if (id) {
      await db.update(webHeroes).set({ ...values, updatedAt: new Date() }).where(eq(webHeroes.id, Number(id)));
    } else {
      await db.insert(webHeroes).values(values);
    }

    revalidatePath("/admin/cms/heroes");
    return NextResponse.json({ success: true, message: "Banner hero berhasil disimpan" });
  } catch (error) {
    console.error("[CMS_HEROES_POST_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan banner hero" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID diperlukan" }, { status: 400 });
    }

    await db.delete(webHeroes).where(eq(webHeroes.id, Number(id)));
    revalidatePath("/admin/cms/heroes");
    return NextResponse.json({ success: true, message: "Banner hero berhasil dihapus" });
  } catch (error) {
    console.error("[CMS_HEROES_DELETE_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus banner hero" }, { status: 500 });
  }
}
