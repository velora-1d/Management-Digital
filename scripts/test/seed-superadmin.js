import pg from 'pg';
const { Client } = pg;
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

async function seedSuperAdmin() {
  const url = process.env.DATABASE_URL;
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to Xata for seeding...');

    const email = 'superadmin@assaodah.sch.id';
    const password = 'pw.admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cek apakah user sudah ada
    const checkUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (checkUser.rowCount > 0) {
      console.log('User already exists. Updating password...');
      await client.query('UPDATE users SET password = $1, role = $2, status = $3 WHERE email = $4', 
        [hashedPassword, 'superadmin', 'aktif', email]);
    } else {
      console.log('User not found. Creating new superadmin...');
      // Menggunakan kolom: id, name, email, password, role, status
      await client.query(
        'INSERT INTO users (name, email, password, role, status) VALUES ($1, $2, $3, $4, $5)',
        ['Super Admin Test', email, hashedPassword, 'superadmin', 'aktif']
      );
    }

    console.log('SUCCESS: Superadmin seeded/updated (Email: ' + email + ', Pw: ' + password + ')');
    await client.end();
  } catch (err) {
    console.error('FAILURE during seeding:', err.message);
    process.exit(1);
  }
}

seedSuperAdmin();
