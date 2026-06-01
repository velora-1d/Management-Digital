
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();
const client = wrapper(axios.create({ 
    baseURL: 'http://localhost:3000/api',
    jar,
    validateStatus: (status) => status < 500
}));

const log = (mod, action, msg, ok = true) => console.log(`[${ok ? '✅' : '❌'}] ${mod.padEnd(10)} | ${action.padEnd(8)} | ${msg}`);

async function runTest() {
    console.log('\n🚀 AUDIT SIDEBAR: [1] UTAMA & [2] PENERIMAAN');
    console.log('----------------------------------------------');

    // 1. LOGIN
    const login = await client.post('/auth/login', { email: 'admin@erp.com', password: 'password123' });
    if (login.status !== 200) return console.error('❌ Login Gagal. Skip test.');
    log('AUTH', 'LOGIN', 'Superadmin Sukses');

    // --- GRUP [1] UTAMA ---
    const dash = await client.get('/dashboard/summary');
    log('DASHBOARD', 'SUMMARY', dash.status === 200 ? 'Data Stats Muncul' : `Gagal (${dash.status})`);

    // --- GRUP [2] PENERIMAAN: PPDB ---
    const ppdbC = await client.post('/ppdb', { 
        name: 'Siswa Baru Audit', 
        nik: `123456789${Date.now().toString().slice(-7)}`, // Unik
        gender: 'L', 
        phone: '08123456789' 
    });
    
    if (ppdbC.status === 200 || ppdbC.status === 201) {
        log('PPDB', 'CREATE', `Sukses (Form: ${ppdbC.data.data.formNo})`);
        
        // --- GRUP [2] PENERIMAAN: DAFTAR ULANG (Status Check) ---
        // Verifikasi status pendaftar (Logika Daftar Ulang biasanya lewat Get Detail)
        const regId = ppdbC.data.data.id;
        const detail = await client.get(`/ppdb/${regId}`);
        log('DAFTAR_ULG', 'CHECK', detail.status === 200 ? `Status: ${detail.data.data.status}` : 'Detail Gagal');
    } else {
        log('PPDB', 'CREATE', `Gagal (${ppdbC.status}) - ${JSON.stringify(ppdbC.data)}`, false);
    }

    console.log('\n🏁 AUDIT GRUP 1 & 2 SELESAI.');
}

runTest();
