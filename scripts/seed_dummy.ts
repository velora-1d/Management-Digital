import { db } from "../src/db";
import { 
    academicYears, 
    classrooms, 
    employees, 
    students, 
    studentEnrollments, 
    ppdbRegistrations, 
    cashAccounts, 
    salaryComponents, 
    schoolSettings,
    subjects,
    teachingAssignments,
    schedules,
    attendances,
    extracurriculars,
    extracurricularMembers,
    calendarEvents,
    counselingRecords,
    curriculums,
    gradeComponents,
    kkms,
    studentGrades,
    finalGrades,
    gradeFormulas,
    reportCards,
    classTeacherNotes,
    employeeAttendances,
    letters,
    announcements,
    organizationPositions,
    products,
    coopTransactions,
    studentCredits,
    webHeroes,
    webPosts,
    webFacilities,
    webAchievements,
    webTeachers,
    webSettings,
    webPrograms,
    webStats,
    transactionCategories,
    infaqBills,
    infaqPayments,
    studentSavings,
    wakafDonors,
    wakafPurposes,
    generalTransactions,
    employeeSalaries,
    payrolls,
    payrollDetails,
    inventories,
    inventoryLogs,
    reRegistrations,
    registrationPayments
} from "../src/db/schema";
import { eq, and, isNull } from "drizzle-orm";

