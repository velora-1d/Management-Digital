import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reregList = await prisma.reRegistration.findMany({
      where: { deletedAt: null },
      include: {
        student: {
          select: { id: true, name: true, classroomId: true, gender: true },
        },
      },
      orderBy: { id: "desc" },
    });

    // Map classrooms
    const classRooms = await prisma.classroom.findMany({
      select: { id: true, name: true },
    });
    const classMap = Object.fromEntries(classRooms.map(c => [c.id, c.name]));

    // Map payments
    const payments = await prisma.registrationPayment.findMany({
      where: { payableType: "reregistration", deletedAt: null },
    });
    const paymentMap = payments.reduce((acc, p) => {
      const key = String(p.payableId);
      if (!acc[key]) acc[key] = {};
      acc[key][p.paymentType] = p.isPaid;
      return acc;
    }, {} as Record<string, Record<string, boolean>>);

    let confirmed = 0;
    let pending = 0;
    let not_registered = 0;

    const data = reregList.map((reg) => {
      if (reg.status === "confirmed") confirmed++;
      else if (reg.status === "not_registered") not_registered++;
      else pending++;

      const p = paymentMap[reg.id.toString()] || {};

      return {
        id: reg.id,
        student_name: reg.student?.name || "Anonim",
        classroom: reg.student?.classroomId ? classMap[reg.student.classroomId] || "-" : "-",
        gender: reg.student?.gender || "L",
        status: reg.status,
        payment: {
          id: reg.id.toString(),
          is_fee_paid: p["fee"] || false,
          is_books_paid: p["books"] || false,
          is_uniform_paid: p["uniform"] || false,
          is_books_received: p["books_received"] || false,
          is_uniform_received: p["uniform_received"] || false,
        },
      };
    });

    return NextResponse.json({
      data,
      total: data.length,
      confirmed,
      pending,
      not_registered,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data daftar ulang" },
      { status: 500 }
    );
  }
}
