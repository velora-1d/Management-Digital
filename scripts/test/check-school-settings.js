/**
 * SCRIPT CEK SETTING: Melihat konfigurasi SPP di school_settings
 */
const { Client } = require('pg');
const connectionString = "postgres://postgres:NfCNPIO8D6B7kPUPfELZA6DqYCWUDPlphDZVsR3kkPL2bRVM8s9LOaRYkCExewkl@43.129.50.214:5432/postgres";

async function checkSettings() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("🚀 Terhubung ke Prod. Mengecek school_settings...");
    
    // Ambil data setting
    const res = await client.query("SELECT * FROM school_settings LIMIT 1;");
    console.log("⚙️ Isi school_settings:", res.rows[0]);

  } catch (err) {
    console.error("❌ Gagal cek settings:", err.message);
  } finally {
    await client.end();
  }
}

checkSettings();
