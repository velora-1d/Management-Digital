/**
 * SCRIPT CEK UNIT: Mencari Unit ID aktif di Production
 */
const { Client } = require('pg');
const connectionString = "postgres://postgres:NfCNPIO8D6B7kPUPfELZA6DqYCWUDPlphDZVsR3kkPL2bRVM8s9LOaRYkCExewkl@43.129.50.214:5432/postgres";

async function checkUnits() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("🚀 Terhubung ke Prod. Mencari Unit ID...");
    
    // Cek di tabel users atau data master lain untuk melihat unit_id yang dipakai
    const res = await client.query("SELECT unit_id, count(*) FROM users GROUP BY unit_id LIMIT 5;");
    console.log("📊 Unit ID yang ditemukan di tabel Users:", res.rows);

  } catch (err) {
    console.error("❌ Gagal cek unit:", err.message);
  } finally {
    await client.end();
  }
}

checkUnits();
