/**
 * SCRIPT PERBBAIKAN PRODUKSI: Menormalkan SPP dari 50 ke 50.000
 */
const { Client } = require('pg');
const connectionString = "postgres://postgres:NfCNPIO8D6B7kPUPfELZA6DqYCWUDPlphDZVsR3kkPL2bRVM8s9LOaRYkCExewkl@43.129.50.214:5432/postgres";

async function fixProductionData() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("🚀 Memulai Operasi Pembersihan di Production...");

    // 1. Perbaiki Master Kelas (ID 15)
    const updateClass = await client.query("UPDATE classrooms SET infaq_nominal = 50000 WHERE infaq_nominal = 50 RETURNING id, name;");
    console.log(`✅ Berhasil update ${updateClass.rowCount} data Kelas.`);

    // 2. Perbaiki Tagihan yang sudah terbit
    const updateBills = await client.query("UPDATE infaq_bills SET nominal = 50000 WHERE nominal = 50 AND deleted_at IS NULL RETURNING id;");
    console.log(`✅ Berhasil update ${updateBills.rowCount} data Tagihan Siswa.`);

    console.log("🏁 Operasi Selesai dengan Sukses!");

  } catch (err) {
    console.error("❌ OPERASI GAGAL:", err.message);
  } finally {
    await client.end();
  }
}

fixProductionData();
