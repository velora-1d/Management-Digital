import pg from 'pg';
const { Client } = pg;
import 'dotenv/config';

async function checkConnection() {
  console.log('Testing connection to:', process.env.DATABASE_URL);
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    console.log('SUCCESS: Connected to PostgreSQL!');
    
    // Cek apakah database erp_sekolah_test sudah ada
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'erp_sekolah_test'");
    if (res.rowCount === 0) {
      console.log('Database erp_sekolah_test NOT FOUND. Creating...');
      await client.query('CREATE DATABASE erp_sekolah_test');
      console.log('SUCCESS: Database erp_sekolah_test created!');
    } else {
      console.log('Database erp_sekolah_test already exists.');
    }
    
    await client.end();
  } catch (err) {
    console.error('FAILURE: Could not connect to PostgreSQL.');
    console.error('Error Details:', err.message);
    process.exit(1);
  }
}

checkConnection();
