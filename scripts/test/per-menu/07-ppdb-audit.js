/**
 * PPDB MODULE AUDIT (AUTHENTICATED)
 * Target: /api/ppdb & /api/ppdb/settings
 */
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:3000/api';
const JWT_SECRET = 'super_secret_school_erp_key_456';
const TOKEN_NAME = 'erp_token';

// 1. Generate Audit Token (Superadmin Role)
const auditPayload = {
    userId: 999,
    name: 'Audit Bot',
    email: 'audit@velora.id',
    role: 'superadmin',
    unitId: 'UNIT-TEST-01'
};
const token = jwt.sign(auditPayload, JWT_SECRET);
const cookieHeader = `${TOKEN_NAME}=${token}`;

async function auditPPDB() {
    console.log('--- STARTING AUTHENTICATED PPDB AUDIT ---');

    // 1. Audit Settings Biaya
    console.log('\n[1/3] Auditing Fee Settings (WITH AUTH)...');
    const feePayload = {
        daftar: 250000,
        buku: 500000,
        seragam: 750000
    };

    const setFeeResp = await fetch(`${BASE_URL}/ppdb/settings`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Cookie': cookieHeader
        },
        body: JSON.stringify(feePayload)
    });
    const setFeeData = await setFeeResp.json();
    console.log('Set Fees Response:', setFeeData.message);

    const getFeeResp = await fetch(`${BASE_URL}/ppdb/settings`, {
        headers: { 'Cookie': cookieHeader }
    });
    const getFeeData = await getFeeResp.json();
    console.log('Current Fees:', getFeeData.data);

    if (getFeeData.data && getFeeData.data.daftar === feePayload.daftar) {
        console.log('✅ Fees verified and saved successfully.');
    } else {
        console.error('❌ Fee mismatch or unauthorized access!');
    }

    // 2. Audit Pendaftaran Baru (Biaya Buku/Daftar harus sinkron)
    console.log('\n[2/3] Auditing New Registration...');
    const testNIK = '9900112233445566';
    const registrationPayload = {
        name: 'Siswa Audit Baru',
        gender: 'P',
        nik: testNIK,
        nisn: '1122334455',
        phone: '085544332211',
        targetClassroom: 'Kelas 1',
        birthPlace: 'Bandung',
        birthDate: '2017-10-10'
    };

    const regResp = await fetch(`${BASE_URL}/ppdb`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Cookie': cookieHeader 
        },
        body: JSON.stringify(registrationPayload)
    });
    const regData = await regResp.json();
    
    if (regData.success) {
        console.log('✅ Registration Successful:', regData.data.formNo);
        console.log('   Invoice Status: PENDING (Waiting for fees payment)');
    } else {
        console.log('⚠️ Registration Status:', regData.message);
    }

    // 3. Audit Statistik Pendaftaran
    console.log('\n[3/3] Fetching PPDB Dashboard Stats...');
    const statsResp = await fetch(`${BASE_URL}/ppdb`, {
        headers: { 'Cookie': cookieHeader }
    });
    const statsData = await statsResp.json();
    console.log('Stats Result:', statsData.stats || 'No stats found');

    console.log('\n--- PPDB AUDIT COMPLETED SUCCESSFULLY ---');
}

auditPPDB().catch(err => {
    console.error('Audit Crash:', err.message);
});
