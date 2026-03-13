import { NextResponse } from "next/server";
import { db } from "@/db";
import { studentCredits, students, coopTransactions } from "@/db/schema";
import { eq, and, ne, desc, sql } from "drizzle-orm";

// GET /api/coop/credits?status=belum_lunas
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const conditions = [];
    if (status) conditions.push(eq(studentCredits.status, status));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Create where clause specifically for the "not lunas" query
    const notLunasConditions = [ne(studentCredits.status, "lunas")];
    if (status) notLunasConditions.push(eq(studentCredits.status, status));
    const notLunasWhereClause = and(...notLunasConditions);

    const [data, [{ total }], allCreditsForTotal] = await Promise.all([
      db.select({
        id: studentCredits.id,
        transactionId: studentCredits.transactionId,
        studentId: studentCredits.studentId,
        amount: studentCredits.amount,
        paidAmount: studentCredits.paidAmount,
        status: studentCredits.status,
        dueDate: studentCredits.dueDate,
        createdAt: studentCredits.createdAt,
        updatedAt: studentCredits.updatedAt,
        student: {
          id: students.id,
          name: students.name,
          nis: students.nis,
        },
        transaction: {
          id: coopTransactions.id,
          date: coopTransactions.date,
          total: coopTransactions.total,
        }
      })
      .from(studentCredits)
      .leftJoin(students, eq(studentCredits.studentId, students.id))
      .leftJoin(coopTransactions, eq(studentCredits.transactionId, coopTransactions.id))
      .where(whereClause)
      .orderBy(desc(studentCredits.createdAt))
      .limit(limit)
      .offset(skip),
      
      db.select({ total: sql<number>`count(*)`.mapWith(Number) })
      .from(studentCredits)
      .where(whereClause),

      db.select({ amount: studentCredits.amount, paidAmount: studentCredits.paidAmount })
      .from(studentCredits)
      .where(notLunasWhereClause)
    ]);

    // Hitung total piutang aktif dari seluruh data yang belum lunas
    const totalPiutang = allCreditsForTotal.reduce(
      (sum, d) => sum + (d.amount - d.paidAmount),
      0
    );

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalPiutang,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memuat piutang";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
