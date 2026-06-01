
import pg from 'pg';
const { Client } = pg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🚀 MEMULAI MASTER SEEDING NEON DB...');

    // 0. CLEANUP
    console.log('🧹 Membersihkan data lama...');
    await client.query('TRUNCATE users, academic_years, curriculums, classrooms, students, subjects, transaction_categories, cash_accounts RESTART IDENTITY CASCADE');

    // 1. SEED SUPERADMIN (Wajib STATUS = 'aktif')
    console.log('👤 Menciptakan Superadmin...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    await client.query(`
      INSERT INTO users (name, email, password, role, status) 
      VALUES ('Super Admin', 'admin@erp.com', $1, 'superadmin', 'aktif')
    `, [hashedPassword]);

    // 2. SEED ACADEMIC YEARS
    console.log('📅 Mengisi Tahun Ajaran...');
    const ayResult = await client.query(`
      INSERT INTO academic_years (year, is_active, start_date, end_date) 
      VALUES 
      ('2023/2024', false, '2023-07-01', '2024-06-30'),
      ('2024/2025', true, '2024-07-01', '2025-06-30')
      RETURNING id, year
    `);
    const activeAyId = ayResult.rows.find(r => r.year === '2024/2025').id;

    // 3. SEED CURRICULUMS
    console.log('📚 Mengisi Kurikulum...');
    await client.query(`
      INSERT INTO curriculums (type, academic_year_id, semester, is_locked, unit_id) 
      VALUES 
      ('KURMER', $1, 'ganjil', false, 'MA'),
      ('KURMER', $1, 'ganjil', false, 'MTS')
    `, [activeAyId]);

    // 4. SEED CLASSROOMS
    console.log('🏫 Mengisi Ruang Kelas...');
    await client.query(`
      INSERT INTO classrooms (name, level, academic_year_id, infaq_nominal) 
      VALUES 
      ('Kelas X-IPA', 10, $1, 150000),
      ('Kelas XI-IPA', 11, $1, 155000),
      ('Kelas 7-A', 7, $1, 100000)
    `, [activeAyId]);

    // 5. SEED SUBJECTS
    console.log('📖 Mengisi Mata Pelajaran...');
    await client.query(`
      INSERT INTO subjects (name, code, type, tingkat_kelas, status, unit_id) 
      VALUES 
      ('Matematika', 'MTK-01', 'wajib', 'Semua', 'aktif', 'MA'),
      ('IPA Terpadu', 'IPA-01', 'wajib', 'Semua', 'aktif', 'MTS')
    `);

    // 6. SEED TRANSACTION CATEGORIES
    console.log('💰 Mengisi Kategori Keuangan...');
    await client.query(`
      INSERT INTO transaction_categories (name, type, description, unit_id) 
      VALUES 
      ('Infaq Bulanan', 'in', 'Pembayaran SPP', 'MA'),
      ('Gaji Guru', 'out', 'Gaji rutin', 'MA')
    `);

    // 7. SEED CASH ACCOUNTS
    console.log('🏦 Mengisi Akun Kas...');
    await client.query(`
      INSERT INTO cash_accounts (name, bank_name, account_number, balance, status, unit_id) 
      VALUES 
      ('Kas Utama', 'Tunai', '-', 10000000, 'aktif', 'MA')
    `);

    console.log('\n✅ MASTER SEEDING + SUPERADMIN BERHASIL!');
    console.log('-----------------------------------');
    console.log('Data reset. Akun Superadmin: admin@erp.com / password123 (Status: aktif)');

  } catch (error) {
    console.error('❌ SEEDING GAGAL:', error);
  } finally {
    await client.end();
  }
}

seed();
