
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
    console.log('\n🚀 AUDIT MODUL: DATA MASTER');
    console.log('---------------------------');

    // 1. LOGIN
    const login = await client.post('/auth/login', { email: 'admin@erp.com', password: 'password123' });
    if (login.status !== 200) return console.error('❌ Login Gagal. Skip test.');
    log('AUTH', 'Login Superadmin Sukses');

    // 2. TAHUN AJARAN
    const ay = await client.post('/academic-years', { year: '2025/2026', startDate: '2025-07-01', endDate: '2026-06-30' });
    log('ACAD_YEAR', ay.status === 200 || ay.status === 201 ? 'Create Sukses' : `Create Gagal (${ay.status})`);
    
    // 3. KELAS
    const cls = await client.post('/classrooms', { name: 'Audit Room', level: 12, academicYearId: 2, infaqNominal: 50000 });
    log('CLASSROOM', cls.status === 200 ? 'Create Sukses' : `Create Gagal (${cls.status})`);

    // 4. SISWA
    const std = await client.post('/students', { 
        name: 'Siswa Pengetesan', 
        nisn: '1234567890', 
        gender: 'L', 
        pob: 'Jakarta', 
        dob: '2010-01-01',
        classId: 1
    });
    log('STUDENTS', std.status === 200 || std.status === 201 ? 'Create Sukses' : `Create Gagal (${std.status}) - ${JSON.stringify(std.data)}`);

    // 5. KATEGORI KEUANGAN
    const tx = await client.post('/transaction-categories', { name: 'Audit Infaq', type: 'in', description: 'Test', unitId: 'MA' });
    log('TX_CAT', tx.status === 200 ? 'Create Sukses' : `Create Gagal (${tx.status})`);

    console.log('\n🏁 AUDIT SELESAI.');
}

runTest();
