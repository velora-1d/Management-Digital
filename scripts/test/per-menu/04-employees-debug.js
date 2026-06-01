
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });
const API_BASE = 'http://localhost:3000/api';

async function debugEmployees() {
  console.log("🧪 DEBUGGING EMPLOYEES (MINIMAL PAYLOAD)");
  const api = axios.create({ baseURL: API_BASE, validateStatus: () => true });

  // 1. LOGIN
  const loginRes = await api.post('/auth/login', { email: 'admin@erp.com', password: 'password123' });
  const cookie = loginRes.headers['set-cookie'];
  if (cookie) api.defaults.headers.common['Cookie'] = cookie;

  // 2. TEST MINIMAL
  console.log("[DEBUG] Testing with Name Only...");
  const res = await api.post('/employees', { 
    name: "Debug Test " + Date.now() 
  });

  console.log(`Status: ${res.status}`);
  console.log(`Response: ${JSON.stringify(res.data)}`);
}

debugEmployees();
