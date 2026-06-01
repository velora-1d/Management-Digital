import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set in environment variables.');
  }

  console.log('⏳ Menjalankan migrasi...');

  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
    max: 1 // Hanya butuh satu koneksi untuk migrasi
  });

  const db = drizzle(pool);

  try {
    // Mengeksekusi file SQL di folder ./drizzle
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Migrasi selesai dengan sukses!');
  } catch (error) {
    console.error('❌ Gagal menjalankan migrasi:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
