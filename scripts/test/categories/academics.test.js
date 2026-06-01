
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
    console.log('\n🚀 AUDIT SIDEBAR: [4] KELOMPOK AKADEMIK');
    console.log('------------------------------------------');

    // 1. LOGIN
    const login = await client.post('/auth/login', { email: 'admin@erp.com', password: 'password123' });
    if (login.status !== 200) return console.error('❌ Login Gagal. Skip test.');
    log('AUTH', 'LOGIN', 'Superadmin Sukses');

    // --- MUTASI & KENAIKAN ---
    const mut = await client.get('/mutations');
    log('MUTASI', 'LIST', mut.status === 200 ? 'Data Muncul' : `Gagal (${mut.status})`);

    // --- MATA PELAJARAN (CRUD Cycle) ---
    const subC = await client.post('/subjects', { name: 'Mapel Audit', code: `AUDIT-${Date.now().toString().slice(-4)}` });
    if (subC.status === 200 || subC.status === 201) {
        const subId = subC.data.data.id;
        log('MAPEL', 'CREATE', `Sukses (ID: ${subId})`);
        
        const subU = await client.patch(`/subjects/${subId}`, { name: 'Mapel Audit UPDATED' });
        log('MAPEL', 'UPDATE', subU.status === 200 ? 'Sukses Edit' : `Gagal (${subU.status})`);

        const subD = await client.delete(`/subjects/${subId}`);
        log('MAPEL', 'DELETE', subD.status === 200 ? 'Sukses Hapus' : `Gagal (${subD.status})`);
    } else {
        log('MAPEL', 'CREATE', `Gagal (${subC.status})`, false);
    }

    // --- PENUGASAN GURU ---
    const assign = await client.get('/teaching-assignments');
    log('PENUGASAN', 'LIST', assign.status === 200 ? 'Data Muncul' : `Gagal (${assign.status})`);

    // --- JADWAL PELAJARAN ---
    const sch = await client.get('/schedules');
    log('JADWAL', 'LIST', sch.status === 200 ? 'Data Muncul' : `Gagal (${sch.status})`);

    // --- ABSENSI SISWA ---
    // Note: API Attendance butuh classroomId dan date
    const clsList = await client.get('/classrooms');
    const firstClsId = clsList.data.data?.[0]?.id || 1;
    const today = new Date().toISOString().split('T')[0];
    
    const att = await client.get(`/attendance?classroomId=${firstClsId}&date=${today}`);
    log('ABSENSI', 'LIST', att.status === 200 ? 'Data Muncul' : `Gagal (${att.status})`);

    // --- KURIKULUM ---
    const cur = await client.get('/curriculum');
    log('KURIKULUM', 'LIST', cur.status === 200 ? 'Data Muncul' : `Gagal (${cur.status})`);

    console.log('\n🏁 AUDIT AKADEMIK SELESAI.');
}

runTest();
