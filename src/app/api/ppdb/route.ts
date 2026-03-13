import { NextResponse } from "next/server";
import { db } from "@/db";
import { ppdbRegistrations, registrationPayments } from "@/db/schema";
import { isNull, and, eq, or, ilike, desc, inArray, sql } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));

  try {
    const conditions = [isNull(ppdbRegistrations.deletedAt)];
    if (search) {
      conditions.push(or(
        ilike(ppdbRegistrations.name, `%${search}%`),
        ilike(ppdbRegistrations.fatherName, `%${search}%`),
        ilike(ppdbRegistrations.motherName, `%${search}%`),
        ilike(ppdbRegistrations.formNo, `%${search}%`),
      )!);
    }

    const [list, [{ total }]] = await Promise.all([
      db.select().from(ppdbRegistrations).where(and(...conditions)).orderBy(desc(ppdbRegistrations.createdAt)).limit(limit).offset((page - 1) * limit),
      db.select({ total: sql<number>`count(*)`.mapWith(Number) }).from(ppdbRegistrations).where(and(...conditions)),
    ]);

    const regIds = list.map(r => r.id);
    let payments: any[] = [];
    if (regIds.length > 0) {
      payments = await db.select().from(registrationPayments)
        .where(and(eq(registrationPayments.payableType, "ppdb"), inArray(registrationPayments.payableId, regIds), isNull(registrationPayments.deletedAt)));
    }

    const dataWithPayments = list.map(r => ({ ...r, payments: payments.filter(p => p.payableId === r.id) }));

    const [{ pending }, { diterima }, { ditolak }, { totalAll }] = await Promise.all([
      db.select({ pending: sql<number>`count(*)`.mapWith(Number) }).from(ppdbRegistrations).where(and(isNull(ppdbRegistrations.deletedAt), or(eq(ppdbRegistrations.status, "menunggu" as any), eq(ppdbRegistrations.status, "pending" as any)))).then(r => r[0]),
      db.select({ diterima: sql<number>`count(*)`.mapWith(Number) }).from(ppdbRegistrations).where(and(isNull(ppdbRegistrations.deletedAt), eq(ppdbRegistrations.status, "diterima" as any))).then(r => r[0]),
      db.select({ ditolak: sql<number>`count(*)`.mapWith(Number) }).from(ppdbRegistrations).where(and(isNull(ppdbRegistrations.deletedAt), eq(ppdbRegistrations.status, "ditolak" as any))).then(r => r[0]),
      db.select({ totalAll: sql<number>`count(*)`.mapWith(Number) }).from(ppdbRegistrations).where(isNull(ppdbRegistrations.deletedAt)).then(r => r[0]),
    ]);

    return NextResponse.json({
      success: true,
      data: dataWithPayments,
      stats: { total: totalAll, pending, diterima, ditolak },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("PPDB GET error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name) return NextResponse.json({ success: false, message: "Nama calon murid wajib diisi" }, { status: 400 });

    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const [{ cnt }] = await db.select({ cnt: sql<number>`count(*)`.mapWith(Number) }).from(ppdbRegistrations);
    const formNo = `PPDB-${yearMonth}-${String(cnt + 1).padStart(4, "0")}`;

    const [registration] = await db.insert(ppdbRegistrations).values({
      formNo,
      name: body.name,
      gender: body.gender || "L",
      birthPlace: body.birthPlace || "",
      birthDate: body.birthDate || "",
      nik: body.nik || "",
      noKk: body.noKk || "",
      nisn: body.nisn || "",
      phone: body.phone || "",
      address: body.address || "",
      previousSchool: body.previousSchool || "",
      targetClassroom: body.targetClassroom || "",
      status: "pending" as any,
      registrationSource: "offline",
      notes: body.notes || "",
      familyStatus: body.familyStatus || "",
      siblingCount: body.siblingCount ? Number(body.siblingCount) : null,
      childPosition: body.childPosition ? Number(body.childPosition) : null,
      religion: body.religion || "Islam",
      village: body.village || "",
      district: body.district || "",
      residenceType: body.residenceType || "",
      transportation: body.transportation || "",
      studentPhone: body.studentPhone || "",
      height: body.height ? Number(body.height) : null,
      weight: body.weight ? Number(body.weight) : null,
      distanceToSchool: body.distanceToSchool || "",
      travelTime: body.travelTime ? Number(body.travelTime) : null,
      fatherName: body.fatherName || "",
      fatherNik: body.fatherNik || "",
      fatherBirthPlace: body.fatherBirthPlace || "",
      fatherBirthDate: body.fatherBirthDate || "",
      fatherEducation: body.fatherEducation || "",
      fatherOccupation: body.fatherOccupation || "",
      motherName: body.motherName || "",
      motherNik: body.motherNik || "",
      motherBirthPlace: body.motherBirthPlace || "",
      motherBirthDate: body.motherBirthDate || "",
      motherEducation: body.motherEducation || "",
      motherOccupation: body.motherOccupation || "",
      parentIncome: body.parentIncome || "",
      guardianName: body.guardianName || "",
      guardianNik: body.guardianNik || "",
      guardianBirthPlace: body.guardianBirthPlace || "",
      guardianBirthDate: body.guardianBirthDate || "",
      guardianEducation: body.guardianEducation || "",
      guardianOccupation: body.guardianOccupation || "",
      guardianAddress: body.guardianAddress || "",
      guardianPhone: body.guardianPhone || "",
    }).returning();

    return NextResponse.json({ success: true, message: `Pendaftaran ${formNo} berhasil disimpan`, data: registration });
  } catch (error) {
    console.error("PPDB POST error:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan pendaftaran" }, { status: 500 });
  }
}