async function main() {
  console.log("=== MEMULAI PROSES SEEDING DATA DUMMY ===");

  try {
    // 1. Ambil atau Buat Tahun Ajaran Aktif
    console.log("1. Mengambil atau membuat Tahun Ajaran...");
    let ay = await db.query.academicYears.findFirst({
      where: eq(academicYears.isActive, true)
    });
    if (!ay) {
      const [created] = await db.insert(academicYears).values({
        year: "2025/2026",
        isActive: true,
        startDate: "2025-07-14",
        endDate: "2026-06-20"
      }).returning();
      ay = created;
    }
    const ayId = ay.id;
    console.log(`Tahun Ajaran Aktif: ${ay.year} (ID: ${ayId})`);

    // 2. Ambil atau Buat Kelas 1-6
    console.log("2. Mengambil atau membuat Kelas...");
    const kelasNames = ["Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5", "Kelas 6"];
    for (const name of kelasNames) {
      const exists = await db.query.classrooms.findFirst({
        where: and(eq(classrooms.name, name), isNull(classrooms.deletedAt))
      });
      if (!exists) {
        await db.insert(classrooms).values({ name, academicYearId: ayId });
      }
    }
    const classroomsList = await db.select().from(classrooms).where(isNull(classrooms.deletedAt));
    console.log(`Ditemukan ${classroomsList.length} kelas.`);

    // 3. Ambil atau Buat Pegawai (Guru & Staf)
    console.log("3. Mengambil atau membuat Pegawai...");
    const guruData = [
      { name: "Ustadzah Fatimah", position: "Wali Kelas 1" },
      { name: "Ustadz Ahmad", position: "Wali Kelas 2" },
      { name: "Ustadzah Khadijah", position: "Wali Kelas 3" },
      { name: "Ustadz Bilal", position: "Wali Kelas 4" },
      { name: "Ustadzah Aisyah", position: "Wali Kelas 5" },
      { name: "Ustadz Umar", position: "Wali Kelas 6" },
      { name: "Ustadz Hamzah", position: "Guru Al-Quran" },
      { name: "Ustadzah Ruqayyah", position: "Guru Fiqih" },
    ];
    for (let i = 0; i < guruData.length; i++) {
      const exists = await db.query.employees.findFirst({
        where: and(eq(employees.name, guruData[i].name), isNull(employees.deletedAt))
      });
      if (!exists) {
        await db.insert(employees).values({
          name: guruData[i].name,
          nip: `G${String(i + 1).padStart(3, "0")}`,
          type: "guru",
          position: guruData[i].position,
          status: "aktif",
          phone: `08110000${i}`,
          baseSalary: 2500000 + (i * 100000)
        });
      }
    }

    const stafData = [
      { name: "Pak Ridwan", position: "Kepala TU" },
      { name: "Bu Sri", position: "Bendahara" },
      { name: "Pak Joko", position: "Penjaga Sekolah" },
    ];
    for (let i = 0; i < stafData.length; i++) {
      const exists = await db.query.employees.findFirst({
        where: and(eq(employees.name, stafData[i].name), isNull(employees.deletedAt))
      });
      if (!exists) {
        await db.insert(employees).values({
          name: stafData[i].name,
          nip: `S${String(i + 1).padStart(3, "0")}`,
          type: "staf",
          position: stafData[i].position,
          status: "aktif",
          phone: `08220000${i}`,
          baseSalary: 2000000 + (i * 50000)
        });
      }
    }
    const employeesList = await db.select().from(employees).where(isNull(employees.deletedAt));
    const teachers = employeesList.filter(e => e.type === "guru");
    console.log(`Ditemukan ${employeesList.length} pegawai (${teachers.length} guru).`);

    // 4. Ambil Siswa yang Ada (TIDAK MEMBUAT SISWA BARU)
    console.log("4. Memuat data siswa yang ada...");
    const studentsList = await db.select().from(students).where(isNull(students.deletedAt));
    console.log(`Ditemukan ${studentsList.length} siswa di database.`);

    if (studentsList.length === 0) {
      console.warn("⚠️ PERINGATAN: Tidak ada siswa ditemukan di database. Beberapa data dummy transaksional & akademik tidak akan maksimal terbuat.");
    }

    // 5. Mata Pelajaran (Subjects)
    console.log("5. Mengisi data Mata Pelajaran (Subjects)...");
    const subjectsData = [
      { name: "Al-Quran Hadits", code: "AQH", type: "wajib", tingkatKelas: "Semua" },
      { name: "Fiqih", code: "FIQ", type: "wajib", tingkatKelas: "Semua" },
      { name: "Bahasa Arab", code: "BAR", type: "wajib", tingkatKelas: "Semua" },
      { name: "Matematika", code: "MTK", type: "wajib", tingkatKelas: "Semua" },
      { name: "IPA", code: "IPA", type: "wajib", tingkatKelas: "Semua" },
      { name: "Bahasa Indonesia", code: "BIN", type: "wajib", tingkatKelas: "Semua" }
    ];
    for (const sub of subjectsData) {
      const exists = await db.query.subjects.findFirst({
        where: and(eq(subjects.code, sub.code), isNull(subjects.deletedAt))
      });
      if (!exists) {
        await db.insert(subjects).values({
          name: sub.name,
          code: sub.code,
          type: sub.type,
          tingkatKelas: sub.tingkatKelas,
          status: "aktif"
        });
      }
    }
    const subjectsList = await db.select().from(subjects).where(isNull(subjects.deletedAt));
    console.log(`Mata Pelajaran siap.`);

    // 6. Penugasan Guru (Teaching Assignments)
    console.log("6. Membuat Penugasan Guru...");
    for (let i = 0; i < classroomsList.length; i++) {
      const classId = classroomsList[i].id;
      const tIndex = i % teachers.length;
      const teacher = teachers[tIndex];
      const sub = subjectsList[i % subjectsList.length];

      const exists = await db.query.teachingAssignments.findFirst({
        where: and(
          eq(teachingAssignments.employeeId, teacher.id),
          eq(teachingAssignments.subjectId, sub.id),
          eq(teachingAssignments.classroomId, classId),
          eq(teachingAssignments.academicYearId, ayId)
        )
      });
      if (!exists) {
        await db.insert(teachingAssignments).values({
          employeeId: teacher.id,
          subjectId: sub.id,
          classroomId: classId,
          academicYearId: ayId
        });
      }
    }
    const teachingAssignmentsList = await db.select().from(teachingAssignments);
    console.log(`Dibuat ${teachingAssignmentsList.length} penugasan guru.`);

    // 7. Jadwal Pelajaran (Schedules)
    console.log("7. Membuat Jadwal Pelajaran...");
    const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
    for (const assign of teachingAssignmentsList) {
      if (!assign.classroomId || !assign.subjectId || !assign.employeeId) continue;
      const day = days[assign.id % days.length];
      const exists = await db.query.schedules.findFirst({
        where: and(
          eq(schedules.classroomId, assign.classroomId),
          eq(schedules.subjectId, assign.subjectId),
          eq(schedules.academicYearId, ayId),
          eq(schedules.day, day)
        )
      });
      if (!exists) {
        await db.insert(schedules).values({
          classroomId: assign.classroomId,
          subjectId: assign.subjectId,
          employeeId: assign.employeeId,
          academicYearId: ayId,
          day,
          startTime: "07:30",
          endTime: "09:00"
        });
      }
    }
    console.log(`Jadwal Pelajaran terbuat.`);

    // 8. Kehadiran Siswa (Attendances)
    if (studentsList.length > 0) {
      console.log("8. Membuat data Kehadiran Siswa (terakhir 5 hari)...");
      const dates = ["2026-05-25", "2026-05-26", "2026-05-27", "2026-05-28", "2026-05-29"];
      const statusOptions = ["hadir", "hadir", "hadir", "hadir", "hadir", "izin", "sakit", "alfa"];
      
      // Ambil 10 siswa saja biar cepat dan aman dari timeout
      const sampledStudents = studentsList.slice(0, 10);
      for (const date of dates) {
        for (const student of sampledStudents) {
          const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
          const exists = await db.query.attendances.findFirst({
            where: and(eq(attendances.studentId, student.id), eq(attendances.date, date))
          });
          if (!exists) {
            await db.insert(attendances).values({
              studentId: student.id,
              date,
              status,
              note: status !== "hadir" ? "Catatan kehadiran dummy" : ""
            });
          }
        }
      }
      console.log(`Kehadiran siswa terbuat.`);
    }

    // 9. Ekstrakurikuler (Extracurriculars & Members)
    console.log("9. Membuat data Ekstrakurikuler...");
    const escList = ["Pramuka", "Futsal", "Paskibra", "Seni Tari"];
    for (let i = 0; i < escList.length; i++) {
      const coach = teachers[i % teachers.length];
      let esc = await db.query.extracurriculars.findFirst({
        where: and(eq(extracurriculars.name, escList[i]), isNull(extracurriculars.deletedAt))
      });
      if (!esc) {
        const [created] = await db.insert(extracurriculars).values({
          name: escList[i],
          employeeId: coach.id,
          schedule: "Sabtu, 08:00 - 10:00",
          status: "aktif"
        }).returning();
        esc = created;
      }

      // Add members
      if (studentsList.length > 0 && esc) {
        const sampled = studentsList.slice(i * 3, (i * 3) + 3);
        for (const student of sampled) {
          const exists = await db.query.extracurricularMembers.findFirst({
            where: and(
              eq(extracurricularMembers.extracurricularId, esc.id),
              eq(extracurricularMembers.studentId, student.id)
            )
          });
          if (!exists) {
            await db.insert(extracurricularMembers).values({
              extracurricularId: esc.id,
              studentId: student.id,
              joinDate: "2025-07-20"
            });
          }
        }
      }
    }
    console.log(`Ekstrakurikuler terbuat.`);

    // 10. Agenda Kegiatan (Calendar Events)
    console.log("10. Membuat Agenda Sekolah...");
    const events = [
      { title: "Upacara Hari Lahir Pancasila", dateStart: "2026-06-01", dateEnd: "2026-06-01", type: "event" },
      { title: "Penilaian Akhir Semester Genap", dateStart: "2026-06-08", dateEnd: "2026-06-12", type: "exam" },
      { title: "Libur Kenaikan Kelas", dateStart: "2026-06-22", dateEnd: "2026-07-10", type: "holiday" }
    ];
    for (const ev of events) {
      const exists = await db.query.calendarEvents.findFirst({
        where: eq(calendarEvents.title, ev.title)
      });
      if (!exists) {
        await db.insert(calendarEvents).values(ev);
      }
    }
    console.log(`Agenda sekolah terbuat.`);

    // 11. Bimbingan Konseling (Counseling Records)
    if (studentsList.length > 0) {
      console.log("11. Membuat data Bimbingan Konseling...");
      const categories = ["prestasi", "pelanggaran", "konseling"];
      const descriptions = [
        "Juara 1 Lomba Adzan Tingkat Kecamatan",
        "Terlambat masuk sekolah lebih dari 15 menit",
        "Konseling motivasi belajar siswa"
      ];
      for (let i = 0; i < Math.min(studentsList.length, 5); i++) {
        const student = studentsList[i];
        const category = categories[i % categories.length];
        const desc = descriptions[i % descriptions.length];
        await db.insert(counselingRecords).values({
          studentId: student.id,
          counselorId: teachers[0].id,
          date: "2026-05-28",
          category,
          description: desc,
          followUp: "Diberikan arahan dan pembinaan"
        });
      }
      console.log(`Bimbingan konseling terbuat.`);
    }

    // 12. Kurikulum Akademik (Curriculums & KKMs & Formulas)
    console.log("12. Membuat Kurikulum & KKM...");
    let curr = await db.query.curriculums.findFirst({
      where: eq(curriculums.academicYearId, ayId)
    });
    if (!curr) {
      const [created] = await db.insert(curriculums).values({
        type: "KURMER",
        academicYearId: ayId,
        semester: "ganjil",
        isLocked: false
      }).returning();
      curr = created;
    }

    if (curr) {
      // Formula
      const formulaExists = await db.query.gradeFormulas.findFirst({
        where: eq(gradeFormulas.curriculumId, curr.id)
      });
      if (!formulaExists) {
        await db.insert(gradeFormulas).values({
          curriculumId: curr.id,
          formula: JSON.stringify({ tugas: 0.2, uh: 0.3, uts: 0.25, uas: 0.25 })
        });
      }

      // KKM untuk setiap Mapel
      for (const sub of subjectsList) {
        const exists = await db.query.kkms.findFirst({
          where: and(eq(kkms.curriculumId, curr.id), eq(kkms.subjectId, sub.id))
        });
        if (!exists) {
          await db.insert(kkms).values({
            curriculumId: curr.id,
            subjectId: sub.id,
            nilaiKKM: 75,
            deskripsiKKTP: "Kriteria Ketercapaian Tujuan Pembelajaran standar"
          });
        }
      }
    }
    console.log(`Kurikulum & KKM terbuat.`);

    // 13. Komponen Nilai & Nilai Dummy Siswa (Grades)
    if (studentsList.length > 0 && curr) {
      console.log("13. Membuat Komponen Nilai & Nilai Siswa...");
      const compNames = ["Tugas 1", "Ulangan Harian 1", "Ujian Tengah Semester", "Ujian Akhir Semester"];
      const sub = subjectsList[0];
      const classId = classroomsList[0].id;

      for (const name of compNames) {
        let comp = await db.query.gradeComponents.findFirst({
          where: and(
            eq(gradeComponents.name, name),
            eq(gradeComponents.curriculumId, curr.id)
          )
        });
        if (!comp) {
          const [created] = await db.insert(gradeComponents).values({
            curriculumId: curr.id,
            name,
            code: name.substring(0, 3).toUpperCase(),
            type: "pengetahuan",
            formatNilai: "angka",
            bobot: name.includes("Tugas") ? 20 : name.includes("Ulangan") ? 30 : 25,
            urutan: 1,
            isWajib: true
          }).returning();
          comp = created;
        }

        // Input Nilai untuk 5 siswa di kelas tersebut
        if (comp) {
          const classStudents = studentsList.filter(s => s.classroomId === classId).slice(0, 5);
          for (const student of classStudents) {
            const exists = await db.query.studentGrades.findFirst({
              where: and(
                eq(studentGrades.studentId, student.id),
                eq(studentGrades.componentId, comp.id),
                eq(studentGrades.subjectId, sub.id)
              )
            });
            if (!exists) {
              await db.insert(studentGrades).values({
                studentId: student.id,
                componentId: comp.id,
                subjectId: sub.id,
                classroomId: classId,
                nilaiAngka: 75 + Math.floor(Math.random() * 20),
                predikat: "B"
              });
            }
          }
        }
      }
      console.log(`Nilai Akademik dummy terbuat.`);
    }

    // 14. Presensi Pegawai (Employee Attendances)
    console.log("14. Membuat data Presensi Pegawai...");
    const dates = ["2026-05-25", "2026-05-26", "2026-05-27", "2026-05-28", "2026-05-29"];
    for (const date of dates) {
      for (const employee of employeesList.slice(0, 5)) {
        const exists = await db.query.employeeAttendances.findFirst({
          where: and(eq(employeeAttendances.employeeId, employee.id), eq(employeeAttendances.date, date))
        });
        if (!exists) {
          await db.insert(employeeAttendances).values({
            employeeId: employee.id,
            date,
            status: "hadir",
            note: ""
          });
        }
      }
    }
    console.log(`Presensi Pegawai terbuat.`);

    // 15. Persuratan & Pengumuman (Letters & Announcements)
    console.log("15. Membuat data Persuratan & Pengumuman...");
    const letterExists = await db.query.letters.findFirst({
      where: eq(letters.number, "001/VEL/VI/2026")
    });
    if (!letterExists) {
      await db.insert(letters).values({
        type: "masuk",
        number: "001/VEL/VI/2026",
        subject: "Surat Undangan Dinas Pendidikan",
        sender: "Dinas Pendidikan Kota",
        receiver: "Kepala Sekolah",
        date: "2026-06-01",
        status: "belum_disposisi"
      });
    }

    const annExists = await db.query.announcements.findFirst({
      where: eq(announcements.title, "Pengumuman Kelulusan & Rapor")
    });
    if (!annExists) {
      await db.insert(announcements).values({
        title: "Pengumuman Kelulusan & Rapor",
        content: "Diberitahukan kepada seluruh wali murid bahwa pembagian rapor semester genap akan dilaksanakan pada tanggal 19 Juni 2026.",
        target: "all",
        status: "published"
      });
    }
    console.log(`Surat & pengumuman terbuat.`);

    // 16. Koperasi Sekolah (Products & Coop Transactions)
    console.log("16. Koperasi Sekolah...");
    const productsData = [
      { name: "Buku Tulis A5", category: "Alat Tulis", hargaJual: 5000, hargaBeli: 4000, stok: 100, minStok: 5 },
      { name: "Pensil 2B", category: "Alat Tulis", hargaJual: 3000, hargaBeli: 2000, stok: 150, minStok: 10 },
      { name: "Seragam Batik Velora", category: "Pakaian", hargaJual: 85000, hargaBeli: 70000, stok: 30, minStok: 2 }
    ];
    for (const prod of productsData) {
      const exists = await db.query.products.findFirst({
        where: and(eq(products.name, prod.name), isNull(products.deletedAt))
      });
      if (!exists) {
        await db.insert(products).values(prod);
      }
    }
    const productsList = await db.select().from(products).where(isNull(products.deletedAt));

    if (studentsList.length > 0 && productsList.length > 0) {
      const coopTransExists = await db.select().from(coopTransactions).limit(1);
      if (coopTransExists.length === 0) {
        await db.insert(coopTransactions).values({
          studentId: studentsList[0].id,
          items: JSON.stringify([{ productId: productsList[0].id, name: productsList[0].name, quantity: 3, price: productsList[0].hargaJual }]),
          total: 15000,
          paymentMethod: "tunai",
          date: "2026-05-20",
          status: "valid"
        });
      }
    }
    console.log(`Koperasi terbuat.`);

    // 17. Rekening Kas & Kategori Transaksi Keuangan
    console.log("17. Keuangan (Kas & Kategori)...");
    const cashList = [
      { name: "Kas Utama", balance: 10000000 },
      { name: "Bank BSI", balance: 25000000 }
    ];
    for (const c of cashList) {
      const exists = await db.query.cashAccounts.findFirst({
        where: and(eq(cashAccounts.name, c.name), isNull(cashAccounts.deletedAt))
      });
      if (!exists) {
        await db.insert(cashAccounts).values(c);
      }
    }
    const cashListDB = await db.select().from(cashAccounts).where(isNull(cashAccounts.deletedAt));

    const cats = [
      { name: "Pembayaran Infaq/SPP", type: "income" },
      { name: "Penerimaan Wakaf", type: "income" },
      { name: "Gaji & Honor Pegawai", type: "expense" },
      { name: "Listrik & Internet", type: "expense" },
      { name: "Pembelian Sarpras", type: "expense" }
    ];
    for (const cat of cats) {
      const exists = await db.query.transactionCategories.findFirst({
        where: and(eq(transactionCategories.name, cat.name), isNull(transactionCategories.deletedAt))
      });
      if (!exists) {
        await db.insert(transactionCategories).values(cat);
      }
    }
    const catListDB = await db.select().from(transactionCategories).where(isNull(transactionCategories.deletedAt));

    // 18. Tagihan & Pembayaran Infaq (Infaq Bills & Payments)
    if (studentsList.length > 0 && cashListDB.length > 0) {
      console.log("18. Infaq & SPP Keuangan...");
      const months = ["Januari", "Februari", "Maret"];
      const billsInserted = [];

      for (const student of studentsList.slice(0, 10)) {
        for (const month of months) {
          const exists = await db.query.infaqBills.findFirst({
            where: and(
              eq(infaqBills.studentId, student.id),
              eq(infaqBills.month, month),
              eq(infaqBills.year, "2026"),
              eq(infaqBills.academicYearId, ayId),
              isNull(infaqBills.deletedAt)
            )
          });
          if (!exists) {
            const [created] = await db.insert(infaqBills).values({
              studentId: student.id,
              academicYearId: ayId,
              month,
              year: "2026",
              nominal: student.infaqNominal || 150000,
              status: month === "Januari" ? "lunas" : "belum_lunas"
            }).returning();
            if (created) billsInserted.push(created);
          }
        }
      }

      // Bayar tagihan yang statusnya lunas
      const lunasBills = await db.select().from(infaqBills).where(eq(infaqBills.status, "lunas"));
      for (const bill of lunasBills) {
        const payExists = await db.query.infaqPayments.findFirst({
          where: and(eq(infaqPayments.billId, bill.id), isNull(infaqPayments.deletedAt))
        });
        if (!payExists) {
          await db.insert(infaqPayments).values({
            billId: bill.id,
            cashAccountId: cashListDB[0].id,
            paymentMethod: "tunai",
            amountPaid: bill.nominal,
            paymentDate: "2026-01-10",
            notes: "Pembayaran infaq otomatis"
          });
        }
      }
      console.log(`Infaq & SPP Keuangan terbuat.`);
    }

    // 19. Tabungan Siswa (Student Savings)
    if (studentsList.length > 0) {
      console.log("19. Tabungan Siswa...");
      for (let i = 0; i < Math.min(studentsList.length, 5); i++) {
        const student = studentsList[i];
        const exists = await db.query.studentSavings.findFirst({
          where: and(eq(studentSavings.studentId, student.id), isNull(studentSavings.deletedAt))
        });
        if (!exists) {
          await db.insert(studentSavings).values({
            studentId: student.id,
            type: "deposit",
            amount: 100000,
            balanceAfter: 100000,
            date: "2026-05-20",
            description: "Setoran awal tabungan"
          });
        }
      }
      console.log(`Tabungan terbuat.`);
    }

    // 20. Wakaf (Wakaf Donors & Purposes)
    console.log("20. Wakaf...");
    const donorExists = await db.query.wakafDonors.findFirst({
      where: eq(wakafDonors.name, "H. Hamba Allah")
    });
    let donorId;
    if (!donorExists) {
      const [created] = await db.insert(wakafDonors).values({
        name: "H. Hamba Allah",
        phone: "081299998888",
        address: "Jl. Kebajikan Raya No. 9"
      }).returning();
      donorId = created.id;
    } else {
      donorId = donorExists.id;
    }

    const purposeExists = await db.query.wakafPurposes.findFirst({
      where: eq(wakafPurposes.name, "Wakaf Pembangunan Lab Komputer")
    });
    if (!purposeExists) {
      await db.insert(wakafPurposes).values({
        name: "Wakaf Pembangunan Lab Komputer",
        description: "Wakaf sarpras untuk pengadaan komputer di lab sekolah",
        targetAmount: 50000000,
        collectedAmount: 10000000,
        spentAmount: 0
      });
    }
    console.log(`Wakaf terbuat.`);

    // 21. Transaksi Umum Keuangan (General Transactions)
    if (cashListDB.length > 0 && catListDB.length > 0) {
      console.log("21. Transaksi Umum Keuangan...");
      const expCat = catListDB.find(c => c.name === "Listrik & Internet");
      const transExists = await db.select().from(generalTransactions).limit(1);
      if (transExists.length === 0 && expCat) {
        await db.insert(generalTransactions).values({
          type: "out",
          transactionCategoryId: expCat.id,
          cashAccountId: cashListDB[0].id,
          amount: 450000,
          description: "Pembayaran tagihan listrik sekolah bulan Mei",
          transactionDate: "2026-05-30"
        });
      }
      console.log(`Transaksi Umum terbuat.`);
    }

    // 22. Penggajian / Payroll Pegawai (Payrolls & Details)
    if (employeesList.length > 0) {
      console.log("22. Penggajian / Payroll...");
      const compEarning = await db.query.salaryComponents.findFirst({
        where: and(eq(salaryComponents.name, "Tunjangan Transport"), isNull(salaryComponents.deletedAt))
      });

      for (const employee of employeesList.slice(0, 5)) {
        const pExists = await db.query.payrolls.findFirst({
          where: and(
            eq(payrolls.employeeId, employee.id),
            eq(payrolls.month, "Mei"),
            eq(payrolls.year, "2026"),
            isNull(payrolls.deletedAt)
          )
        });
        if (!pExists) {
          const base = employee.baseSalary || 2000000;
          const allowance = compEarning?.defaultAmount || 300000;
          const [created] = await db.insert(payrolls).values({
            employeeId: employee.id,
            month: "Mei",
            year: "2026",
            baseSalary: base,
            totalAllowance: allowance,
            totalDeduction: 0,
            netSalary: base + allowance,
            status: "draft"
          }).returning();

          if (created && compEarning) {
            await db.insert(payrollDetails).values({
              payrollId: created.id,
              componentId: compEarning.id,
              componentName: compEarning.name,
              type: compEarning.type,
              amount: allowance
            });
          }
        }
      }
      console.log(`Payroll terbuat.`);
    }

    // 23. Sarana & Prasarana / Inventaris (Inventories & Logs)
    console.log("23. Inventaris / Sarpras...");
    const invExists = await db.query.inventories.findFirst({
      where: eq(inventories.name, "Proyektor Epson EB-X400")
    });
    if (!invExists) {
      const [created] = await db.insert(inventories).values({
        name: "Proyektor Epson EB-X400",
        code: "INV-PRJ-001",
        category: "Elektronik",
        location: "Ruang Kelas 4",
        quantity: 1,
        condition: "baik",
        acquisitionDate: "2026-01-15",
        acquisitionCost: 5500000
      }).returning();

      if (created) {
        await db.insert(inventoryLogs).values({
          inventoryId: created.id,
          type: "addition",
          quantityChange: 1,
          description: "Inventarisasi baru hasil pengadaan",
          loggedBy: "Admin"
        });
      }
    }
    console.log(`Sarpras/Inventaris terbuat.`);

    // 24. CMS Website (webHeroes, webPosts, webFacilities, etc.)
    console.log("24. Mengisi CMS Website...");
    const heroExists = await db.query.webHeroes.findFirst({
      where: eq(webHeroes.title, "Membangun Generasi Rabbani")
    });
    if (!heroExists) {
      await db.insert(webHeroes).values({
        title: "Membangun Generasi Rabbani",
        subtitle: "Pendidikan Berkarakter Islami dan Unggul dalam Teknologi di Velora School",
        mediaType: "image",
        mediaUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d",
        ctaText: "Daftar Sekarang",
        ctaUrl: "/ppdb",
        order: 1,
        status: "aktif"
      });
    }

    const postExists = await db.query.webPosts.findFirst({
      where: eq(webPosts.title, "Velora School Meraih Juara Umum Lomba Keagamaan")
    });
    if (!postExists) {
      await db.insert(webPosts).values({
        title: "Velora School Meraih Juara Umum Lomba Keagamaan",
        slug: "velora-school-juara-umum-2026",
        excerpt: "Siswa-siswi Velora School kembali menorehkan prestasi membanggakan tingkat nasional.",
        content: "<p>Kami sangat bersyukur atas keberhasilan yang diraih tim sekolah kami dalam ajang keagamaan tahun ini...</p>",
        thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
        category: "berita",
        status: "published"
      });
    }

    const facExists = await db.query.webFacilities.findFirst({
      where: eq(webFacilities.name, "Perpustakaan Digital")
    });
    if (!facExists) {
      await db.insert(webFacilities).values({
        name: "Perpustakaan Digital",
        description: "Akses ribuan buku digital, jurnal, dan modul pembelajaran interaktif.",
        iconSvg: "BookOpen",
        order: 2
      });
    }

    const achExists = await db.query.webAchievements.findFirst({
      where: eq(webAchievements.title, "Juara 1 Olimpiade Matematika")
    });
    if (!achExists) {
      await db.insert(webAchievements).values({
        title: "Juara 1 Olimpiade Matematika",
        studentName: "Muhammad Ali (Kelas 6)",
        competitionName: "Olimpiade Sains Nasional SD/MI",
        level: "nasional",
        year: 2026,
        imageUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d"
      });
    }

    const progExists = await db.query.webPrograms.findFirst({
      where: eq(webPrograms.title, "Program Kelas Tahfidz")
    });
    if (!progExists) {
      await db.insert(webPrograms).values({
        title: "Program Kelas Tahfidz",
        description: "Program khusus hafalan Al-Quran dengan target 3 Juz hingga kelulusan.",
        iconName: "BookOpen",
        color: "from-emerald-500 to-teal-600",
        order: 1,
        status: "aktif"
      });
    }

    const statExists = await db.query.webStats.findFirst({
      where: eq(webStats.label, "Hafizh Al-Quran")
    });
    if (!statExists) {
      await db.insert(webStats).values({
        label: "Hafizh Al-Quran",
        value: 45,
        suffix: "+",
        iconName: "Award",
        order: 3,
        status: "aktif"
      });
    }

    const tchrExists = await db.query.webTeachers.findFirst({
      where: eq(webTeachers.name, "Ustadz Ahmad, S.Pd.I")
    });
    if (!tchrExists) {
      await db.insert(webTeachers).values({
        name: "Ustadz Ahmad, S.Pd.I",
        position: "Kepala Sekolah",
        photoUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d",
        order: 1,
        status: "aktif"
      });
    }
    console.log(`CMS Website terbuat.`);

    // PPDB registrations
    console.log("25. PPDB Registrations...");
    const ppdbNames = ["Rian Hidayat", "Salma Aulia", "Riza Fahri"];
    for (let i = 0; i < ppdbNames.length; i++) {
      const exists = await db.query.ppdbRegistrations.findFirst({
        where: and(eq(ppdbRegistrations.name, ppdbNames[i]), isNull(ppdbRegistrations.deletedAt))
      });
      if (!exists) {
        await db.insert(ppdbRegistrations).values({
          formNo: `PPDB-2026-${String(i + 1).padStart(3, "0")}`,
          name: ppdbNames[i],
          gender: i % 2 === 0 ? "P" : "L",
          birthPlace: "Bandung",
          birthDate: "2019-05-10",
          phone: `08123456780${i}`,
          address: `Jl. Melati No. ${i + 1}`,
          status: "pending",
          registrationSource: "offline"
        });
      }
    }
    console.log("PPDB registrations terbuat.");

    // Student credits
    if (studentsList.length > 0) {
      console.log("26. Student Credits...");
      const exists = await db.query.studentCredits.findFirst({
        where: eq(studentCredits.studentId, studentsList[0].id)
      });
      if (!exists) {
        await db.insert(studentCredits).values({
          studentId: studentsList[0].id,
          amount: 50000,
          paidAmount: 0,
          status: "belum_lunas",
          dueDate: "2026-06-30"
        });
      }
      console.log("Student credits terbuat.");
    }

    // 27. Re-registrations (Daftar Ulang) & Registration Payments
    console.log("27. Re-registrations (Daftar Ulang)...");
    for (let i = 0; i < Math.min(studentsList.length, 5); i++) {
      const student = studentsList[i];
      const exists = await db.query.reRegistrations.findFirst({
        where: and(eq(reRegistrations.studentId, student.id), eq(reRegistrations.academicYearId, ayId))
      });
      if (!exists) {
        const [reReg] = await db.insert(reRegistrations).values({
          studentId: student.id,
          academicYearId: ayId,
          status: i === 0 ? "pending" : "confirmed",
          registrationSource: "offline",
          notes: "Dummy re-registration notes"
        }).returning();

        if (reReg) {
          await db.insert(registrationPayments).values({
            payableType: "re_registration",
            payableId: reReg.id,
            paymentType: "daftar_ulang",
            nominal: 500000,
            isPaid: i !== 0,
            notes: "Pembayaran daftar ulang dummy"
          });
        }
      }
    }
    console.log("Re-registrations & payments terbuat.");

    // 28. Report Cards & Teacher Notes
    console.log("28. Report Cards & Teacher Notes...");
    if (studentsList.length > 0 && curr) {
      for (let i = 0; i < Math.min(studentsList.length, 5); i++) {
        const student = studentsList[i];
        const exists = await db.query.reportCards.findFirst({
          where: and(
            eq(reportCards.studentId, student.id),
            eq(reportCards.curriculumId, curr.id),
            eq(reportCards.semester, "ganjil")
          )
        });
        if (!exists) {
          await db.insert(reportCards).values({
            studentId: student.id,
            classroomId: student.classroomId || classroomsList[0].id,
            curriculumId: curr.id,
            semester: "ganjil",
            status: "PUBLISHED",
            catatanWali: "Ananda memiliki perkembangan belajar yang sangat baik."
          });
        }

        const noteExists = await db.query.classTeacherNotes.findFirst({
          where: and(
            eq(classTeacherNotes.studentId, student.id),
            eq(classTeacherNotes.classroomId, student.classroomId || classroomsList[0].id),
            eq(classTeacherNotes.semester, "ganjil")
          )
        });
        if (!noteExists) {
          await db.insert(classTeacherNotes).values({
            studentId: student.id,
            classroomId: student.classroomId || classroomsList[0].id,
            semester: "ganjil",
            note: "Terus tingkatkan prestasi belajar Anda di kelas."
          });
        }
      }
    }
    console.log("Report cards & teacher notes terbuat.");

    // 29. Final Grades
    console.log("29. Final Grades...");
    if (studentsList.length > 0 && curr) {
      const sub = subjectsList[0];
      const classId = classroomsList[0].id;
      const classStudents = studentsList.filter(s => s.classroomId === classId).slice(0, 5);
      for (const student of classStudents) {
        const exists = await db.query.finalGrades.findFirst({
          where: and(
            eq(finalGrades.curriculumId, curr.id),
            eq(finalGrades.studentId, student.id),
            eq(finalGrades.subjectId, sub.id)
          )
        });
        if (!exists) {
          await db.insert(finalGrades).values({
            curriculumId: curr.id,
            studentId: student.id,
            subjectId: sub.id,
            classroomId: classId,
            nilaiPengetahuan: 85,
            nilaiKeterampilan: 85,
            nilaiAkhir: 85,
            predikat: "A",
            deskripsi: "Sangat baik"
          });
        }
      }
    }
    console.log("Final grades terbuat.");

    console.log("\n=== SEED DATA DUMMY SELESAI DENGAN SUKSES! ===");
  } catch (error) {
    console.error("Gagal melakukan seeding:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
