import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();
const client = wrapper(axios.create({ 
    baseURL: 'http://localhost:3000/api',
    jar,
    validateStatus: (status) => status < 500
}));

const log = (mod, action, msg, ok = true) => console.log(`[${ok ? '✅' : '❌'}] ${mod.padEnd(12)} | ${action.padEnd(8)} | ${msg}`);

async function runTest() {
    console.log('\n🚀 AUDIT SIDEBAR: [5] KELOMPOK KESISWAAN');
    console.log('------------------------------------------');

    // 1. LOGIN
    const login = await client.post('/auth/login', { email: 'admin@erp.com', password: 'password123' });
    if (login.status !== 200) return console.error('❌ Login Gagal. Skip test.');
    log('AUTH', 'LOGIN', 'Superadmin Sukses');

    // --- PEMBINAAN SISWA (COUNSELING) ---
    const couns = await client.get('/counseling');
    log('PEMBINAAN', 'LIST', couns.status === 200 ? 'Data Muncul' : `Gagal (${couns.status})`);

    // --- EKSTRAKURIKULER ---
    const eks = await client.get('/extracurriculars');
    log('EKSKUL', 'LIST', eks.status === 200 ? 'Data Muncul' : `Gagal (${eks.status})`);

    // --- PRESTASI SISWA ---
    const ach = await client.get('/achievements');
    log('PRESTASI', 'LIST', ach.status === 200 ? 'Data Muncul' : `Gagal (${ach.status})`);

    console.log('\n🏁 AUDIT KESISWAAN SELESAI.');
}

runTest();
