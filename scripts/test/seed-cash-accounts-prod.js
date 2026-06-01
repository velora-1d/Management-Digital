/**
 * SEED CASH ACCOUNTS: Input data Akun Kas ke Production (Versi Perbaikan)
 */
const { Client } = require('pg');
const connectionString = "postgres://postgres:NfCNPIO8D6B7kPUPfELZA6DqYCWUDPlphDZVsR3kkPL2bRVM8s9LOaRYkCExewkl@43.129.50.214:5432/postgres";

async function seedCashAccounts() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("🚀 Terhubung ke Production. Memulai proses input...");

    const accounts = [
      { name: "Kas TU", unit_id: "" },
      { name: "Rekening Yayasan", unit_id: "" },
      { name: "Lainnya", unit_id: "" }
    ];

    for (const acc of accounts) {
      // Cek dulu apakah nama akun ini sudah ada
      const checkResult = await client.query("SELECT id FROM cash_accounts WHERE name = $1 AND unit_id = $2 AND deleted_at IS NULL", [acc.name, acc.unit_id]);
      
      if (checkResult.rows.length > 0) {
        console.log(` ⚠️ Akun "${acc.name}" sudah ada di database. Dilewati.`);
        continue;
      }

      console.log(` > Memasukkan Akun Baru: ${acc.name}...`);
      const insertQuery = `
        INSERT INTO cash_accounts (name, status, balance, unit_id, created_at, updated_at)
        VALUES ($1, 'active', 0, $2, NOW(), NOW());
      `;
      
      await client.query(insertQuery, [acc.name, acc.unit_id]);
    }

    console.log("\n🎊 SUKSES! 3 Akun Kas berhasil diproses ke Database Production.");

  } catch (err) {
    console.error("\n❌ Gagal input Akun Kas:", err.message);
  } finally {
    await client.end();
  }
}

seedCashAccounts();
