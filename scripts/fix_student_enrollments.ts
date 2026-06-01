import * as dotenv from 'dotenv';
import { Client } from 'pg';

// Load dari .env.local
dotenv.config({ path: '.env.local' });

async function fixEnrollments() {
  const URL = process.env.DATABASE_URL;
  if (!URL) {
    console.error("❌ DATABASE_URL tidak ditemukan di .env.local");
    process.exit(1);
  }

  const client = new Client({
    connectionString: URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("🚀 Menghubungkan ke Database...");
    await client.connect();
    console.log("✅ Terhubung!");

    // 1. Cari Tahun Ajaran Aktif
    const yearRes = await client.query('SELECT id, year FROM academic_years WHERE is_active = true AND deleted_at IS NULL LIMIT 1');
    if (yearRes.rows.length === 0) {
      console.error("❌ Tidak ada Tahun Ajaran Aktif ditemukan! Silakan aktifkan di Pengaturan.");
      return;
    }
    const { id: yearId, year: yearName } = yearRes.rows[0];
    console.log(`📅 Tahun Ajaran Aktif: ${yearName} (ID: ${yearId})`);

    // 2. Ambil semua siswa yang belum memiliki enrollment di tahun aktif tersebut
    // Kita filter siswa yang deleted_at is null
    const studentsRes = await client.query(`
      SELECT s.id, s.name, s.classroom_id 
      FROM students s
      LEFT JOIN student_enrollments e ON s.id = e.student_id AND e.academic_year_id = $1 AND e.deleted_at IS NULL
      WHERE s.deleted_at IS NULL AND e.id IS NULL
    `, [yearId]);

    const shadowStudents = studentsRes.rows;
    console.log(`🔍 Ditemukan ${shadowStudents.length} siswa yang belum terdaftar di tahun ajaran ini.`);

    if (shadowStudents.length === 0) {
      console.log("✅ Semua siswa sudah memiliki record pendaftaran. Selesai!");
      return;
    }

    console.log(`📝 Memulai pendaftaran otomatis untuk ${shadowStudents.length} siswa...`);

    let count = 0;
    for (const student of shadowStudents) {
      try {
        await client.query(`
          INSERT INTO student_enrollments (student_id, classroom_id, academic_year_id, enrollment_type, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW(), NOW())
        `, [student.id, student.classroom_id, yearId, 'umum']);
        
        count++;
        if (count % 10 === 0 || count === shadowStudents.length) {
           process.stdout.write(`⏳ Progress: ${count}/${shadowStudents.length} siswa terproses...\r`);
        }
      } catch (err: unknown) {
        console.error(`\n❌ Gagal mendaftarkan siswa ID ${student.id} (${student.name}): ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    console.log(`\n\n✨ Selesai! ${count} siswa berhasil didaftarkan ke Tahun Ajaran ${yearName}.`);
  } catch (err: unknown) {
    console.error("❌ Error Fatal:", err instanceof Error ? err.message : String(err));
  } finally {
    await client.end();
  }
}

fixEnrollments();
