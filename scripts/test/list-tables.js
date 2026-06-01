import pg from 'pg';
const { Client } = pg;
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function listTables() {
  const url = process.env.DATABASE_URL;
  console.log('Testing connection to Xata...');
  
  const client = new Client({
    connectionString: url,
    connectionTimeoutMillis: 10000, // Perpanjang timeout jadi 10 detik
    ssl: url.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('SUCCESS: Connected to Xata PostgreSQL!');
    
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    if (res.rowCount === 0) {
      console.log('Result: No tables found in public schema.');
    } else {
      console.log('Result: Tables found:');
      res.rows.forEach(row => console.log(' - ' + row.table_name));
    }
    
    await client.end();
  } catch (err) {
    console.error('FAILURE: Could not connect to Xata.');
    console.error('Error:', err.message);
    process.exit(1);
  }
}

listTables();
