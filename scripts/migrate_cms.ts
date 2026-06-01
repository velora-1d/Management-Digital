import * as dotenv from 'dotenv';
import * as fs from 'fs';
import path from 'path';
import { Client } from 'pg';

// Load from .env.local
dotenv.config({ path: '.env.local' });

async function migrate() {
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

    const migrationPath = path.resolve(process.cwd(), './drizzle/0001_add_cms_tables.sql');
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ File migrasi tidak ditemukan: ${migrationPath}`);
      return;
    }

    const sqlContent = fs.readFileSync(migrationPath, 'utf8');
    const statements = sqlContent
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(Boolean);

    console.log(`📝 Ditemukan ${statements.length} instruksi. Memulai eksekusi...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      process.stdout.write(`⏳ Progress: ${i+1}/${statements.length}... `);
      
      try {
        await client.query(statement);
        console.log("✅ OK");
      } catch (err: any) {
        if (err.message.includes("already exists")) {
          console.log("⏩ SKIP (Sudah ada)");
        } else {
          console.log(`❌ ERROR: ${err.message}`);
        }
      }
    }

    console.log("\n✨ Migrasi CMS Selesai!");
  } catch (err: any) {
    console.error("❌ Gagal menghubungkan ke database:", err.message);
  } finally {
    await client.end();
  }
}

migrate();
