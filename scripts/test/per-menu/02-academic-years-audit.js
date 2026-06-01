
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

const uniqueYear = () => `20${Math.floor(Math.random() * 80) + 20}/20${Math.floor(Math.random() * 80) + 21} AUDIT`;

async function runAudit() {
  console.log("🚀 AUDIT MENU #2: ACADEMIC YEARS (TAHUN AKADEMIK)");
  console.log("-----------------------------------------------");

  // 1. LOGIN
  const loginRes = await api.post('/auth/login', { email: 'admin@erp.com', password: 'password123' });
  if (loginRes.status !== 200) return console.log("❌ LOGIN GAGAL!");
  const cookie = loginRes.headers['set-cookie'];
  if (cookie) api.defaults.headers.common['Cookie'] = cookie;

  // 2. CREATE
  const testYear = uniqueYear();
  console.log(`[CREATE] Adding: ${testYear}...`);
  const postRes = await api.post('/academic-years', {
    year: testYear,
    isActive: false,
    startDate: "2026-07-01",
    endDate: "2027-06-30"
  });

  if (postRes.status === 200 || postRes.status === 201) {
    const id = postRes.data.data?.id;
    console.log(`✅ Success (ID: ${id})`);

    // 3. READ
    console.log("[READ] Verifying in list...");
    const getRes = await api.get('/academic-years');
    const list = getRes.data.data || [];
    const found = list.find(x => x.id === id);
    console.log(found ? "✅ Found in list." : "❌ NOT FOUND in list!");

    // 4. UPDATE
    console.log("[UPDATE] Setting to Active...");
    const putRes = await api.put(`/academic-years/${id}`, { year: testYear, isActive: true });
    
    // Periksa status 200 atau 405 (jika method salah)
    if (putRes.status === 200) {
      const verify = await api.get('/academic-years');
      const updated = (verify.data.data || []).find(x => x.id === id);
      console.log(updated?.isActive ? "✅ Update Success (Active)." : "❌ Update Failed (Still Inactive).");
    } else {
        // Coba PATCH jika PUT Gagal
        console.log(`[INFO] PUT status ${putRes.status}. Trying PATCH...`);
        const patchRes = await api.patch(`/academic-years/${id}`, { isActive: true });
        console.log(patchRes.status === 200 ? "✅ PATCH Success." : `❌ PATCH Failed (${patchRes.status}).`);
    }

    // 5. DELETE
    console.log("[DELETE] Removing data...");
    const delRes = await api.delete(`/academic-years/${id}`);
    if (delRes.status === 200) {
        const final = await api.get('/academic-years');
        const exists = (final.data.data || []).find(x => x.id === id);
        console.log(!exists ? "✅ Delete Success (Soft Deleted)." : "❌ Still exists!");
    } else {
        console.log(`❌ Delete Failed (${delRes.status})`);
    }

  } else {
    console.log(`❌ Create Failed (${postRes.status}): ${postRes.data?.message}`);
  }

  console.log("-----------------------------------------------");
  console.log("🏁 AUDIT ACADEMIC YEARS DONE.");
}

runAudit();
