
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
const API_BASE = 'http://localhost:3000/api';

// Helper untuk Axios
const api = axios.create({
  baseURL: API_BASE,
  validateStatus: () => true, // Terima semua status code biar bisa diaudit
});

async function login() {
  try {
    const res = await api.post('/auth/login', {
      email: 'admin@erp.com',
      password: 'password123'
    });
    console.log(`   [DEBUG] Status: ${res.status}`);
    console.log(`   [DEBUG] Body: ${JSON.stringify(res.data)}`);
    
    if (res.status === 200) {
      const cookie = res.headers['set-cookie'];
      if (cookie) api.defaults.headers.common['Cookie'] = cookie;
      return true;
    }
  } catch (err) {
    console.error("Login attempt error:", err.message);
  }
  return false;
}

/**
 * STRATEGI AUDIT:
 * - Test POST (Create)
 * - Test GET (List)
 * - Test PATCH (Update)
 * - Test DELETE (Remove)
 */

async function auditModule(name, endpoint, payload, updatePayload, useQueryParam = false) {
  console.log(`--- Testing CRUD: ${name} ---`);
  
  // 1. CREATE
  const postRes = await api.post(endpoint, payload);
  if (postRes.status >= 200 && postRes.status < 300) {
    const id = postRes.data.data?.id;
    console.log(`   [POST]   ✅ Success (ID: ${id})`);

    // 2. GET LIST
    const getRes = await api.get(endpoint);
    console.log(`   [GET]    ✅ Success (Count: ${getRes.data.data?.length || 0})`);

    if (id) {
      // 3. UPDATE (PATCH)
      const patchUrl = useQueryParam ? `${endpoint}?id=${id}` : `${endpoint}/${id}`;
      const patchRes = await api.patch(patchUrl, updatePayload);
      if (patchRes.status === 200) {
        console.log(`   [PATCH]  ✅ Success (Updated)`);
      } else {
        console.log(`   [PATCH]  ❌ Error ${patchRes.status}: ${patchRes.data?.message || 'Unknown'}`);
      }

      // 4. DELETE
      const deleteUrl = useQueryParam ? `${endpoint}?id=${id}` : `${endpoint}/${id}`;
      const delRes = await api.delete(deleteUrl);
      if (delRes.status === 200) {
        console.log(`   [DELETE] ✅ Success`);
      } else {
        console.log(`   [DELETE] ❌ Error ${delRes.status}: ${delRes.data?.message || 'Unknown'}`);
      }
    }
  } else {
    console.log(`   [POST]   ❌ Failed (${postRes.status}): ${postRes.data?.message || 'Unknown'}`);
  }
  console.log("");
}

// Helper untuk data unik
const unique = (prefix) => `${prefix}-${Math.floor(Math.random() * 1000000)}`;

async function runFullAudit() {
  console.log("🚀 MEMULAI TOTAL AUDIT CRUD ERP MH AS-SAODAH");
  console.log("--------------------------------------------");

  console.log("[1/2] Mencoba Login...");
  if (!await login()) {
    console.error("❌ Login Gagal. Pastikan server nyala dan superadmin sdh di-seed.");
    return;
  }
  console.log("✅ Login Berhasil!\n");

  console.log("[2/2] Testing Semua Modul Inti...");

  // MODUL 1: KELAS
  await auditModule("Classrooms", "/classrooms", 
    { name: unique("Audit Class"), level: 10, academicYearId: 1 }, 
    { name: unique("Audit Class Edited") }
  );

  // MODUL 2: SISWA
  await auditModule("Students", "/students", 
    { 
      name: "Siswa Audit", 
      nis: unique("NIS"), 
      nisn: unique("NISN"), 
      nik: unique("NIK"), 
      gender: "L" 
    }, 
    { name: "Siswa Audit Edited" }
  );

  // MODUL 3: MATA PELAJARAN
  await auditModule("Subjects", "/subjects", 
    { name: "Audit Mapel", code: unique("CODE"), type: "wajib", unit_id: "MA" }, 
    { name: "Audit Mapel Edited" }
  );

  // MODUL 4: KATEGORI KEUANGAN
  await auditModule("Transaction Categories", "/transaction-categories", 
    { name: "Audit Kategori", type: "in", description: "Test" }, 
    { name: "Audit Kategori Edited", type: "in" }, // FIX: Menambahkan field type yang wajib
    true // useQueryParam
  );

  // MODUL 5: PEGAWAI
  await auditModule("Staff/Teachers", "/teachers", 
    { name: unique("Guru Audit"), nip: unique("NIP"), gender: "P", status: "aktif" }, 
    { name: unique("Guru Audit Edited") }
  );

  // MODUL 6: INVENTARIS
  await auditModule("Inventory", "/inventory", 
    { name: "Laptop Audit", code: unique("INV"), unit_id: "MA", status: "baik" }, 
    { name: "Laptop Audit Edited" }
  );

  console.log("============================================");
  console.log("🏁 AUDIT SELESAI.");
}

runFullAudit();
