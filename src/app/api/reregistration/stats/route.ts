import { NextResponse } from "next/server";
import { db } from "@/db";
import { registrationPayments } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function GET() {
  try {
    const paymentsList = await db
      .select({
        paymentType: registrationPayments.paymentType,
        nominal: registrationPayments.nominal,
      })
      .from(registrationPayments)
      .where(
        and(
          eq(registrationPayments.payableType, "reregistration"),
          eq(registrationPayments.isPaid, true),
          isNull(registrationPayments.deletedAt)
        )
      );

    let total_fee = 0, count_fee = 0;
    let total_books = 0, count_books = 0;
    let total_uniform = 0, count_uniform = 0;

    paymentsList.forEach((p) => {
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
    console.error("Reregistration Stats GET error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil statistik pembayaran" },
      { status: 500 }
    );
  }
}
