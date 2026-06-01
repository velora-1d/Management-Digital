
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

const uniqueNip = () => `NIP-${Math.floor(Math.random() * 1000000)}`;

async function runAudit() {
  console.log("🚀 AUDIT MENU #4: EMPLOYEES (STAFF/GURU)");
  console.log("----------------------------------------");

  // 1. LOGIN
  const loginRes = await api.post('/auth/login', { email: 'admin@erp.com', password: 'password123' });
  if (loginRes.status !== 200) return console.log("❌ LOGIN GAGAL!");
  const cookie = loginRes.headers['set-cookie'];
  if (cookie) api.defaults.headers.common['Cookie'] = cookie;

  // 2. CREATE
  const testNip = uniqueNip();
  const testName = "Staff Audit Tester";
  console.log(`[CREATE] Adding: ${testName} (${testNip})...`);
  const postRes = await api.post('/employees', {
    name: testName,
    nip: testNip,
    type: "guru",
    position: "Guru Mapel",
    status: "aktif",
    baseSalary: 3000000
  });

  if (postRes.status === 200 || postRes.status === 201) {
    const id = postRes.data.data?.id;
    console.log(`✅ Success (ID: ${id})`);

    // 3. READ
    console.log("[READ] Verifying in list...");
    const getRes = await api.get('/employees');
    const list = getRes.data.data || [];
    const found = list.find(x => x.id === id);
    console.log(found ? "✅ Found in list." : "❌ NOT FOUND in list!");

    // 4. UPDATE
    console.log("[UPDATE] Changing position...");
    const putRes = await api.put(`/employees/${id}`, { 
        name: testName, 
        nip: testNip,
        type: "guru",
        position: "Wali Kelas" 
    });
    
    if (putRes.status === 200) {
      const verify = await api.get('/employees');
      const updated = (verify.data.data || []).find(x => x.id === id);
      console.log(updated?.position === "Wali Kelas" ? "✅ Update Success." : "❌ Update Failed!");
    } else {
        console.log(`[INFO] PUT status ${putRes.status}. Trying PATCH...`);
        const patchRes = await api.patch(`/employees/${id}`, { position: "Wali Kelas" });
        console.log(patchRes.status === 200 ? "✅ PATCH Success." : `❌ PATCH Failed (${patchRes.status}).`);
    }

    // 5. DELETE
    console.log("[DELETE] Removing data...");
    const delRes = await api.delete(`/employees/${id}`);
    if (delRes.status === 200) {
        const final = await api.get('/employees');
        const exists = (final.data.data || []).find(x => x.id === id);
        console.log(!exists ? "✅ Delete Success." : "❌ Still exists!");
    } else {
        console.log(`❌ Delete Failed (${delRes.status})`);
    }

  } else {
    console.log(`❌ Create Failed (${postRes.status}): ${postRes.data?.message}`);
  }

  console.log("----------------------------------------");
  console.log("🏁 AUDIT EMPLOYEES DONE.");
}

runAudit();
