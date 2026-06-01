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
    console.log('\n🚀 AUDIT SIDEBAR: [6] KELOMPOK SARPRAS & LAB');
    console.log('------------------------------------------');

    // 1. LOGIN
    const login = await client.post('/auth/login', { email: 'admin@erp.com', password: 'password123' });
    if (login.status !== 200) return console.error('❌ Login Gagal. Skip test.');
    log('AUTH', 'LOGIN', 'Superadmin Sukses');

    // --- INVENTARIS ---
    const inv = await client.get('/inventories');
    log('INVENTARIS', 'LIST', inv.status === 200 ? 'Data Muncul' : `Gagal (${inv.status})`);

    // --- KOPERASI ---
    const coop = await client.get('/coop');
    log('KOPERASI', 'LIST', coop.status === 200 ? 'Data Muncul' : `Gagal (${coop.status})`);

    // --- TABUNGAN SISWA ---
    const sav = await client.get('/savings');
    log('TABUNGAN', 'LIST', sav.status === 200 ? 'Data Muncul' : `Gagal (${sav.status})`);

    console.log('\n🏁 AUDIT INFRASTRUKTUR SELESAI.');
}

runTest();
