/**
 * SCRIPT CEK NOMINAL: Melihat data asli di tabel infaq_bills
 */
const { Client } = require('pg');
const connectionString = "postgres://postgres:NfCNPIO8D6B7kPUPfELZA6DqYCWUDPlphDZVsR3kkPL2bRVM8s9LOaRYkCExewkl@43.129.50.214:5432/postgres";

async function checkNominal() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("🚀 Terhubung ke Prod. Mengecek nominal SPP...");
    
    // Ambil 5 data tagihan terbaru
    const res = await client.query("SELECT id, nominal, month, year FROM infaq_bills ORDER BY id DESC LIMIT 5;");
    console.log("📊 Data Tagihan (infaq_bills):", res.rows);

    // Ambil settingan nominal dari tabel settings atau meta (jika ada)
    // Saya cari tabel settings dulu
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
    console.log("📋 Daftar Tabel:", tables.rows.map(t => t.table_name));

  } catch (err) {
    console.error("❌ Gagal cek nominal:", err.message);
  } finally {
    await client.end();
  }
}

checkNominal();
