import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // KPI Data
    const donorsCount = await prisma.wakafDonor.count({ where: { deletedAt: null } });
    const purposesCount = await prisma.wakafPurpose.count({ where: { deletedAt: null } });

    // Transaksi Wakaf (GeneralTransaction yang punya wakafDonorId)
    const wakafTxs = await prisma.generalTransaction.findMany({
      where: {
        deletedAt: null,
        wakafDonorId: { not: null },
      },
      include: {
        wakafDonor: { select: { id: true, name: true } },
        wakafPurpose: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
      take: 50,
    });

    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let total = 0;
    let monthly = 0;

    const transactions = wakafTxs.map(tx => {
      total += tx.amount;
      if (tx.date?.startsWith(currentMonthPrefix)) {
        monthly += tx.amount;
      }

      return {
        id: tx.id,
        date: tx.date || tx.createdAt.toISOString(),
        amount: tx.amount,
        donor_name: tx.wakafDonor?.name || "-",
        purpose_name: tx.wakafPurpose?.name || "-",
        status: tx.status || "valid",
      };
    });

    const kpi = {
      total,
      monthly,
      donorCount: donorsCount,
      purposeCount: purposesCount,
    };

    return NextResponse.json({ success: true, kpi, transactions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { donorId, purposeId, amount, cashAccountId, date, description } = body;

    if (!donorId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Donatur dan nominal wajib diisi" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Catat transaksi umum
      const transaction = await tx.generalTransaction.create({
        data: {
          type: "in",
          amount: Number(amount),
          description: description || "Penerimaan Wakaf",
          date: date || new Date().toISOString().split("T")[0],
          status: "valid",
          wakafDonorId: Number(donorId),
          wakafPurposeId: purposeId ? Number(purposeId) : null,
          cashAccountId: cashAccountId ? Number(cashAccountId) : null,
        },
      });

      // 2. Update saldo kas (jika ada akun kas)
      if (cashAccountId) {
        await tx.cashAccount.update({
          where: { id: Number(cashAccountId) },
          data: { balance: { increment: Number(amount) } },
        });
      }

      // 3. Update collected amount tujuan wakaf (jika ada)
      if (purposeId) {
        await tx.wakafPurpose.update({
          where: { id: Number(purposeId) },
          data: { collectedAmount: { increment: Number(amount) } },
        });
      }

      return transaction;
    });

    return NextResponse.json({ success: true, message: "Wakaf berhasil dicatat", data: result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan wakaf" }, { status: 500 });
  }
}
