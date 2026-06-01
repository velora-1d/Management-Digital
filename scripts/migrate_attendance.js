const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    console.log('Adding columns to attendances table...');
    
    // Add columns if they don't exist
    await client.query(`
      ALTER TABLE attendances 
      ADD COLUMN IF NOT EXISTS academic_year_id INTEGER,
      ADD COLUMN IF NOT EXISTS is_notified BOOLEAN DEFAULT FALSE;
    `);

    console.log('Migration successful!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrate();
