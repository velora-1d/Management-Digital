import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { fakerID_ID as faker } from '@faker-js/faker';

const prisma = new PrismaClient();
const CURRENT_UNIT = "U-DEMO";

async function main() {
    console.log("\n🚀 Memulai Seeder Data Dummy (Batch Optimized) untuk Demo Lengkap...");

    // 1. Setup Academic Year
    let academicYear = await prisma.academicYear.findFirst({ where: { isActive: true } });
    if (!academicYear) {
        academicYear = await prisma.academicYear.create({
            data: { year: "2023/2024", isActive: true, startDate: "2023-07-01", endDate: "2024-06-30" }
        });
        console.log("✅ [1/15] Tahun Ajaran aktif dibuat.");
    } else {
        console.log("ℹ️ [1/15] Tahun Ajaran aktif sudah ada.");
    }

    // 2. Setup Transaction Categories
    const catCheck = await prisma.transactionCategory.count();
    let categories;
    if (catCheck === 0) {
        await prisma.transactionCategory.createMany({
            data: [
                { name: "Pemasukan SPP / Infaq", type: "in", unitId: CURRENT_UNIT },
                { name: "Pemasukan Gedung", type: "in", unitId: CURRENT_UNIT },
                { name: "BOS Nasional", type: "in", unitId: CURRENT_UNIT },
                { name: "BOS Daerah", type: "in", unitId: CURRENT_UNIT },
                { name: "Pengeluaran Gaji / Payroll", type: "out", unitId: CURRENT_UNIT },
                { name: "Operasional AC & Listrik", type: "out", unitId: CURRENT_UNIT },
                { name: "Pembelian ATK & Inventaris", type: "out", unitId: CURRENT_UNIT },
            ]
        });
        console.log("✅ [2/15] Kategori Transaksi Induk dibuat.");
    } else {
        console.log("ℹ️ [2/15] Kategori Transaksi sudah ada.");
    }
    categories = await prisma.transactionCategory.findMany();

    // 2.5 Setup Cash Account
    let mainCash = await prisma.cashAccount.findFirst({ where: { name: "Kas Utama Sekolah" }});
    if (!mainCash) {
        mainCash = await prisma.cashAccount.create({ data: { name: "Kas Utama Sekolah", balance: 50000000, unitId: CURRENT_UNIT }});
        console.log("✅ [3/15] Rekening Kas Utama Sekolah dibuat dengan saldo 50.000.000.");
    } else {
        console.log("ℹ️ [3/15] Rekening Kas Utama sudah ada.");
    }

    // 3. Setup Users & Roles
    const roles = ["superadmin", "admin", "operator", "bendahara", "guru", "siswa"];
    const hashedPass = await bcrypt.hash("password123", 10);
    const existingUsers = await prisma.user.findMany({ select: { email: true }});
    const existingEmails = new Set(existingUsers.map(u => u.email));
    
    const userCreates = [];
    for (const r of roles) {
        const email = `${r}@demo.com`;
        if (!existingEmails.has(email)) {
            userCreates.push(prisma.user.create({
                data: {
                    name: `Demo ${r.toUpperCase()}`,
                    email,
                    password: hashedPass,
                    role: r,
                    unitId: CURRENT_UNIT
                }
            }));
        }
    }
    await Promise.all(userCreates);
    console.log(`✅ [4/15] ${userCreates.length} User Role standard ditambahkan/diperiksa.`);

    // 4. Generate Teachers/Employees (20 orang)
    const existingEmp = await prisma.employee.count();
    let teachers = [];
    if (existingEmp < 20) {
        const empData = [];
        for (let i = 0; i < 20 - existingEmp; i++) {
            empData.push({
                name: faker.person.fullName(),
                nip: `198${faker.string.numeric(8)}`,
                type: i < 5 ? "staf" : "guru", // 5 staff TU, 15 guru
                phone: faker.phone.number(),
                address: faker.location.streetAddress(),
                joinDate: faker.date.past({ years: 5 }).toISOString().split('T')[0],
                baseSalary: 3000000 + (Math.floor(Math.random() * 20) * 100000),
                unitId: CURRENT_UNIT
            });
        }
        await prisma.employee.createMany({ data: empData });
        console.log(`✅ [5/15] ${20 - existingEmp} Pegawai (Guru & Staf) berhasil ditambahkan.`);
    } else {
        console.log("ℹ️ [5/15] Pegawai sudah memadai (>20).");
    }
    teachers = await prisma.employee.findMany({ where: { type: "guru" } });

    // 5. Setup Classrooms (6 Kelas)
    const classNames = ["1A", "1B", "2A", "2B", "3A", "3B"];
    const existingClasses = await prisma.classroom.findMany({ where: { academicYearId: academicYear.id } });
    const existingClassNames = new Set(existingClasses.map(c => c.name));
    
    const classCreates = [];
    for (const [idx, cName] of classNames.entries()) {
        if (!existingClassNames.has(cName)) {
            classCreates.push(prisma.classroom.create({
                data: {
                    name: cName,
                    academicYearId: academicYear.id,
                    waliKelasId: teachers[idx % teachers.length]?.id || null,
                    infaqNominal: 250000
                }
            }));
        }
    }
    await Promise.all(classCreates);
    const classrooms = await prisma.classroom.findMany({ where: { academicYearId: academicYear.id } });
    console.log(`✅ [6/15] ${classrooms.length} Ruang Kelas & Wali Kelas tersedia.`);

    // 6. Data Siswa & Enrollment (120 Siswa = 20 per kelas)
    const studentCount = await prisma.student.count();
    let students = await prisma.student.findMany();
    
    if (studentCount < 120) {
        console.log("⏳ [7/15] Membuat data siswa dan enrollment dalam BATCH (sangat cepat)...");
        const newStudents = 120 - studentCount;
        const studentCreates = [];
        
        for (let i = 0; i < newStudents; i++) {
            const gender = Math.random() > 0.5 ? "L" : "P";
            const cRoom = classrooms[i % classrooms.length];
            studentCreates.push(prisma.student.create({
                data: {
                    nisn: faker.string.numeric(10),
                    nis: faker.string.numeric(6),
                    name: faker.person.fullName({ sex: gender === "L" ? "male" : "female" }),
                    gender,
                    classroomId: cRoom.id,
                    entryDate: faker.date.past({ years: 2 }).toISOString().split('T')[0],
                    unitId: CURRENT_UNIT,
                    phone: faker.phone.number(),
                    address: faker.location.streetAddress(),
                    birthPlace: faker.location.city(),
                    birthDate: faker.date.birthdate({ min: 12, max: 18, mode: 'age' }).toISOString().split('T')[0],
                    infaqNominal: cRoom.infaqNominal,
                    fatherName: faker.person.fullName({ sex: "male" }),
                    fatherOccupation: faker.person.jobTitle(),
                    motherName: faker.person.fullName({ sex: "female" }),
                    motherOccupation: "Ibu Rumah Tangga",
                    parentIncome: "3.000.000 - 5.000.000",
                    enrollments: {
                        create: [{
                            classroomId: cRoom.id,
                            academicYearId: academicYear.id,
                            enrollmentType: "baru"
                        }]
                    }
                }
            }));
        }
        
        // Split array into chunks of 40 to avoid connection overload
        const chunkSize = 40;
        for (let i = 0; i < studentCreates.length; i += chunkSize) {
            const chunk = studentCreates.slice(i, i + chunkSize);
            await Promise.all(chunk);
        }
        console.log(`✅ [7/15] ${newStudents} Data Siswa dan Pendaftaran Angkatan berhasil dibuat.`);
        students = await prisma.student.findMany(); // refresh list
    } else {
        console.log("ℹ️ [7/15] Data siswa sudah berjumlah besar dan terdaftar.");
    }

    // 7. Infaq & SPP Bills (4 bulan ke belakang, 75% lunas, masuk arus Kas)
    const infaqCheck = await prisma.infaqBill.count();
    let sppIn = 0;
    if (infaqCheck < 300) {
        console.log("⏳ [8/15] Generate Tagihan SPP s/d 4 bulan dalam mode BATCHING (harap tunggu 5-10 detik)...");
        const getCatInSPP = categories.find(c => c.name.includes("SPP"));
        const receiverAdmin = await prisma.user.findFirst({ where: { role: "admin" }});
        let cashIncrement = 0;
        
        const existingBills = await prisma.infaqBill.findMany({
            select: { studentId: true, month: true, year: true }
        });
        const billSet = new Set(existingBills.map(eb => `${eb.studentId}-${eb.month}-${eb.year}`));

        const newBillsData = [];
        const newPaymentsData = [];
        const newTransactionsData = [];
        let totalCashIn = 0;

        // 1. Kumpulkan data tagihan yang akan dibuat
        for (let m = 0; m < 4; m++) {
            let d = new Date();
            d.setMonth(d.getMonth() - m);
            const mStr = String(d.getMonth() + 1).padStart(2, '0');
            const yStr = d.getFullYear().toString();

            for (const std of students) {
                const bKey = `${std.id}-${mStr}-${yStr}`;
                if (!billSet.has(bKey)) {
                    const isPaid = Math.random() > 0.25;
                    const nominal = std.infaqNominal > 0 ? std.infaqNominal : 250000;
                    
                    newBillsData.push({
                        studentId: std.id,
                        academicYearId: academicYear.id,
                        month: mStr, year: yStr, nominal: nominal,
                        status: isPaid ? "lunas" : "belum_lunas",
                        unitId: CURRENT_UNIT
                    });
                }
            }
        }

        // 2. Insert semua tagihan (hanya butuh 1 koneksi DB)
        if (newBillsData.length > 0) {
            await prisma.infaqBill.createMany({ data: newBillsData, skipDuplicates: true });
            
            // 3. Ambil ulang data yang baru saja dimasukkan (butuh ID-nya)
            const createdBills = await prisma.infaqBill.findMany({
                where: { status: "lunas" },
                select: { id: true, nominal: true, studentId: true, month: true, year: true }
            });

            // 4. Siapkan Payments dan General Transactions
            for (const cb of createdBills) {
                // Pastikan belum dibayar (simpel, anggap belum ada payment karena baru dibuat)
                const dPaidStr = new Date().toISOString().split('T')[0];
                newPaymentsData.push({
                    billId: cb.id, cashAccountId: mainCash.id,
                    amountPaid: cb.nominal, paymentDate: dPaidStr,
                    receiverId: receiverAdmin?.id, unitId: CURRENT_UNIT,
                    notes: "Auto Lunas by Seeder (Batch)"
                });

                const stdName = students.find(s => s.id === cb.studentId)?.name || 'Siswa';
                newTransactionsData.push({
                    transactionCategoryId: getCatInSPP?.id || null,
                    cashAccountId: mainCash.id, type: "in", amount: cb.nominal,
                    description: `Infaq/SPP ${stdName} Bln ${cb.month}-${cb.year}`,
                    date: dPaidStr, unitId: CURRENT_UNIT
                });

                totalCashIn += cb.nominal;
                sppIn++;
            }

            // 5. Insert serentak
            if (newPaymentsData.length > 0) {
                await prisma.infaqPayment.createMany({ data: newPaymentsData });
                await prisma.generalTransaction.createMany({ data: newTransactionsData });
            }
            
            // Update balance kas utama
            if (totalCashIn > 0) {
                await prisma.cashAccount.update({
                    where: { id: mainCash.id },
                    data: { balance: { increment: totalCashIn } }
                });
            }
        }
        console.log(`✅ [8/15] +${sppIn} Pembayaran SPP (lunas) bulan tercatat.`);
    } else {
        console.log("ℹ️ [8/15] Tagihan/SPP sudah memadai untuk test.");
    }

    // 8. General Transaction (Arus Kas Pengeluaran Bebas)
    const opCheck = await prisma.generalTransaction.count({ where: { type: "out" }});
    if (opCheck < 20) {
        console.log("⏳ [9/15] Menambahkan beberapa pengeluaran dinamis untuk grafik...");
        const catOutOps = categories.find(c => c.name.includes("Operasional"));
        const catOutAtk = categories.find(c => c.name.includes("ATK"));
        let subBalance = 0;
        
        const outTransactions = [];
        for (let i = 0; i < 20; i++) {
            const isAtk = Math.random() > 0.5;
            const amnt = (Math.floor(Math.random() * 50) + 1) * 50000;
            const d = faker.date.recent({ days: 90 });
            outTransactions.push({
                type: "out",
                transactionCategoryId: isAtk ? catOutAtk?.id : catOutOps?.id,
                cashAccountId: mainCash.id,
                amount: amnt,
                description: isAtk ? `Pembelian Perangkat ${faker.commerce.productName()}` : `Biaya Vendor Servis ${faker.company.name()}`,
                date: d.toISOString().split('T')[0],
                unitId: CURRENT_UNIT
            });
            subBalance -= amnt;
        }
        await prisma.generalTransaction.createMany({ data: outTransactions });

        await prisma.cashAccount.update({
            where: { id: mainCash.id },
            data: { balance: { increment: subBalance } }
        });
        console.log("✅ [9/15] 20 Data Pengeluaran Operasional ditambahkan.");
    }

    // 9. Data Subjek/Mapel & Jadwal
    let subjects = await prisma.subject.findMany();
    if (subjects.length === 0) {
        const subData = ["Matematika", "Bahasa Indonesia", "IPA", "IPS", "Bahasa Inggris", "Pend. Agama Islam", "Seni Budaya", "PJOK"];
        const subInserts = subData.map(s => ({
            name: s, code: s.substring(0,3).toUpperCase(), unitId: CURRENT_UNIT
        }));
        await prisma.subject.createMany({ data: subInserts });
        subjects = await prisma.subject.findMany();
        console.log(`✅ [10/15] ${subjects.length} Mata Pelajaran Dasar Ditambahkan.`);
    } else {
         console.log("ℹ️ [10/15] Mata pelajaran sudah ada.");
    }

    // 10. Absensi Pegawai & Siswa (Scatter)
    const stdAttCheck = await prisma.attendance.count();
    if (stdAttCheck < 100 && students.length > 0) {
        console.log("⏳ [11/15] Menambahkan riwayat absensi (Batch) ...");
        const attInserts = [];
        const uniqueSet = new Set();
        for (let i = 0; i < 60; i++) {
            const dateStr = faker.date.recent({ days: 14 }).toISOString().split('T')[0];
            const std = students[Math.floor(Math.random() * students.length)];
            const stdKey = `${std.id}-${dateStr}`;
            
            if (!uniqueSet.has(stdKey)) {
                uniqueSet.add(stdKey);
                const r = Math.random();
                const status = r > 0.6 ? "sakit" : r > 0.3 ? "izin" : "alpha";
                attInserts.push({
                    studentId: std.id, classroomId: std.classroomId,
                    date: dateStr, status, note: "Berdasarkan info grup wali",
                });
            }
        }
        await prisma.attendance.createMany({ data: attInserts, skipDuplicates: true });
        console.log(`✅ [11/15] Rekap Absensi Siswa (Sakit/Izin/Alpha) disebar acak.`);
    }

    // 11. PPDB Dummies (Tahun Depan)
    const ppdbCheck = await prisma.ppdbRegistration.count();
    if (ppdbCheck < 20) {
        const ppdbArr = [];
        for(let i=0; i<40; i++) {
             const statusRand = Math.random();
             const stat = statusRand > 0.6 ? "diterima" : statusRand > 0.3 ? "pending" : "ditolak";
             ppdbArr.push({
                  formNo: `PPDB-2024-${faker.string.numeric(5)}`,
                  name: faker.person.fullName(),
                  status: stat,
                  unitId: CURRENT_UNIT,
                  phone: faker.phone.number(),
                  previousSchool: `SDN ${faker.location.city()}`
             });
        }
        await prisma.ppdbRegistration.createMany({ data: ppdbArr });
        console.log("✅ [12/15] Data PPDB 40 pendaftar simulasi dibuat.");
    } else {
        console.log("ℹ️ [12/15] Data calon pendaftar PPDB sudah siap.");
    }

    // 12. BK / Pelanggaran (Counseling)
    const bkCheck = await prisma.counselingRecord.count();
    if (bkCheck === 0 && students.length > 0) {
        const bkData = [];
        for(let i=0; i<25; i++) {
            bkData.push({
                studentId: students[Math.floor(Math.random() * students.length)].id,
                date: faker.date.recent({ days: 60 }).toISOString().split('T')[0],
                category: "perilaku",
                description: `Terlambat > 3x dan ${faker.lorem.words(3)}`,
                followUp: "Pemanggilan Orangtua / SP 1",
                unitId: CURRENT_UNIT
            });
        }
        await prisma.counselingRecord.createMany({ data: bkData });
        console.log("✅ [13/15] Catatan BK (Sanksi / Pelanggaran) ditambahkan.");
    } else {
        console.log("ℹ️ [13/15] Catatan BK sudah ada.");
    }
    
    // 13. Koperasi & Inventory & Tabungan Siswa
    const invCheck = await prisma.inventory.count();
    if (invCheck === 0) {
        await prisma.inventory.createMany({
            data: [
                { name: "Proyektor Epson LCD", quantity: 5, condition: "baik", category: "Elektronik", acquisitionCost: 5000000, unitId: CURRENT_UNIT },
                { name: "Papan Tulis Kaca Glassboard", quantity: 15, condition: "baik", category: "Furniture", acquisitionCost: 800000, unitId: CURRENT_UNIT },
                { name: "PC Lab Lenovo", quantity: 30, condition: "rusak_ringan", category: "Elektronik", acquisitionCost: 4500000, unitId: CURRENT_UNIT },
                { name: "Meja Guru Kayu Jati", quantity: 20, condition: "baik", category: "Furniture", acquisitionCost: 400000, unitId: CURRENT_UNIT },
                { name: "Kursi Siswa Besi Lapis", quantity: 240, condition: "baik", category: "Furniture", acquisitionCost: 150000, unitId: CURRENT_UNIT },
            ]
        });
        console.log("✅ [14/15] Aset & Inventaris Sekolah dimuat.");
    } else {
        console.log("ℹ️ [14/15] Data Inventaris sudah berisikan items.");
    }

    // 14. Tabungan Siswa (Mini Data)
    const savCheck = await prisma.studentSaving.count();
    if (savCheck === 0 && students.length > 0) {
        const savArr = [];
        for (let i = 0; i < 30; i++) {
            const std = students[Math.floor(Math.random() * students.length)];
            const amnt = (Math.floor(Math.random() * 10) + 1) * 10000; // 10rb - 100rb
            savArr.push({
                studentId: std.id,
                type: "in",
                amount: amnt,
                balanceAfter: amnt,
                date: faker.date.recent({ days: 20 }).toISOString().split('T')[0],
                description: "Setoran Wajib Mingguan",
                unitId: CURRENT_UNIT
            });
        }
        await prisma.studentSaving.createMany({ data: savArr });
        console.log("✅ [15/15] Simulasi Mutasi Tabungan Siswa ditambahkan.");
    } else {
        console.log("ℹ️ [15/15] Mutasi Tabungan Siswa sudah siap.");
    }

    console.log("\n🎊 SEEDING MASTER DATA SELESAI (CEPAT) 🎊");
    console.log("Silakan login menggunakan akun:");
    console.log("🔹 Email: superadmin@demo.com");
    console.log("🔹 Kata Sandi: password123\n");
}

main()
  .catch((e) => {
    console.error("Gagal menjalankan seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
