import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET() {
  try {
    const payments = await prisma.registrationPayment.findMany({
      where: { payableType: "reregistration", isPaid: true, deletedAt: null },
    });

    let total_fee = 0, count_fee = 0;
    let total_books = 0, count_books = 0;
    let total_uniform = 0, count_uniform = 0;

    payments.forEach((p) => {
      if (p.paymentType === "fee") {
        total_fee += p.nominal;
        count_fee++;
      } else if (p.paymentType === "books") {
        total_books += p.nominal;
        count_books++;
      } else if (p.paymentType === "uniform") {
        total_uniform += p.nominal;
        count_uniform++;
      }
    });

    return NextResponse.json({
      total_fee,
      count_fee,
      total_books,
      count_books,
      total_uniform,
      count_uniform,
      grand_total: total_fee + total_books + total_uniform,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil statistik pembayaran" },
      { status: 500 }
    );
  }
}
