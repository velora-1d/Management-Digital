
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

const uniqueName = () => `Kelas Audit ${Math.floor(Math.random() * 10000)}`;

async function runAudit() {
  console.log("🚀 AUDIT MENU #3: CLASSROOMS (MANAJEMEN KELAS)");
  console.log("----------------------------------------------");

  // 1. LOGIN
  const loginRes = await api.post('/auth/login', { email: 'admin@erp.com', password: 'password123' });
  if (loginRes.status !== 200) return console.log("❌ LOGIN GAGAL!");
  const cookie = loginRes.headers['set-cookie'];
  if (cookie) api.defaults.headers.common['Cookie'] = cookie;

  // 2. GET ACADEMIC YEAR ID (Dinamis)
  const ayRes = await api.get('/academic-years');
  const ayId = ayRes.data.data?.[0]?.id || 1;
  console.log(`[INFO] Using Academic Year ID: ${ayId}`);

  // 3. CREATE
  const testName = uniqueName();
  console.log(`[CREATE] Adding: ${testName}...`);
  const postRes = await api.post('/classrooms', {
    name: testName,
    level: 7,
    academicYearId: ayId,
    infaqNominal: 50000
  });

  if (postRes.status === 200 || postRes.status === 201) {
    const id = postRes.data.data?.id;
    console.log(`✅ Success (ID: ${id})`);

    // 4. READ
    console.log("[READ] Verifying in list...");
    const getRes = await api.get('/classrooms');
    const list = getRes.data.data || [];
    const found = list.find(x => x.id === id);
    console.log(found ? "✅ Found in list." : "❌ NOT FOUND in list!");

    // 5. UPDATE
    console.log("[UPDATE] Changing level to 8...");
    const putRes = await api.put(`/classrooms/${id}`, { name: testName, level: 8 });
    
    // Coba PUT ke path ID
    if (putRes.status === 200) {
      const verify = await api.get('/classrooms');
      const updated = (verify.data.data || []).find(x => x.id === id);
      console.log(updated?.level === 8 ? "✅ Update Success (Level 8)." : "❌ Update Failed!");
    } else {
        console.log(`[INFO] PUT status ${putRes.status}. Trying PATCH...`);
        const patchRes = await api.patch(`/classrooms/${id}`, { level: 8 });
        console.log(patchRes.status === 200 ? "✅ PATCH Success." : `❌ PATCH Failed (${patchRes.status}).`);
    }

    // 6. DELETE
    console.log("[DELETE] Removing data...");
    const delRes = await api.delete(`/classrooms/${id}`);
    if (delRes.status === 200) {
        const final = await api.get('/classrooms');
        const exists = (final.data.data || []).find(x => x.id === id);
        console.log(!exists ? "✅ Delete Success." : "❌ Still exists!");
    } else {
        console.log(`❌ Delete Failed (${delRes.status})`);
    }

  } else {
    console.log(`❌ Create Failed (${postRes.status}): ${postRes.data?.message}`);
  }

  console.log("----------------------------------------------");
  console.log("🏁 AUDIT CLASSROOMS DONE.");
}

runAudit();
