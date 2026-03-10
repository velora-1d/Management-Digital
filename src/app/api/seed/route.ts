import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    // SECURITY: Blokir seed di production
    if (process.env.NODE_ENV === "production" && !process.env.ALLOW_SEED) {
      return NextResponse.json(
        { success: false, message: "Seed endpoint dinonaktifkan di production." },
        { status: 403 }
      );
    }

    // 1. Admin user
    const existing = await prisma.user.findFirst({ where: { email: "demo@managementdigital.com" } });
    if (!existing) {
      await prisma.user.create({
        data: { name: "Administrator", email: "demo@managementdigital.com", password: hashPassword("password123"), role: "superadmin", status: "aktif" },
      });
    }

    // 2. Tahun Ajaran
    const ay = await prisma.academicYear.findFirst({ where: { year: "2025/2026" } });
    let ayId = ay?.id;
    if (!ay) {
      const created = await prisma.academicYear.create({ data: { year: "2025/2026", isActive: true, startDate: "2025-07-14", endDate: "2026-06-20" } });
      ayId = created.id;
    }

    // 3. Kelas 1-6
    const kelasNames = ["Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5", "Kelas 6"];
    for (const name of kelasNames) {
      const exists = await prisma.classroom.findFirst({ where: { name, deletedAt: null } });
      if (!exists) {
        await prisma.classroom.create({ data: { name, academicYearId: ayId || null } });
      }
    }
    const allKelas = await prisma.classroom.findMany({ where: { deletedAt: null } });

    // 4. Guru (12 orang: 6 wali kelas + 6 guru mapel)
    const guruData = [
      { name: "Ustadzah Fatimah", position: "Wali Kelas 1" },
      { name: "Ustadz Ahmad", position: "Wali Kelas 2" },
      { name: "Ustadzah Khadijah", position: "Wali Kelas 3" },
      { name: "Ustadz Bilal", position: "Wali Kelas 4" },
      { name: "Ustadzah Aisyah", position: "Wali Kelas 5" },
      { name: "Ustadz Umar", position: "Wali Kelas 6" },
      { name: "Ustadz Hamzah", position: "Guru Al-Quran" },
      { name: "Ustadzah Ruqayyah", position: "Guru Fiqih" },
      { name: "Ustadz Zaid", position: "Guru Bahasa Arab" },
      { name: "Ustadzah Halimah", position: "Guru Matematika" },
      { name: "Ustadz Muaz", position: "Guru IPA" },
      { name: "Ustadzah Safiyyah", position: "Guru Bahasa Indonesia" },
    ];
    for (let i = 0; i < guruData.length; i++) {
      const exists = await prisma.employee.findFirst({ where: { name: guruData[i].name, deletedAt: null } });
      if (!exists) {
        await prisma.employee.create({
          data: { name: guruData[i].name, nip: `G${String(i + 1).padStart(3, "0")}`, type: "guru", position: guruData[i].position, status: "aktif", phone: `08${1100000 + i}`, baseSalary: 2500000 + (i * 100000) },
        });
      }
    }

    // 5. Staf (8 orang)
    const stafData = [
      { name: "Pak Ridwan", position: "Kepala TU" },
      { name: "Bu Sri", position: "Bendahara" },
      { name: "Pak Joko", position: "Penjaga Sekolah" },
      { name: "Bu Ani", position: "Pustakawan" },
      { name: "Pak Dedi", position: "IT Support" },
      { name: "Bu Lestari", position: "Admin Keuangan" },
      { name: "Pak Hendra", position: "Satpam" },
      { name: "Bu Rina", position: "Staf Administrasi" },
    ];
    for (let i = 0; i < stafData.length; i++) {
      const exists = await prisma.employee.findFirst({ where: { name: stafData[i].name, deletedAt: null } });
      if (!exists) {
        await prisma.employee.create({
          data: { name: stafData[i].name, nip: `S${String(i + 1).padStart(3, "0")}`, type: "staf", position: stafData[i].position, status: "aktif", phone: `08${2200000 + i}`, baseSalary: 2000000 + (i * 50000) },
        });
      }
    }

    // 6. Siswa (10 per kelas = 60 total)
    const namaPA = ["Ahmad", "Muhammad", "Ali", "Hasan", "Ibrahim"];
    const namaPI = ["Fatimah", "Aisyah", "Khadijah", "Maryam", "Hafshah"];
    let siswaCount = 0;
    for (const kelas of allKelas) {
      for (let j = 0; j < 10; j++) {
        const gender = j < 5 ? "L" : "P";
        const nama = gender === "L"
          ? `${namaPA[j % 5]} ${kelas.name.replace("Kelas ", "")}${String.fromCharCode(65 + j)}`
          : `${namaPI[j % 5]} ${kelas.name.replace("Kelas ", "")}${String.fromCharCode(65 + j)}`;
        const exists = await prisma.student.findFirst({ where: { name: nama, deletedAt: null } });
        if (!exists) {
          const student = await prisma.student.create({
            data: {
              name: nama,
              nisn: `00${1000 + siswaCount}`,
              nis: `${2025}${String(siswaCount + 1).padStart(3, "0")}`,
              gender,
              category: "reguler",
              classroomId: kelas.id,
              status: "aktif",
              entryDate: "2025-07-14",
              infaqStatus: "reguler",
              infaqNominal: 150000,
            },
          });

          // BUAT ENROLLMENT (Penting agar siswa muncul di dashboard!)
          await prisma.studentEnrollment.create({
            data: {
              studentId: student.id,
              classroomId: kelas.id,
              academicYearId: ayId!,
              enrollmentType: 'new',
              notes: 'Generated from Seed',
            }
          });
        }
        siswaCount++;
      }
    }

    // 7. PPDB (15 pendaftar)
    const ppdbNames = [
      "Zahra Putri", "Rafi Ahmad", "Nadia Safira", "Faris Hakim", "Siti Aminah",
      "Usman Fadli", "Layla Nur", "Hamza Rizki", "Dina Rahma", "Yusuf Akbar",
      "Salma Azzahra", "Khalid Fauzan", "Nabila Husna", "Ilham Maulana", "Aqila Rahmah",
    ];
    for (let i = 0; i < ppdbNames.length; i++) {
      const exists = await prisma.ppdbRegistration.findFirst({ where: { name: ppdbNames[i], deletedAt: null } });
      if (!exists) {
        await prisma.ppdbRegistration.create({
          data: {
            formNo: `PPDB-2025-${String(i + 1).padStart(3, "0")}`,
            name: ppdbNames[i],
            gender: i % 2 === 0 ? "P" : "L",
            birthPlace: "Bandung",
            birthDate: `201${8 + (i % 2)}-0${(i % 9) + 1}-${String(10 + (i % 20)).padStart(2, "0")}`,
            fatherName: `Bapak ${ppdbNames[i].split(" ")[1]}`,
            motherName: `Ibu ${ppdbNames[i].split(" ")[1]}`,
            phone: `08${3300000 + i}`,
            address: `Jl. Contoh No. ${i + 1}`,
            status: i < 5 ? "pending" : i < 10 ? "diterima" : "pending",
            registrationSource: "offline",
          },
        });
      }
    }

    // 8. Kategori Keuangan Dihapus agar user bisa mengisi sendiri


    // 9. Kas/Bank Account
    const cashAccounts = [
      { name: "Kas Utama", balance: 0 },
      { name: "Bank BSI", balance: 0 },
    ];
    for (const ca of cashAccounts) {
      const exists = await prisma.cashAccount.findFirst({ where: { name: ca.name, deletedAt: null } });
      if (!exists) {
        await prisma.cashAccount.create({ data: ca });
      }
    }

    // 10. Komponen Gaji
    const salaryComps = [
      { name: "Tunjangan Transport", type: "earning", defaultAmount: 300000 },
      { name: "Tunjangan Makan", type: "earning", defaultAmount: 200000 },
      { name: "BPJS Kesehatan", type: "deduction", defaultAmount: 50000 },
      { name: "Potongan Lainnya", type: "deduction", defaultAmount: 0 },
    ];
    for (const comp of salaryComps) {
      const exists = await prisma.salaryComponent.findFirst({ where: { name: comp.name, deletedAt: null } });
      if (!exists) {
        await prisma.salaryComponent.create({ data: comp });
      }
    }
    
    // 11. Profile & Identitas
    const profileSettings = {
      school_name: "Velora",
      school_logo: "/images/logo.png"
    };
    
    for (const [key, value] of Object.entries(profileSettings)) {
      const existing = await prisma.schoolSetting.findFirst({ where: { key } });
      if (existing) {
        await prisma.schoolSetting.update({ where: { id: existing.id }, data: { value } });
      } else {
        await prisma.schoolSetting.create({ data: { key, value } });
      }
    }

    return NextResponse.json({ success: true, message: "Seed data dummy berhasil! Admin: demo@managementdigital.com / password123" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, message: "Seed gagal: " + String(error) }, { status: 500 });
  }
}
