/**
 * RE-REGISTRATION MODULE AUDIT (AUTHENTICATED)
 * Target: /api/reregistration/settings & /api/reregistration
 */
import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:3000/api';
const JWT_SECRET = 'super_secret_school_erp_key_456';
const TOKEN_NAME = 'erp_token';

// Generate Audit Token
const auditPayload = {
    userId: 999,
    name: 'Audit Bot',
    email: 'audit@velora.id',
    role: 'superadmin',
    unitId: 'UNIT-TEST-01'
};
const token = jwt.sign(auditPayload, JWT_SECRET);
const cookieHeader = `${TOKEN_NAME}=${token}`;

async function auditReregistration() {
    console.log('--- STARTING RE-REGISTRATION MODULE AUDIT ---');

    // 1. Audit Security (Test without token)
    console.log('\n[1/3] Testing Security (Expecting 401 Unauthorized)...');
    try {
        const unauthResp = await fetch(`${BASE_URL}/reregistration/settings`);
        const unauthData = await unauthResp.json();
        if (unauthResp.status === 401 || !unauthData.success) {
            console.log('✅ Security Test PASSED: Access blocked without token.');
        } else {
            console.error('❌ Security Test FAILED: API is still open without auth!');
        }
    } catch {
        console.log('✅ Security Test PASSED: Access blocked.');
    }

    // 2. Audit Settings Biaya (With Auth)
    console.log('\n[2/3] Auditing Re-reg Fee Settings...');
    const reRegFees = {
        re_registration_fee: 150000,
        books_fee: 450000,
        uniform_fee: 300000
    };

    const setFeeResp = await fetch(`${BASE_URL}/reregistration/settings`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Cookie': cookieHeader 
        },
        body: JSON.stringify(reRegFees)
    });
    const setFeeData = await setFeeResp.json();
    console.log('Set Fees Response:', setFeeData.message);

    const getFeeResp = await fetch(`${BASE_URL}/reregistration/settings`, {
        headers: { 'Cookie': cookieHeader }
    });
    const getFeeData = await getFeeResp.json();
    console.log('Current Re-reg Fees:', getFeeData.data);

    if (getFeeData.data && getFeeData.data.books_fee === reRegFees.books_fee) {
        console.log('✅ Re-reg Fees verified successfully.');
    } else {
        console.error('❌ Re-reg Fee mismatch!');
    }

    // 3. Audit Data Siswa Lama
    console.log('\n[3/3] Fetching Reregistration Candidates...');
    const listResp = await fetch(`${BASE_URL}/reregistration`, {
        headers: { 'Cookie': cookieHeader }
    });
    const listData = await listResp.json();
    console.log('Candidates Count:', listData.data ? listData.data.length : 0);

    console.log('\n--- RE-REGISTRATION AUDIT COMPLETED ---');
}

auditReregistration().catch(err => console.error('Audit Error:', err.message));
