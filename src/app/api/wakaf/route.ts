import { NextResponse } from "next/server";
import { db } from "@/db";
import { generalTransactions, wakafDonors, wakafPurposes, cashAccounts, transactionCategories } from "@/db/schema";
import { isNull, and, or, isNotNull, desc, eq, sql, gte, lte, ilike } from "drizzle-orm";
import { academicYears } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const academicYearId = searchParams.get("academicYearId");
  const semester = searchParams.get("semester");
  const month = searchParams.get("month");
  const typeFilter = searchParams.get("type");
  const donorId = searchParams.get("donorId");
  const purposeId = searchParams.get("purposeId");
  const normalizedSemester = semester?.toLowerCase();

  let startDate: Date | null = null;
  let endDate: Date | null = null;

  if (academicYearId) {
    const ay = await db.query.academicYears.findFirst({
      where: eq(academicYears.id, Number(academicYearId))
    });

    if (ay) {
      startDate = ay.startDate ? new Date(ay.startDate) : null;
      endDate = ay.endDate ? new Date(ay.endDate) : null;

      if (normalizedSemester === "ganjil") {
        endDate = startDate ? new Date(startDate.getFullYear(), startDate.getMonth() + 6, 0) : endDate;
      } else if (normalizedSemester === "genap") {
        startDate = startDate ? new Date(startDate.getFullYear(), startDate.getMonth() + 6, 1) : startDate;
      }

      if (month && month !== "Semua Bulan") {
        const monthIndex = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].indexOf(month);
        if (monthIndex !== -1) {
          let year = startDate ? startDate.getFullYear() : new Date().getFullYear();
          if (monthIndex < 6 && startDate && startDate.getMonth() >= 6) {
            year++;
          } else if (monthIndex >= 6 && startDate && startDate.getMonth() < 6) {
            year--;
          }
          startDate = new Date(year, monthIndex, 1);
          endDate = new Date(year, monthIndex + 1, 0);
        }
      }
    }
  }

  // Filter dasar untuk semua transaksi Wakaf (In & Out)
  const wakafTransactionConditions = or(
    isNotNull(generalTransactions.wakafDonorId),
    isNotNull(generalTransactions.wakafPurposeId),
    ilike(transactionCategories.name, "%wakaf%"),
    ilike(transactionCategories.name, "%waqaf%"),
    ilike(generalTransactions.description, "%wakaf%"),
    ilike(generalTransactions.description, "%waqaf%")
  );

  const baseConditions = [
    isNull(generalTransactions.deletedAt), 
    eq(generalTransactions.status, 'valid'),
    wakafTransactionConditions
  ];

  const scopedConditions = [...baseConditions];
  if (typeFilter && (typeFilter === "in" || typeFilter === "out")) {
    scopedConditions.push(eq(generalTransactions.type, typeFilter));
  }

  if (donorId) {
    scopedConditions.push(eq(generalTransactions.wakafDonorId, Number(donorId)));
  }

  if (purposeId) {
    scopedConditions.push(eq(generalTransactions.wakafPurposeId, Number(purposeId)));
  }

  const periodConditions = [...scopedConditions];
  if (startDate && endDate) {
    periodConditions.push(gte(generalTransactions.transactionDate, startDate.toISOString().split("T")[0]));
    periodConditions.push(lte(generalTransactions.transactionDate, endDate.toISOString().split("T")[0]));
  }

  try {
    const [{ donorsCount }] = await db.select({ donorsCount: sql<number>`count(*)`.mapWith(Number) }).from(wakafDonors).where(isNull(wakafDonors.deletedAt));
    const [{ purposesCount }] = await db.select({ purposesCount: sql<number>`count(*)`.mapWith(Number) }).from(wakafPurposes).where(isNull(wakafPurposes.deletedAt));

    const wakafTxs = await db.select({
      id: generalTransactions.id, 
      transactionDate: generalTransactions.transactionDate, 
      amount: generalTransactions.amount,
      status: generalTransactions.status, 
      type: generalTransactions.type, 
      createdAt: generalTransactions.createdAt,
      donorName: wakafDonors.name, 
      purposeName: wakafPurposes.name,
    })
    .from(generalTransactions)
    .leftJoin(transactionCategories, eq(generalTransactions.transactionCategoryId, transactionCategories.id))
    .leftJoin(wakafDonors, eq(generalTransactions.wakafDonorId, wakafDonors.id))
    .leftJoin(wakafPurposes, eq(generalTransactions.wakafPurposeId, wakafPurposes.id))
    .where(and(...periodConditions))
    .orderBy(desc(generalTransactions.transactionDate))
    .limit(200);

    // KPI Keseluruhan (Sepanjang Waktu)
    const [stats] = await db.select({
      totalIn: sql<number>`sum(case when ${generalTransactions.type} = 'in' then ${generalTransactions.amount} else 0 end)`.mapWith(Number),
      totalOut: sql<number>`sum(case when ${generalTransactions.type} = 'out' then ${generalTransactions.amount} else 0 end)`.mapWith(Number),
    })
    .from(generalTransactions)
    .leftJoin(transactionCategories, eq(generalTransactions.transactionCategoryId, transactionCategories.id))
    .where(and(...scopedConditions));

    // KPI Periode Terpilih
    const [periodStats] = await db.select({
      sumIn: sql<number>`sum(case when ${generalTransactions.type} = 'in' then ${generalTransactions.amount} else 0 end)`.mapWith(Number),
      sumOut: sql<number>`sum(case when ${generalTransactions.type} = 'out' then ${generalTransactions.amount} else 0 end)`.mapWith(Number),
    })
    .from(generalTransactions)
    .leftJoin(transactionCategories, eq(generalTransactions.transactionCategoryId, transactionCategories.id))
    .where(and(...periodConditions));

    const transactions = wakafTxs.map(tx => ({ 
      id: tx.id, 
      date: tx.transactionDate || tx.createdAt?.toISOString().split('T')[0], 
      amount: tx.amount, 
      type: tx.type,
      donor_name: tx.donorName || "-", 
      purpose_name: tx.purposeName || "-", 
      status: tx.status || "valid" 
    }));

    return NextResponse.json({ 
      success: true, 
      kpi: { 
        totalIn: stats?.totalIn || 0,
        totalOut: stats?.totalOut || 0,
        netBalance: (stats?.totalIn || 0) - (stats?.totalOut || 0),
        periodIn: periodStats?.sumIn || 0,
        periodOut: periodStats?.sumOut || 0,
        donorCount: donorsCount, 
        purposeCount: purposesCount 
      }, 
      transactions 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      type = "in", 
      donorId, 
      purposeId, 
      amount, 
      cashAccountId, 
      date, 
      description, 
      transactionCategoryId 
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Nominal wajib diisi dan harus lebih dari 0" }, { status: 400 });
    }

    if (type === "in" && !donorId) {
      return NextResponse.json({ error: "Donatur wajib diisi untuk penerimaan wakaf" }, { status: 400 });
    }

    if (type === "out" && !purposeId) {
      return NextResponse.json({ error: "Program tujuan wajib diisi untuk pengeluaran wakaf" }, { status: 400 });
    }

    const result = await db.transaction(async (tx) => {
      const txDate = date || new Date().toISOString().split("T")[0];
      
      // 1. Insert Transaksi
      const [transaction] = await tx.insert(generalTransactions).values({
        type: type, 
        amount: Number(amount), 
        description: description || (type === "in" ? "Penerimaan Wakaf" : "Pengeluaran Wakaf"),
        transactionDate: txDate,
        transactionCategoryId: transactionCategoryId ? Number(transactionCategoryId) : null,
        status: "valid",
        wakafDonorId: donorId ? Number(donorId) : null, 
        wakafPurposeId: purposeId ? Number(purposeId) : null,
        cashAccountId: cashAccountId ? Number(cashAccountId) : null,
      }).returning();

      // 2. Update Saldo Kas (ACID)
      if (cashAccountId) {
        const balanceChange = type === "in" ? Number(amount) : -Number(amount);
        await tx.update(cashAccounts)
          .set({ balance: sql`${cashAccounts.balance} + ${balanceChange}` })
          .where(and(eq(cashAccounts.id, Number(cashAccountId)), isNull(cashAccounts.deletedAt)));
      }

      // 3. Update Akumulasi Program (ACID)
      if (purposeId) {
        if (type === "in") {
          await tx.update(wakafPurposes)
            .set({ collectedAmount: sql`${wakafPurposes.collectedAmount} + ${Number(amount)}` })
            .where(and(eq(wakafPurposes.id, Number(purposeId)), isNull(wakafPurposes.deletedAt)));
        } else {
          await tx.update(wakafPurposes)
            .set({ spentAmount: sql`${wakafPurposes.spentAmount} + ${Number(amount)}` })
            .where(and(eq(wakafPurposes.id, Number(purposeId)), isNull(wakafPurposes.deletedAt)));
        }
      }

      return transaction;
    });

    return NextResponse.json({ 
      success: true, 
      message: type === "in" ? "Wakaf berhasil dicatat" : "Pengeluaran wakaf berhasil dicatat", 
      data: result 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Gagal memproses transaksi wakaf" }, { status: 500 });
  }
}
