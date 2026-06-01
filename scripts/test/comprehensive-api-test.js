const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const JWT_SECRET = process.env.JWT_SECRET || 'assaodah-super-secret-key-2025-secure-test';
const BASE_URL = 'http://localhost:3000';
const TOKEN_NAME = 'erp_token';

// Create a mock SuperAdmin token
// Pakai unitId 'SMP' (asumsi unit yang ada) biar valid di DB
const token = jwt.sign({
    userId: 1,
    name: 'Super Admin Test',
    email: 'admin@erpschool.test',
    role: 'superadmin',
    unitId: 'SMP' 
}, JWT_SECRET, { expiresIn: '1h' });

const cookieHeader = `${TOKEN_NAME}=${token}`;

async function hitApi(endpoint, method = 'GET', body = null) {
    const url = `${BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieHeader
        }
    };
    if (body) options.body = JSON.stringify(body);

    try {
        const response = await fetch(url, options);
        const contentType = response.headers.get('content-type');
        
        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = { text: await response.text(), isRaw: true };
        }
        
        return { status: response.status, data };
    } catch (error) {
        return { status: 500, error: error.message };
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
    console.log('🚀 MEMULAI PENGUJIAN API V2 (FIXED & DYNAMIC)\n');
    let report = [];

    // --- 1. PPDB SETTINGS ---
    const settings = await hitApi('/api/ppdb/settings');
    report.push({ api: 'GET /api/ppdb/settings', status: settings.status, success: settings.status === 200 });

    // --- 2. CREATE PENDAFTAR ---
    const uniquePhone = `08${Math.floor(Math.random() * 1000000000)}`;
    const newReg = await hitApi('/api/ppdb', 'POST', {
        name: 'Siswa Test V2',
        gender: 'L',
        phone: uniquePhone,
        address: 'Alamat Test V2'
    });
    const regId = newReg.data?.data?.id;
    report.push({ api: 'POST /api/ppdb', status: newReg.status, success: !!regId });

    if (regId) {
        // --- 3. QUICK PAYMENT (Registration) ---
        // Refetch detail to get dynamic payment IDs
        const detail = await hitApi(`/api/ppdb/${regId}`);
        const regPayments = detail.data?.data?.payments || [];
        const regPayItem = regPayments.find(p => p.paymentType === 'registration');
        
        if (regPayItem) {
            console.log(`- Melunasi uang daftar (ID: ${regPayItem.id})...`);
            await hitApi(`/api/quick-payment/${regPayItem.id}/toggle`, 'POST', { amount: 150000, cashAccountId: 1 });
            report.push({ api: 'POST /api/quick-payment/[id]/toggle', status: 200, success: true });
        }

        // --- 4. APPROVE ---
        console.log('- Mengubah status jadi DITERIMA...');
        const approve = await hitApi(`/api/ppdb/${regId}/approve`, 'POST');
        report.push({ api: 'POST /api/ppdb/[id]/approve', status: approve.status, success: approve.status === 200 });

        // Tunggu bentar biar DB napas
        await sleep(1000);

        // --- 5. CONVERT TO STUDENT ---
        console.log('- Mengonversi jadi SISWA AKTIF...');
        const convert = await hitApi(`/api/ppdb/${regId}/convert`, 'POST', { classroomId: 1, infaqNominal: 50000 });
        report.push({ api: 'POST /api/ppdb/[id]/convert', status: convert.status, success: convert.status === 200 });

        // --- 6. DELETE (Clean up) ---
        console.log('- Menghapus data testing...');
        const del = await hitApi(`/api/ppdb/${regId}`, 'DELETE');
        report.push({ api: 'DELETE /api/ppdb/[id]', status: del.status, success: del.status === 200 });
    }

    // --- 7. EXPORT (Handle CSV) ---
    console.log('[7/18] Testing Export CSV...');
    const exp = await hitApi('/api/ppdb/export');
    report.push({ api: 'GET /api/ppdb/export', status: exp.status, success: exp.status === 200 && exp.data.isRaw });

    // --- 8. REREGISTRATION (Generate & Dynamic Payment) ---
    console.log('[8/18] Testing Daftar Ulang...');
    await hitApi('/api/reregistration/generate', 'POST');
    const listRe = await hitApi('/api/reregistration');
    const firstStudent = listRe.data?.data?.[0];

    if (firstStudent) {
        console.log(`- Testing bayar buku untuk Murid ID: ${firstStudent.id}...`);
        const payRe = await hitApi('/api/reregistration/payment', 'POST', { 
            regId: firstStudent.id, 
            field: 'is_books_paid', 
            amount: 75000, 
            cashAccountId: 1 
        });
        report.push({ api: 'POST /api/reregistration/payment', status: payRe.status, success: payRe.status === 200 });
    } else {
        report.push({ api: 'POST /api/reregistration/payment', status: 'N/A', success: false, note: 'No data to test' });
    }

    // --- 9. STATS ---
    const stats = await hitApi('/api/ppdb/stats');
    report.push({ api: 'GET /api/ppdb/stats', status: stats.status, success: stats.status === 200 });

    console.log('\n✅ PENGUJIAN SELESAI (V2). LAPORAN HASIL:\n');
    console.table(report);
}

runTests();
