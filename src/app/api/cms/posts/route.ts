
import { NextResponse } from "next/server";
import { db } from "@/db";
import { webPosts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const posts = await db.query.webPosts.findMany({
      orderBy: [desc(webPosts.createdAt)]
    });
    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    console.error("[CMS_POSTS_GET_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data postingan" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ...values } = body;

    if (id) {
      await db.update(webPosts).set({ ...values, updatedAt: new Date() }).where(eq(webPosts.id, Number(id)));
    } else {
      await db.insert(webPosts).values({ ...values, status: values.status || 'published' });
    }

    revalidatePath("/admin/cms/posts");
    revalidatePath("/api/web/posts");
    return NextResponse.json({ success: true, message: "Postingan berhasil disimpan" });
  } catch (error) {
    console.error("[CMS_POSTS_POST_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan postingan" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID diperlukan" }, { status: 400 });
    }

    await db.delete(webPosts).where(eq(webPosts.id, Number(id)));
    revalidatePath("/admin/cms/posts");
    return NextResponse.json({ success: true, message: "Postingan berhasil dihapus" });
  } catch (error) {
    console.error("[CMS_POSTS_DELETE_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus postingan" }, { status: 500 });
  }
}
