import { NextResponse } from "next/server";
import { db } from "@/db";
import { reRegistrations, students, classrooms, registrationPayments } from "@/db/schema";
import { eq, and, isNull, desc, inArray } from "drizzle-orm";

export async function GET() {
  try {
    const reregList = await db
      .select({
        id: reRegistrations.id,
        status: reRegistrations.status,
        studentId: reRegistrations.studentId,
        student: {
          id: students.id,
          name: students.name,
          classroomId: students.classroomId,
          gender: students.gender,
        }
      })
      .from(reRegistrations)
      .leftJoin(students, eq(reRegistrations.studentId, students.id))
      .where(isNull(reRegistrations.deletedAt))
      .orderBy(desc(reRegistrations.id));

    // Map classrooms
    const classRoomsList = await db
      .select({ id: classrooms.id, name: classrooms.name })
      .from(classrooms);
    const classMap = Object.fromEntries(classRoomsList.map(c => [c.id, c.name]));

    // Map payments
    const reregIds = reregList.map(r => r.id);
    let payments: any[] = [];
    if (reregIds.length > 0) {
      payments = await db
        .select()
        .from(registrationPayments)
        .where(
          and(
            eq(registrationPayments.payableType, "reregistration"),
            isNull(registrationPayments.deletedAt),
            inArray(registrationPayments.payableId, reregIds)
          )
        );
    }

    const paymentMap = payments.reduce((acc, p) => {
      const key = String(p.payableId);
      if (!acc[key]) acc[key] = {};
      acc[key][p.paymentType as string] = p.isPaid;
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
    console.error("Reregistration GET error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data daftar ulang" },
      { status: 500 }
    );
  }
}
