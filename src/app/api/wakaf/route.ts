import { NextResponse } from "next/server";
import { db } from "@/db";
import { generalTransactions, wakafDonors, wakafPurposes, cashAccounts } from "@/db/schema";
import { isNull, and, isNotNull, desc, eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const [{ donorsCount }] = await db.select({ donorsCount: sql<number>`count(*)`.mapWith(Number) }).from(wakafDonors).where(isNull(wakafDonors.deletedAt));
    const [{ purposesCount }] = await db.select({ purposesCount: sql<number>`count(*)`.mapWith(Number) }).from(wakafPurposes).where(isNull(wakafPurposes.deletedAt));

    const wakafTxs = await db.select({
      id: generalTransactions.id, date: generalTransactions.date, amount: generalTransactions.amount,
      status: generalTransactions.status, type: generalTransactions.type, createdAt: generalTransactions.createdAt,
      donorName: wakafDonors.name, purposeName: wakafPurposes.name,
    })
    .from(generalTransactions)
    .leftJoin(wakafDonors, eq(generalTransactions.wakafDonorId, wakafDonors.id))
    .leftJoin(wakafPurposes, eq(generalTransactions.wakafPurposeId, wakafPurposes.id))
    .where(and(isNull(generalTransactions.deletedAt), isNotNull(generalTransactions.wakafDonorId)))
    .orderBy(desc(generalTransactions.date))
    .limit(50);

    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    let total = 0; let monthly = 0;

    const transactions = wakafTxs.map(tx => {
      total += tx.amount;
      if (tx.date?.startsWith(currentMonthPrefix)) monthly += tx.amount;
      return { id: tx.id, date: tx.date || tx.createdAt?.toISOString(), amount: tx.amount, donor_name: tx.donorName || "-", purpose_name: tx.purposeName || "-", status: tx.status || "valid" };
    });

    return NextResponse.json({ success: true, kpi: { total, monthly, donorCount: donorsCount, purposeCount: purposesCount }, transactions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { donorId, purposeId, amount, cashAccountId, date, description } = body;
    if (!donorId || !amount || amount <= 0) return NextResponse.json({ error: "Donatur dan nominal wajib diisi" }, { status: 400 });

    const result = await db.transaction(async (tx) => {
      const [transaction] = await tx.insert(generalTransactions).values({
        type: "in" as any, amount: Number(amount), description: description || "Penerimaan Wakaf",
        date: date || new Date().toISOString().split("T")[0], status: "valid" as any,
        wakafDonorId: Number(donorId), wakafPurposeId: purposeId ? Number(purposeId) : null,
        cashAccountId: cashAccountId ? Number(cashAccountId) : null,
      }).returning();

      if (cashAccountId) {
        await tx.update(cashAccounts).set({ balance: sql`${cashAccounts.balance} + ${Number(amount)}` }).where(eq(cashAccounts.id, Number(cashAccountId)));
      }
      if (purposeId) {
        await tx.update(wakafPurposes).set({ collectedAmount: sql`${wakafPurposes.collectedAmount} + ${Number(amount)}` }).where(eq(wakafPurposes.id, Number(purposeId)));
      }
      return transaction;
    });

    return NextResponse.json({ success: true, message: "Wakaf berhasil dicatat", data: result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan wakaf" }, { status: 500 });
  }
}
