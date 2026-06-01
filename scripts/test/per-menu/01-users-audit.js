
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });
const API_BASE = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE,
  validateStatus: () => true, 
});

const unique = (prefix) => `${prefix}-${Math.floor(Math.random() * 1000000)}`;

async function runAudit() {
  console.log("🚀 AUDIT MENU #1: USERS (MANAJEMEN PENGGUNA)");
  console.log("--------------------------------------------");

  // 1. LOGIN
  console.log("[STEP 1] Login...");
  const loginRes = await api.post('/auth/login', {
    email: 'admin@erp.com',
    password: 'password123'
  });
  
  if (loginRes.status !== 200) {
    console.log("❌ LOGIN GAGAL!");
    return;
  }
  const cookie = loginRes.headers['set-cookie'];
  if (cookie) api.defaults.headers.common['Cookie'] = cookie;
  console.log("✅ Login Sukses!\n");

  // 2. CREATE (POST)
  const testEmail = unique('audit-user') + "@erp.com";
  const testName = "User Audit Tester";
  console.log(`[STEP 2] Create User Baru: ${testName}...`);
  
  const postRes = await api.post('/users', {
    name: testName,
    username: testEmail, 
    password: 'password123',
    role: 'admin'
  });

  if (postRes.status === 201) {
    const userId = postRes.data.user?.id;
    console.log(`✅ [CREATE] Data Tersimpan dengan ID: ${userId}`);

    // 3. READ (GET)
    console.log("[STEP 3] Verifikasi Data Muncul...");
    const getListRes = await api.get('/users');
    const userList = Array.isArray(getListRes.data) ? getListRes.data : [];
    const userFound = userList.find(u => u.id === userId);
    
    if (userFound) {
      console.log(`✅ [READ] Data Muncul di List.`);
    } else {
      console.log("❌ [READ] Data TIDAK MUNCUL di List!");
    }

    // 4. UPDATE (PUT - Sesuai API Bapak)
    const newName = "User Audit UPDATED";
    console.log(`[STEP 4] Update Nama User via PUT...`);
    // API Bapak minta field lengkap saat PUT
    const putRes = await api.put(`/users/${userId}`, { 
        name: newName,
        username: testEmail,
        role: 'admin'
    });
    
    if (putRes.status === 200) {
      const verifyUpdate = await api.get('/users'); 
      const updatedUser = verifyUpdate.data.find(u => u.id === userId);
      if (updatedUser && updatedUser.name === newName) {
         console.log(`✅ [UPDATE] Data Tersimpan & Terupdate (DB: ${updatedUser.name})`);
      } else {
         console.log(`❌ [UPDATE] Data di database TIDAK BERUBAH!`);
      }
    } else {
      console.log(`❌ [UPDATE] Gagal! Status: ${putRes.status}`);
    }

    // 5. DELETE
    console.log("[STEP 5] Menghapus User...");
    const delRes = await api.delete(`/users/${userId}`);
    
    if (delRes.status === 200) {
      const getListFinal = await api.get('/users');
      const remains = getListFinal.data.find(u => u.id === userId);
      if (!remains) {
        console.log("✅ [DELETE] Data Sukses Dihapus (Hilang dari List).");
      } else {
        console.log("❌ [DELETE] Data MASIH MUNCUL setelah dihapus!");
      }
    } else {
      console.log(`❌ [DELETE] Gagal Hapus! Status: ${delRes.status}`);
    }

  } else {
    console.log(`❌ [CREATE] Gagal! Status: ${postRes.status}`);
  }

  console.log("\n--------------------------------------------");
  console.log("🏁 AUDIT MENU USER SELESAI.");
}

runAudit();
