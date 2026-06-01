
import pg from 'pg';
const { Client } = pg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function debugDB() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔍 MENGAMBIL DATA USER DARI DATABASE (COLS: deleted_at, status)...');
    
    // Gunakan nama kolom asli PostgreSQL
    const res = await client.query("SELECT id, name, email, password, role, status, deleted_at, unit_id FROM users WHERE email = 'admin@erp.com'");
    
    if (res.rows.length === 0) {
      console.log('❌ USER TIDAK DITEMUKAN!');
    } else {
      console.log('✅ USER DITEMUKAN:');
      console.table(res.rows);
      
      const user = res.rows[0];
      console.log('Password Hash in DB:', user.password);
      console.log('Status in DB:', user.status);
      console.log('Deleted At in DB:', user.deleted_at);
    }

  } catch (error) {
    console.error('❌ ERROR GAGAL QUERY:', error.message);
  } finally {
    await client.end();
  }
}

debugDB();
