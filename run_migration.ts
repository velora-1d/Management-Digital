import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const URL = process.env.DATABASE_URL;
// Parse Postgres URL 
// format: postgresql://workspace:apikey@region.xata.tech:5432/db_name?sslmode=require
if (!URL) throw new Error("DATABASE_URL kosong");

const match = URL.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):5432\/(.*)\?sslmode=require/);
if (!match) throw new Error("Format DATABASE_URL tidak dikenal");

const [_, workspace, apikey, host, dbName] = match;
const [region] = host.split('.');

// Endpoint SQL Xata: https://{workspace}.{region}.xata.sh/db/{db_name}:main/sql
const endpoint = `https://${workspace}.${region}.xata.sh/db/${dbName}:main/sql`;

async function migrate() {
  console.log("Membaca file SQL...");
  const sqlContent = fs.readFileSync('./drizzle/0000_freezing_blue_shield.sql', 'utf8');
  
  const statements = sqlContent.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean);
  
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Ditemukan ${statements.length} instruksi execute. Memulai eksekusi via HTTP POST...`);
  
  for (let i = 0; i < statements.length; i++) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apikey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statement: statements[i] })
      });
      
      if (!res.ok) {
        const err = await res.text();
        console.error(`[ERROR] Baris ${i+1}: ${err}`);
      } else {
        console.log(`[OK] Progress: ${i+1}/${statements.length}`);
      }
    } catch (e: any) {
      console.error(`[ERROR] Gagal Network:`, e.message);
    }
  }
  console.log("Selesai!");
}

migrate();
