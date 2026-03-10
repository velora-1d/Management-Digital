/**
 * Script migrasi: Bersihkan data infaq_bills sebelum apply unique constraint.
 * 
 * Langkah:
 * 1. Hapus semua tagihan yang soft-deleted (deleted_at IS NOT NULL)
 * 2. Hapus duplikat tagihan (simpan yang ID terkecil)
 * 3. Cek & buat enrollment untuk siswa aktif yang belum punya enrollment
 * 
 * Jalankan: node scripts/cleanup-infaq-bills.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 === CLEANUP INFAQ BILLS ===\n');

  // STEP 1: Hapus soft-deleted bills & payments
  console.log('📋 Step 1: Hapus data soft-deleted...');
  const delPayments = await prisma.$executeRawUnsafe(
    `DELETE FROM infaq_payments WHERE deleted_at IS NOT NULL`
  );
  console.log(`   → ${delPayments} payment soft-deleted dihapus`);
  
  const delBills = await prisma.$executeRawUnsafe(
    `DELETE FROM infaq_bills WHERE deleted_at IS NOT NULL`
  );
  console.log(`   → ${delBills} tagihan soft-deleted dihapus`);

  // STEP 2: Cek & hapus duplikat (simpan ID terkecil)
  console.log('\n📋 Step 2: Cek duplikat tagihan...');
  const dupes = await prisma.$queryRawUnsafe(`
    SELECT student_id, month, year, academic_year_id, COUNT(*) as cnt
    FROM infaq_bills 
    WHERE deleted_at IS NULL
    GROUP BY student_id, month, year, academic_year_id
    HAVING COUNT(*) > 1
  `);
  
  if (dupes.length > 0) {
    console.log(`   ⚠️ Ditemukan ${dupes.length} kombinasi duplikat!`);
    
    // Hapus duplikat - simpan yang ID terkecil
    const delDupes = await prisma.$executeRawUnsafe(`
      DELETE FROM infaq_bills a
      USING infaq_bills b
      WHERE a.id > b.id
        AND a.student_id = b.student_id
        AND a.month = b.month
        AND a.year = b.year
        AND COALESCE(a.academic_year_id, 0) = COALESCE(b.academic_year_id, 0)
        AND a.deleted_at IS NULL
        AND b.deleted_at IS NULL
    `);
    console.log(`   → ${delDupes} duplikat dihapus`);
  } else {
    console.log('   ✅ Tidak ada duplikat');
  }

  // STEP 3: Cek enrollment
  console.log('\n📋 Step 3: Cek enrollment siswa...');
  const activeStudents = await prisma.student.count({ where: { status: 'aktif', deletedAt: null } });
  const enrollments = await prisma.studentEnrollment.count({ where: { deletedAt: null } });
  const activeYear = await prisma.academicYear.findFirst({ 
    where: { isActive: true, deletedAt: null },
    select: { id: true, year: true }
  });
  
  console.log(`   Siswa aktif: ${activeStudents}`);
  console.log(`   Enrollment aktif: ${enrollments}`);
  console.log(`   Tahun ajaran aktif: ${activeYear ? activeYear.year + ' (ID: ' + activeYear.id + ')' : 'TIDAK ADA'}`);

  if (activeYear && enrollments === 0 && activeStudents > 0) {
    console.log('\n   ⚠️ Tidak ada enrollment! Membuat enrollment otomatis...');
    
    // Ambil semua siswa aktif yang punya classroomId
    const students = await prisma.student.findMany({
      where: { status: 'aktif', deletedAt: null, classroomId: { not: null } },
      select: { id: true, classroomId: true }
    });

    if (students.length > 0) {
      const enrollData = students.map(s => ({
        studentId: s.id,
        classroomId: s.classroomId,
        academicYearId: activeYear.id,
        enrollmentType: 'existing',
        notes: 'Auto-generated dari data siswa aktif',
      }));

      const result = await prisma.studentEnrollment.createMany({
        data: enrollData,
        skipDuplicates: true,
      });
      console.log(`   ✅ ${result.count} enrollment berhasil dibuat`);
    } else {
      console.log('   ⚠️ Tidak ada siswa aktif yang punya classroomId');
    }
  } else if (enrollments > 0) {
    console.log('   ✅ Enrollment sudah ada');
  }

  // STEP 4: Statistik akhir
  console.log('\n📊 === STATISTIK AKHIR ===');
  const finalBills = await prisma.infaqBill.count({ where: { deletedAt: null } });
  const finalEnroll = await prisma.studentEnrollment.count({ where: { deletedAt: null } });
  console.log(`   Tagihan aktif: ${finalBills}`);
  console.log(`   Enrollment aktif: ${finalEnroll}`);
  console.log(`   Siswa aktif: ${activeStudents}`);
  
  console.log('\n✅ Cleanup selesai! Sekarang jalankan: npx prisma db push');
}

main()
  .catch(e => console.error('❌ Error:', e.message))
  .finally(() => prisma.$disconnect());
