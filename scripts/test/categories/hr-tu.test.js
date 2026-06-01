
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
    console.log('\n🚀 AUDIT MODUL: SDM & TATA USAHA');
    console.log('---------------------------');

    // 1. LOGIN
    const login = await client.post('/auth/login', { email: 'admin@erp.com', password: 'password123' });
    if (login.status !== 200) return console.error('❌ Login Gagal. Skip test.');
    log('AUTH', 'Login Superadmin Sukses');

    // 2. DATA GURU (Placeholder)
    const teacher = await client.post('/teachers', { name: 'Guru Audit', nip: '19900101', status: 'aktif' });
    log('TEACHERS', teacher.status === 200 || teacher.status === 201 ? 'Create Sukses' : `Create Gagal (${teacher.status})`);

    // 3. INVENTARIS
    const inv = await client.post('/inventory', { 
        name: 'Laptop Audit', 
        code: 'LAP-001', 
        category: 'Elektronik', 
        condition: 'baik', 
        quantity: 5 
    });
    log('INVENTORY', inv.status === 200 || inv.status === 201 ? 'Create Sukses' : `Create Gagal (${inv.status})`);

    // 4. PENGUMUMAN
    const ann = await client.post('/announcements', { 
        title: 'Audit System', 
        content: 'System Health Check', 
        target: 'all' 
    });
    log('ANNOUNCE', ann.status === 200 || ann.status === 201 ? 'Create Sukses' : `Create Gagal (${ann.status})`);

    console.log('\n🏁 AUDIT SELESAI.');
}

runTest();
