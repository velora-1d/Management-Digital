
import { NextResponse } from "next/server";
import { db } from "@/db";
import { webFacilities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const facilities = await db.query.webFacilities.findMany({
      orderBy: [webFacilities.order]
    });
    return NextResponse.json({ success: true, data: facilities });
  } catch (error) {
    console.error("[CMS_FACILITIES_GET_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data fasilitas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ...values } = body;

    if (id) {
      await db.update(webFacilities).set({ ...values, updatedAt: new Date() }).where(eq(webFacilities.id, Number(id)));
    } else {
      await db.insert(webFacilities).values(values);
    }

    revalidatePath("/admin/cms/facilities");
    return NextResponse.json({ success: true, message: "Fasilitas berhasil disimpan" });
  } catch (error) {
    console.error("[CMS_FACILITIES_POST_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan fasilitas" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID diperlukan" }, { status: 400 });
    }

    await db.delete(webFacilities).where(eq(webFacilities.id, Number(id)));
    revalidatePath("/admin/cms/facilities");
    return NextResponse.json({ success: true, message: "Fasilitas berhasil dihapus" });
  } catch (error) {
    console.error("[CMS_FACILITIES_DELETE_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus fasilitas" }, { status: 500 });
  }
}
