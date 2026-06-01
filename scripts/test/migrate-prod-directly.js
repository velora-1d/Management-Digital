/**
 * SCRIPT SAKTI: MIGRASI DATABASE PRODUCTION LANGSUNG KE TKP
 * Tujuan: Menjadikan kolom NIS, NISN, NIK, dan No KK menjadi NULLABLE di Database Produksi.
 */
const { Client } = require('pg');

// Ambil alamat rahasia dari environment production Bapak
const connectionString = "postgres://postgres:NfCNPIO8D6B7kPUPfELZA6DqYCWUDPlphDZVsR3kkPL2bRVM8s9LOaRYkCExewkl@43.129.50.214:5432/postgres";

async function runMigration() {
  const client = new Client({
    connectionString: connectionString,
    // Kita tambahkan timeout biar nggak lama nunggu kalau ada kendala
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log("🚀 Menyambungkan ke Database Production (43.129.50.214)...");
    await client.connect();
    console.log("✅ Terhubung ke Jantung Data Production!");

    console.log("🛠️ Menjalankan Operasi Bedah Skema (Nullable NIS)...");
    
    // Perintah SQL langsung ke sasaran
    const queries = [
      'ALTER TABLE students ALTER COLUMN nis DROP NOT NULL;',
      'ALTER TABLE students ALTER COLUMN nis SET DEFAULT NULL;',
      'ALTER TABLE students ALTER COLUMN nisn DROP NOT NULL;',
      'ALTER TABLE students ALTER COLUMN nisn SET DEFAULT NULL;',
      'ALTER TABLE students ALTER COLUMN nik DROP NOT NULL;',
      'ALTER TABLE students ALTER COLUMN nik SET DEFAULT NULL;',
      'ALTER TABLE students ALTER COLUMN no_kk DROP NOT NULL;',
      'ALTER TABLE students ALTER COLUMN no_kk SET DEFAULT NULL;'
    ];

    for (const q of queries) {
      console.log(` > Menjalankan: ${q}`);
      await client.query(q);
    }

    console.log("\n🎊 ALHAMDULILLAH! DATABASE PRODUCTION BERHASIL DIPERBAIKI TOTAL!");
    console.log("Sekarang NIS di website Bapak sudah bisa dikosongkan dengan aman.");

  } catch (err) {
    console.error("\n❌ WADUH, GAGAL TEMBAK PROD:", err.message);
    if (err.message.includes("ETIMEDOUT")) {
      console.log("⚠️ Sepertinya Firewall server Bapak belum mengizinkan koneksi Direct Database dari luar.");
    }
  } finally {
    await client.end();
  }
}

runMigration();
