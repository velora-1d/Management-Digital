import { NextResponse } from "next/server";
import { db } from "@/db";
import { 
    users, 
    academicYears, 
    classrooms, 
    employees, 
    students, 
    studentEnrollments, 
    ppdbRegistrations, 
    cashAccounts, 
    salaryComponents, 
    schoolSettings 
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { eq, and, isNull } from "drizzle-orm";

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
    const [existingAdmin] = await db
        .select()
        .from(users)
        .where(eq(users.email, "demo@managementdigital.com"))
        .limit(1);
    
    if (!existingAdmin) {
      await db.insert(users).values({ 
          name: "Administrator", 
          email: "demo@managementdigital.com", 
          password: hashPassword("password123"), 
          role: "superadmin", 
          status: "aktif" 
      });
    }

    // 2. Tahun Ajaran
    const [ay] = await db
        .select()
        .from(academicYears)
        .where(eq(academicYears.year, "2025/2026"))
        .limit(1);
    
    let ayId = ay?.id;
    if (!ay) {
      const [created] = await db.insert(academicYears).values({ 
          year: "2025/2026", 
          isActive: true, 
          startDate: "2025-07-14", 
          endDate: "2026-06-20" 
      }).returning({ id: academicYears.id });
      ayId = created.id;
    }

    // 3. Kelas 1-6
    const kelasNames = ["Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5", "Kelas 6"];
    for (const name of kelasNames) {
      const [exists] = await db
        .select()
        .from(classrooms)
        .where(and(eq(classrooms.name, name), isNull(classrooms.deletedAt)))
        .limit(1);
      
      if (!exists) {
        await db.insert(classrooms).values({ name, academicYearId: ayId || null });
      }
    }
    const allKelas = await db.select().from(classrooms).where(isNull(classrooms.deletedAt));

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
      const [exists] = await db
        .select()
        .from(employees)
        .where(and(eq(employees.name, guruData[i].name), isNull(employees.deletedAt)))
        .limit(1);
      
      if (!exists) {
        await db.insert(employees).values({
          name: guruData[i].name, 
          nip: `G${String(i + 1).padStart(3, "0")}`, 
          type: "guru", 
          position: guruData[i].position, 
          status: "aktif", 
          phone: `08${1100000 + i}`, 
          baseSalary: 2500000 + (i * 100000)
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
      const [exists] = await db
        .select()
        .from(employees)
        .where(and(eq(employees.name, stafData[i].name), isNull(employees.deletedAt)))
        .limit(1);
      
      if (!exists) {
        await db.insert(employees).values({
          name: stafData[i].name, 
          nip: `S${String(i + 1).padStart(3, "0")}`, 
          type: "staf", 
          position: stafData[i].position, 
          status: "aktif", 
          phone: `08${2200000 + i}`, 
          baseSalary: 2000000 + (i * 50000)
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
        
        const [exists] = await db
            .select()
            .from(students)
            .where(and(eq(students.name, nama), isNull(students.deletedAt)))
            .limit(1);
        
        if (!exists) {
          const [student] = await db.insert(students).values({
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
          }).returning({ id: students.id });

          // BUAT ENROLLMENT
          await db.insert(studentEnrollments).values({
              studentId: student.id,
              classroomId: kelas.id,
              academicYearId: ayId!,
              enrollmentType: 'new',
              notes: 'Generated from Seed',
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
      const [exists] = await db
        .select()
        .from(ppdbRegistrations)
        .where(and(eq(ppdbRegistrations.name, ppdbNames[i]), isNull(ppdbRegistrations.deletedAt)))
        .limit(1);
      
      if (!exists) {
        await db.insert(ppdbRegistrations).values({
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
        });
      }
    }

    // 9. Kas/Bank Account
    const cashAccountsList = [
      { name: "Kas Utama", balance: 0 },
      { name: "Bank BSI", balance: 0 },
    ];
    for (const ca of cashAccountsList) {
      const [exists] = await db
        .select()
        .from(cashAccounts)
        .where(and(eq(cashAccounts.name, ca.name), isNull(cashAccounts.deletedAt)))
        .limit(1);
      
      if (!exists) {
        await db.insert(cashAccounts).values(ca);
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
      const [exists] = await db
        .select()
        .from(salaryComponents)
        .where(and(eq(salaryComponents.name, comp.name), isNull(salaryComponents.deletedAt)))
        .limit(1);
      
      if (!exists) {
        await db.insert(salaryComponents).values(comp);
      }
    }
    
    // 11. Profile & Identitas
    const profileSettingsList = {
      school_name: "Velora",
      school_logo: "/images/logo.png"
    };
    
    for (const [key, value] of Object.entries(profileSettingsList)) {
      const [existing] = await db
        .select()
        .from(schoolSettings)
        .where(eq(schoolSettings.key, key))
        .limit(1);
      
      if (existing) {
        await db.update(schoolSettings).set({ value, updatedAt: new Date() }).where(eq(schoolSettings.id, existing.id));
      } else {
        await db.insert(schoolSettings).values({ key, value });
      }
    }

    return NextResponse.json({ success: true, message: "Seed data dummy berhasil! Admin: demo@managementdigital.com / password123" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, message: "Seed gagal: " + String(error) }, { status: 500 });
  }
}
