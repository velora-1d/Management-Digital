import { NextResponse } from "next/server";
import { db } from "@/db";
import { reportCards } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { studentId, curriculumId, semester, snapshotData } = await req.json();

    if (!studentId || !curriculumId || !semester || !snapshotData) {
      return NextResponse.json({ error: "Data snapshot tidak lengkap" }, { status: 400 });
    }

    // Update report card status to PUBLISHED and store snapshot
    const result = await db
      .update(reportCards)
      .set({
        status: "PUBLISHED",
        snapshotData: snapshotData,
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(reportCards.studentId, studentId),
          eq(reportCards.curriculumId, curriculumId),
          eq(reportCards.semester, semester)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Rapor tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: unknown) {
    console.error("Report cards PUBLISH error:", error);
    const message = error instanceof Error ? error.message : "Gagal mempublikasikan rapor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
