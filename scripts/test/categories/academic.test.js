
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();
const client = wrapper(axios.create({ 
    baseURL: 'http://localhost:3000/api',
    jar,
    validateStatus: (status) => status < 500
}));

const log = (mod, msg, ok = true) => console.log(`[${ok ? '✅' : '❌'}] ${mod.padEnd(12)} | ${msg}`);

async function runTest() {
    console.log('\n🚀 AUDIT MODUL: AKADEMIK');
    console.log('---------------------------');

    // 1. LOGIN
    const login = await client.post('/auth/login', { email: 'admin@erp.com', password: 'password123' });
    if (login.status !== 200) return console.error('❌ Login Gagal. Skip test.');
    log('AUTH', 'Login Superadmin Sukses');

    // 2. MATA PELAJARAN
    const subj = await client.post('/subjects', { 
        name: 'Bahasa Indonesia Audit', 
        code: 'BIND-AUDIT', 
        type: 'wajib', 
        tingkat_kelas: 'Semua', 
        status: 'aktif', 
        unit_id: 'MA' 
    });
    log('SUBJECTS', subj.status === 200 || subj.status === 201 ? 'Create Sukses' : `Create Gagal (${subj.status}) - ${JSON.stringify(subj.data)}`);

    // 3. MANAJEMEN KURIKULUM (Placeholder logic)
    const cur = await client.post('/curriculum', { 
        type: 'KURMER', 
        academicYearId: 2, 
        semester: 'ganjil', 
        unitId: 'MA' 
    });
    log('CURRICULUM', cur.status === 200 || cur.status === 201 ? 'Create Sukses' : `Create Gagal (${cur.status})`);

    console.log('\n🏁 AUDIT SELESAI.');
}

runTest();
