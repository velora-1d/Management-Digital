
import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { eq, and, isNull, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const teachers = await db.query.employees.findMany({
      where: and(
        eq(employees.type, 'guru'),
        isNull(employees.deletedAt)
      ),
      orderBy: [asc(employees.order), asc(employees.name)]
    });
    return NextResponse.json({ success: true, data: teachers });
  } catch (error) {
    console.error("[CMS_TEACHERS_GET_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data guru" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ...values } = body;

    if (id) {
      await db.update(employees).set({ 
        name: values.name,
        position: values.position,
        status: values.status,
        photoUrl: values.photoUrl,
        bio: values.bio,
        order: values.order,
        updatedAt: new Date() 
      }).where(eq(employees.id, Number(id)));
    } else {
      await db.insert(employees).values({
        name: values.name,
        position: values.position,
        status: values.status || 'aktif',
        photoUrl: values.photoUrl,
        bio: values.bio,
        order: values.order || 1,
        type: 'guru'
      });
    }

    revalidatePath("/admin/cms/teachers");
    return NextResponse.json({ success: true, message: "Data guru berhasil disimpan" });
  } catch (error) {
    console.error("[CMS_TEACHERS_POST_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan data guru" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID diperlukan" }, { status: 400 });
    }

    await db.update(employees).set({ deletedAt: new Date() }).where(eq(employees.id, Number(id)));
    revalidatePath("/admin/cms/teachers");
    return NextResponse.json({ success: true, message: "Data guru berhasil dihapus" });
  } catch (error) {
    console.error("[CMS_TEACHERS_DELETE_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus data guru" }, { status: 500 });
  }
}
