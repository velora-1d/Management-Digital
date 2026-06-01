
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
    console.log('\n🚀 AUDIT MODUL: KEUANGAN');
    console.log('---------------------------');

    // 1. LOGIN
    const login = await client.post('/auth/login', { email: 'admin@erp.com', password: 'password123' });
    if (login.status !== 200) return console.error('❌ Login Gagal. Skip test.');
    log('AUTH', 'Login Superadmin Sukses');

    // 2. AKUN KAS
    const cash = await client.post('/cash-accounts', { 
        name: 'Kas Audit', 
        bankName: 'Bank Nasional', 
        accountNumber: '778899', 
        balance: 5000000, 
        status: 'aktif', 
        unit_id: 'MA' 
    });
    log('CASH_ACC', cash.status === 200 || cash.status === 201 ? 'Create Sukses' : `Create Gagal (${cash.status})`);

    // 3. TAGIHAN INFAQ (GET Check)
    const bills = await client.get('/infaq-bills');
    log('INFAQ_BILLS', bills.status === 200 ? 'Fetch Sukses' : `Fetch Gagal (${bills.status})`);

    console.log('\n🏁 AUDIT SELESAI.');
}

runTest();
