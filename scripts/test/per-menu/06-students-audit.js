
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

const uniqueNisn = () => `NISN-${Date.now()}`;
const uniqueName = () => `Siswa Audit ${Math.floor(Math.random() * 10000)}`;

async function runAudit() {
  console.log("🚀 AUDIT MENU #6: STUDENTS (DATA SISWA)");
  console.log("---------------------------------------");

  // 1. LOGIN
  const loginRes = await api.post('/auth/login', { email: 'admin@erp.com', password: 'password123' });
  if (loginRes.status !== 200) return console.log("❌ LOGIN GAGAL!");
  const cookie = loginRes.headers['set-cookie'];
  if (cookie) api.defaults.headers.common['Cookie'] = cookie;

  // 2. PRE-REQUISITE: GET CLASSROOM (for assignment)
  console.log("[PRE-REQ] Getting classroom...");
  const classRes = await api.get('/classrooms');
  const classroomId = classRes.data.data?.[0]?.id || null;
  console.log(classroomId ? `✅ Target Class ID: ${classroomId}` : "⚠️ No classroom found, will insert without class.");

  // 3. CREATE
  const ts = Date.now();
  const testName = `Siswa Audit ${ts}`;
  const testNisn = `NISN-${ts}`;
  const testNik = `NIK-${ts}`;
  const testNis = `NIS-${ts}`;
  console.log(`[CREATE] Adding: ${testName} (${testNisn})...`);
  const postRes = await api.post('/students', {
    name: testName,
    nisn: testNisn,
    nik: testNik,
    nis: testNis,
    gender: "L",
    status: "aktif",
    classroomId: classroomId,
    birthPlace: "Jakarta",
    birthDate: "2010-01-01",
    fatherName: "Ayah Audit",
    motherName: "Ibu Audit"
  });

  if (postRes.status === 200 || postRes.status === 201) {
    const id = postRes.data.data?.id;
    console.log(`✅ Success (ID: ${id})`);

    // 4. READ
    console.log("[READ] Verifying in list...");
    const getRes = await api.get('/students');
    const list = getRes.data.data || [];
    const found = list.find(x => x.id === id);
    console.log(found ? "✅ Found in list." : "❌ NOT FOUND in list!");

    // 5. UPDATE
    console.log("[UPDATE] Changing address...");
    const putRes = await api.put(`/students/${id}`, { 
        name: testName, 
        nisn: testNisn,
        address: "Jl. Audit No. 123" 
    });
    
    if (putRes.status === 200) {
      console.log("✅ Update Success.");
    } else {
        console.log(`[INFO] PUT status ${putRes.status}. Trying PATCH...`);
        const patchRes = await api.patch(`/students/${id}`, { address: "Jl. Audit No. 123" });
        console.log(patchRes.status === 200 ? "✅ PATCH Success." : `❌ PATCH Failed (${patchRes.status}).`);
    }

    // 6. DELETE
    console.log("[DELETE] Removing data...");
    const delRes = await api.delete(`/students/${id}`);
    if (delRes.status === 200) {
        const final = await api.get('/students');
        const exists = (final.data.data || []).find(x => x.id === id);
        console.log(!exists ? "✅ Delete Success." : "❌ Still exists!");
    } else {
        console.log(`❌ Delete Failed (${delRes.status})`);
    }

  } else {
    console.log(`❌ Create Failed (${postRes.status}): ${postRes.data?.message}`);
  }

  console.log("---------------------------------------");
  console.log("🏁 AUDIT STUDENTS DONE.");
}

runAudit();
