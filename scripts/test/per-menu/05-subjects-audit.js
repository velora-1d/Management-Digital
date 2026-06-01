
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

const uniqueName = () => `Mapel Audit ${Math.floor(Math.random() * 10000)}`;
const uniqueCode = () => `CODE-${Math.floor(Math.random() * 10000)}`;

async function runAudit() {
  console.log("🚀 AUDIT MENU #5: SUBJECTS (MATA PELAJARAN)");
  console.log("------------------------------------------");

  // 1. LOGIN
  const loginRes = await api.post('/auth/login', { email: 'admin@erp.com', password: 'password123' });
  if (loginRes.status !== 200) return console.log("❌ LOGIN GAGAL!");
  const cookie = loginRes.headers['set-cookie'];
  if (cookie) api.defaults.headers.common['Cookie'] = cookie;

  // 2. CREATE
  const testName = uniqueName();
  const testCode = uniqueCode();
  console.log(`[CREATE] Adding: ${testName} (${testCode})...`);
  const postRes = await api.post('/subjects', {
    name: testName,
    code: testCode,
    type: "pilihan",
    tingkatKelas: "7"
  });

  if (postRes.status === 201 || postRes.status === 200) {
    const id = postRes.data.data?.id;
    console.log(`✅ Success (ID: ${id})`);

    // 3. READ
    console.log("[READ] Verifying in list...");
    const getRes = await api.get('/subjects');
    const list = getRes.data.data || [];
    const found = list.find(x => x.id === id);
    console.log(found ? "✅ Found in list." : "❌ NOT FOUND in list!");

    // 4. UPDATE
    console.log("[UPDATE] Changing type...");
    const putRes = await api.put(`/subjects/${id}`, { 
        name: testName, 
        code: testCode,
        type: "wajib" 
    });
    
    if (putRes.status === 200) {
      const verify = await api.get('/subjects');
      const updated = (verify.data.data || []).find(x => x.id === id);
      console.log(updated?.type === "wajib" ? "✅ Update Success." : "❌ Update Failed!");
    } else {
        console.log(`[INFO] PUT status ${putRes.status}. Trying PATCH...`);
        const patchRes = await api.patch(`/subjects/${id}`, { type: "wajib" });
        console.log(patchRes.status === 200 ? "✅ PATCH Success." : `❌ PATCH Failed (${patchRes.status}).`);
    }

    // 5. DELETE
    console.log("[DELETE] Removing data...");
    const delRes = await api.delete(`/subjects/${id}`);
    if (delRes.status === 200) {
        const final = await api.get('/subjects');
        const exists = (final.data.data || []).find(x => x.id === id);
        console.log(!exists ? "✅ Delete Success." : "❌ Still exists!");
    } else {
        console.log(`❌ Delete Failed (${delRes.status})`);
    }

  } else {
    console.log(`❌ Create Failed (${postRes.status}): ${postRes.data?.message}`);
  }

  console.log("------------------------------------------");
  console.log("🏁 AUDIT SUBJECTS DONE.");
}

runAudit();
