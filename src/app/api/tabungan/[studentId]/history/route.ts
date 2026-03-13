import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, studentSavings } from "@/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";

/**
 * GET /api/tabungan/[studentId]/history
 */
export async function GET(
  request: Request,
  props: { params: Promise<{ studentId: string }> }
) {
  try {
    const params = await props.params;
    const studentId = Number(params.studentId);

    if (isNaN(studentId)) {
      return NextResponse.json(
        { success: false, message: "ID siswa tidak valid" },
        { status: 400 }
      );
    }

    const [student] = await db.select({ id: students.id, name: students.name, nisn: students.nisn })
      .from(students).where(eq(students.id, studentId)).limit(1);

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Siswa tidak ditemukan" },
        { status: 404 }
      );
    }

    const savings = await db.select()
      .from(studentSavings)
      .where(and(
        eq(studentSavings.studentId, student.id),
        isNull(studentSavings.deletedAt),
        eq(studentSavings.status, "active" as any)
      ))
      .orderBy(desc(studentSavings.createdAt));

    // Hitung saldo akhir
    let balance = 0;
    savings.forEach(s => {
      if (s.type === "setor") balance += s.amount;
      else if (s.type === "tarik") balance -= s.amount;
    });

    return NextResponse.json({
      success: true,
      student: { id: student.id, name: student.name, nisn: student.nisn },
      balance,
      history: savings.map(s => ({
        id: s.id,
        type: s.type,
        amount: s.amount,
        balanceAfter: s.balanceAfter,
        date: s.date,
        description: s.description,
        createdAt: s.createdAt,
      })),
    });
  } catch (error) {
    console.error("Tabungan history error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil riwayat tabungan" },
      { status: 500 }
    );
  }
}
