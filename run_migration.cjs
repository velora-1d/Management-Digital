const fs = require('fs');
require('dotenv').config();

const URL = process.env.DATABASE_URL;
if (!URL) throw new Error("DATABASE_URL kosong");

const match = URL.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):5432\/([^?]+)/);
if (!match) throw new Error("Format DATABASE_URL tidak dikenal.");

const apikey = match[2];
const host = match[3];

const hostParts = host.split('.');
const workspace = hostParts[0]; 
const region = hostParts[1] || 'us-east-1';

let finalHost = `https://${workspace}.${region}.xata.sh`;
if (host.includes("us-east-1")) { 
  finalHost = `https://${workspace}.us-east-1.xata.sh`;
}

// Nama Database Xata yang di-encode (URL Encoding untuk spasi)
const dbNameRaw = "MH As-Saodah";
const dbNameEncoded = encodeURIComponent(dbNameRaw);
const branchName = process.env.XATA_BRANCH || "production";

async function migrate() {
  console.log("Membaca file SQL Drizzle...");
  const sqlContent = fs.readFileSync('./drizzle/0000_freezing_blue_shield.sql', 'utf8');
  let statements = sqlContent.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean);
  
  // Endpoint API eksekusi SQL 
  const finalEndpoint = `${finalHost}/db/${dbNameEncoded}:${branchName}/sql`;
  
  console.log(`Endpoint API Xata : ${finalEndpoint}`);
  console.log(`\nMengeksekusi total ${statements.length} perintah pembuatan tabel Drizzle...\n`);
  
  let successCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    try {
      const dbResponse = await fetch(finalEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apikey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statement: statements[i] })
      });
      
      const responseText = await dbResponse.text();
      
      if (!dbResponse.ok) {
        if (responseText.includes("already exists")) {
             successCount++; // Abaikan kalau tabelnya memang sudah ada sebelumnya
        } else {
             console.error(`\n[ERROR] Query ke-${i+1} gagal: ${responseText} -> ${statements[i].substring(0,60)}...`);
        }
      } else {
        successCount++;
        process.stdout.write(`\r[OK] Berhasil Eksekusi: ${successCount} dari ${statements.length} instruksi`);
      }
    } catch (e) {
      console.error(`\n[ERROR NETWORK] Gagal API pada Query ${i+1}:`, e.message);
    }
  }
  console.log(`\n\n[SELESAI!] Berhasil membuat ${successCount} dari ${statements.length} tabel ke Xata tanpa error.`);
}

migrate();
