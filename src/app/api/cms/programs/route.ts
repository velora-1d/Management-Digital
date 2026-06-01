
import { NextResponse } from "next/server";
import { db } from "@/db";
import { webPrograms } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const programs = await db.query.webPrograms.findMany({
      orderBy: [webPrograms.order]
    });
    return NextResponse.json({ success: true, data: programs });
  } catch (error) {
    console.error("[CMS_PROGRAMS_GET_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data program" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ...values } = body;

    if (id) {
      await db.update(webPrograms).set({ ...values, updatedAt: new Date() }).where(eq(webPrograms.id, Number(id)));
    } else {
      await db.insert(webPrograms).values(values);
    }

    revalidatePath("/admin/cms/programs");
    return NextResponse.json({ success: true, message: "Program berhasil disimpan" });
  } catch (error) {
    console.error("[CMS_PROGRAMS_POST_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan program" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID diperlukan" }, { status: 400 });
    }

    await db.delete(webPrograms).where(eq(webPrograms.id, Number(id)));
    revalidatePath("/admin/cms/programs");
    return NextResponse.json({ success: true, message: "Program berhasil dihapus" });
  } catch (error) {
    console.error("[CMS_PROGRAMS_DELETE_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus program" }, { status: 500 });
  }
}
