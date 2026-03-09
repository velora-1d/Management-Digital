"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSiswa(tenantId: string) {
  try {
    const siswa = await prisma.siswa.findMany({
      where: { tenant_id: tenantId },
      include: {
        kelas_siswa: {
          include: { kelas: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    return { success: true, data: siswa };
  } catch (error) {
    return { success: false, error: "Gagal memuat data siswa" };
  }
}

export async function createSiswa(data: {
  tenantId: string;
  nis: string;
  nisn?: string;
  namaLengkap: string;
  gender: string;
}) {
  try {
    const newSiswa = await prisma.siswa.create({
      data: {
        tenant_id: data.tenantId,
        nis: data.nis,
        nisn: data.nisn,
        nama_lengkap: data.namaLengkap,
        gender: data.gender,
        status: "aktif",
      }
    });

    revalidatePath('/sekolah/siswa');
    return { success: true, data: newSiswa };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Gagal menambahkan siswa. Pastikan NIS unik." };
  }
}
