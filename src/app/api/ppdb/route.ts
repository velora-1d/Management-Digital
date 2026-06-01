import { NextResponse } from "next/server";
import { db } from "@/db";
import { ppdbRegistrations, registrationPayments } from "@/db/schema";
import { isNull, and, eq, or, ilike, desc, inArray, sql } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";
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
    if (status) {
      conditions.push(eq(ppdbRegistrations.status, status));
    }

    const [list, [{ total }]] = await Promise.all([
      db.select({
        id: ppdbRegistrations.id,
        formNo: ppdbRegistrations.formNo,
        name: ppdbRegistrations.name,
        fatherName: ppdbRegistrations.fatherName,
        motherName: ppdbRegistrations.motherName,
        gender: ppdbRegistrations.gender,
        phone: ppdbRegistrations.phone,
        status: ppdbRegistrations.status,
        targetClassroom: ppdbRegistrations.targetClassroom,
        createdAt: ppdbRegistrations.createdAt,
      })
      .from(ppdbRegistrations)
      .where(and(...conditions))
      .orderBy(desc(ppdbRegistrations.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),

      db.select({ total: sql<number>`count(*)`.mapWith(Number) }).from(ppdbRegistrations).where(and(...conditions)),
    ]);

    const regIds = list.map(r => r.id);
    let payments: { id: number, payableId: number | null, paymentType: string, nominal: number, isPaid: boolean }[] = [];
    if (regIds.length > 0) {
      payments = await db.select({
        id: registrationPayments.id,
        payableId: registrationPayments.payableId,
        paymentType: registrationPayments.paymentType,
        nominal: registrationPayments.nominal,
        isPaid: registrationPayments.isPaid,
      })
      .from(registrationPayments)
      .where(and(eq(registrationPayments.payableType, "ppdb"), inArray(registrationPayments.payableId, regIds), isNull(registrationPayments.deletedAt)));
    }

    const dataWithPayments = list.map(r => ({ 
      ...r, 
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
      payments: payments.filter(p => p.payableId === r.id) 
    }));

    const [{ pending }, { diterima }, { ditolak }, { totalAll }] = await Promise.all([
      db.select({ pending: sql<number>`count(*)`.mapWith(Number) }).from(ppdbRegistrations).where(and(isNull(ppdbRegistrations.deletedAt), or(eq(ppdbRegistrations.status, "menunggu" as string), eq(ppdbRegistrations.status, "pending" as string)))).then(r => r[0]),
      db.select({ diterima: sql<number>`count(*)`.mapWith(Number) }).from(ppdbRegistrations).where(and(isNull(ppdbRegistrations.deletedAt), eq(ppdbRegistrations.status, "diterima" as string))).then(r => r[0]),
      db.select({ ditolak: sql<number>`count(*)`.mapWith(Number) }).from(ppdbRegistrations).where(and(isNull(ppdbRegistrations.deletedAt), eq(ppdbRegistrations.status, "ditolak" as string))).then(r => r[0]),
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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body.name || body.nama; // Support field lama/baru
    if (!name) return NextResponse.json({ success: false, message: "Nama calon murid wajib diisi" }, { status: 400, headers: corsHeaders });

    const nik = body.nik || "";
    const nisn = body.nisn || "";

    // 1. Cek Duplikasi Berdasarkan NIK atau NISN
    if (nik || nisn) {
      const existing = await db.select().from(ppdbRegistrations)
        .where(
          or(
            nik ? eq(ppdbRegistrations.nik, nik) : undefined,
            nisn ? eq(ppdbRegistrations.nisn, nisn) : undefined
          )
        ).limit(1);

      if (existing.length > 0) {
        const found = existing[0];
        
        // Jika data aktif ada, kembalikan error
        if (!found.deletedAt) {
          return NextResponse.json({ 
            success: false, 
            message: `Pendaftar dengan ${nik ? 'NIK' : 'NISN'} tersebut sudah terdaftar (No Formulir: ${found.formNo})` 
          }, { status: 400, headers: corsHeaders });
        }

        // 2. Restore Logic: Jika data terhapus, aktifkan kembali
        // Sesuai permintaan user: Gunakan nomor formulir yang LAMA
        const updateData = {
          name: name,
          gender: body.gender || "L",
          birthPlace: body.birthPlace || body.tempat_lahir || "",
          birthDate: body.birthDate || body.tanggal_lahir || "",
          nik: nik,
          noKk: body.noKk || body.no_kk || "",
          nisn: nisn,
          phone: body.phone || body.no_telp || "",
          address: body.address || body.alamat || "",
          previousSchool: body.previousSchool || body.asal_sekolah || "",
          targetClassroom: body.targetClassroom || body.kelas_tujuan || "",
          status: "pending" as string,
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
          deletedAt: null,
          updatedAt: new Date(),
        };

        const [restored] = await db.update(ppdbRegistrations)
          .set(updateData)
          .where(eq(ppdbRegistrations.id, found.id))
          .returning();

        return NextResponse.json({ 
          success: true, 
          message: `Data pendaftar ${restored.formNo} berhasil dipulihkan dari arsip`, 
          data: restored,
          isRestored: true 
        });
      }
    }

    // 3. Create New Logic (Jika tidak ada data lama atau NIK/NISN kosong)
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const [{ cnt }] = await db.select({ cnt: sql<number>`count(*)`.mapWith(Number) }).from(ppdbRegistrations);
    const formNo = `PPDB-${yearMonth}-${String(cnt + 1).padStart(4, "0")}`;

    const [registration] = await db.insert(ppdbRegistrations).values({
      formNo,
      name: name,
      gender: body.gender || "L",
      birthPlace: body.birthPlace || body.tempat_lahir || "",
      birthDate: body.birthDate || body.tanggal_lahir || "",
      nik: nik,
      noKk: body.noKk || body.no_kk || "",
      nisn: nisn,
      phone: body.phone || body.no_telp || "",
      address: body.address || body.alamat || "",
      previousSchool: body.previousSchool || body.asal_sekolah || "",
      targetClassroom: body.targetClassroom || body.kelas_tujuan || "",
      status: "pending" as string,
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

    return NextResponse.json({ success: true, message: `Pendaftaran ${formNo} berhasil disimpan`, data: registration }, { headers: corsHeaders });
  } catch (error) {
    console.error("PPDB POST error:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan pendaftaran" }, { status: 500, headers: corsHeaders });
  }
}
