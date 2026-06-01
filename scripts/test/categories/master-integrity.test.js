
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();
const client = wrapper(axios.create({ 
    baseURL: 'http://localhost:3000/api',
    jar,
    validateStatus: (status) => status < 500
}));

const log = (mod, action, msg, ok = true) => console.log(`[${ok ? '✅' : '❌'}] ${mod.padEnd(8)} | ${action.padEnd(8)} | ${msg}`);

async function runTest() {
    console.log('\n🚀 AUDIT INTEGRITAS CRUD: DATA MASTER');
    console.log('--------------------------------------');

    // 1. LOGIN
    const login = await client.post('/auth/login', { email: 'admin@erp.com', password: 'password123' });
    if (login.status !== 200) return console.error('❌ Login Gagal. Skip test.');
    log('AUTH', 'LOGIN', 'Superadmin Sukses');

    // --- TEST KELAS ---
    const clsC = await client.post('/classrooms', { name: 'Kelas CRUD Test', level: 10 });
    const clsId = clsC.data.data.id;
    log('CLASS', 'CREATE', `ID: ${clsId}`);

    const clsU = await client.patch(`/classrooms/${clsId}`, { name: 'Kelas CRUD UPDATED' });
    log('CLASS', 'UPDATE', clsU.status === 200 ? 'Sukses Ganti Nama' : `Gagal (${clsU.status})`);

    const clsD = await client.delete(`/classrooms/${clsId}`);
    log('CLASS', 'DELETE', clsD.status === 200 ? 'Sukses Hapus' : `Gagal (${clsD.status})`);

    // --- TEST KATEGORI KEUANGAN ---
    const txC = await client.post('/transaction-categories', { name: 'Kategori CRUD Test', type: 'in', unitId: 'MA' });
    const txId = txC.data.data.id;
    log('TX_CAT', 'CREATE', `ID: ${txId}`);

    const txU = await client.patch(`/transaction-categories/${txId}`, { name: 'Kategori CRUD UPDATED' });
    log('TX_CAT', 'UPDATE', txU.status === 200 ? 'Sukses Ganti Nama' : `Gagal (${txU.status})`);

    const txD = await client.delete(`/transaction-categories/${txId}`);
    log('TX_CAT', 'DELETE', txD.status === 200 ? 'Sukses Hapus' : `Gagal (${txD.status})`);

    // --- TEST SISWA ---
    const stdC = await client.post('/students', { name: 'Siswa CRUD Test', nisn: '9988776655', gender: 'L', dob: '2010-01-01' });
    const stdId = stdC.data.data.id;
    log('STUDENT', 'CREATE', `ID: ${stdId}`);

    const stdU = await client.patch(`/students/${stdId}`, { name: 'Siswa CRUD UPDATED' });
    log('STUDENT', 'UPDATE', stdU.status === 200 ? 'Sukses Ganti Nama' : `Gagal (${stdU.status})`);

    const stdD = await client.delete(`/students/${stdId}`);
    log('STUDENT', 'DELETE', stdD.status === 200 ? 'Sukses Hapus' : `Gagal (${stdD.status})`);

    console.log('\n🏁 AUDIT INTEGRITAS SELESAI.');
}

runTest();
