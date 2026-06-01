import { NextResponse } from "next/server";
import { db } from "@/db";
import { curriculums, gradeComponents, kkms } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const curriculumId = Number(params.id);

    if (Number.isNaN(curriculumId)) {
      return NextResponse.json(
        { success: false, message: "ID kurikulum tidak valid" },
        { status: 400 }
      );
    }

    const [curriculum] = await db
      .select({ id: curriculums.id })
      .from(curriculums)
      .where(eq(curriculums.id, curriculumId))
      .limit(1);

    if (!curriculum) {
      return NextResponse.json(
        { success: false, message: "Kurikulum tidak ditemukan" },
        { status: 404 }
      );
    }

    await db.transaction(async (tx) => {
      await tx.delete(kkms).where(eq(kkms.curriculumId, curriculumId));
      await tx
        .delete(gradeComponents)
        .where(eq(gradeComponents.curriculumId, curriculumId));
      await tx.delete(curriculums).where(eq(curriculums.id, curriculumId));
    });

    return NextResponse.json({
      success: true,
      message: "Kurikulum berhasil direset",
    });
  } catch (error) {
    console.error("[RESET_CURRICULUM_ROUTE_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Gagal reset kurikulum" },
      { status: 500 }
    );
  }
}
