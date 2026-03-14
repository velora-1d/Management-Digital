import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, employees } from './src/db/schema';

const sourceUrl = "postgresql://xata:tZClkMwrHXjzU4smqTbnem7ZHBVzvRTiH1YmF9JgMl5COicfZ29FvJ6dVP24fxJU@b8p39hjlel3vrcd5tl3jnh56jk.us-east-1.xata.tech:5432/postgres?sslmode=require";
const targetUrl = "postgresql://neondb_owner:npg_KD7W2HhxjLXl@ep-divine-sound-aeniuhry.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function run() {
  const sourceClient = postgres(sourceUrl, { prepare: false });
  const sourceDb = drizzle(sourceClient);
  
  const targetClient = postgres(targetUrl, { prepare: false });
  const targetDb = drizzle(targetClient);

  console.log("Fetching users from source...");
  const allUsers = await sourceDb.select().from(users);
  console.log(`Found ${allUsers.length} users.`);

  console.log("Fetching employees from source...");
  const allEmployees = await sourceDb.select().from(employees);
  console.log(`Found ${allEmployees.length} employees.`);

  if (allUsers.length > 0) {
    console.log("Inserting/Updating users into target...");
    for (const u of allUsers) {
      await targetDb.insert(users).values(u).onConflictDoUpdate({
        target: users.id,
        set: u
      });
    }
  }

  if (allEmployees.length > 0) {
    console.log("Inserting/Updating employees into target...");
    for (const e of allEmployees) {
      await targetDb.insert(employees).values(e).onConflictDoUpdate({
        target: employees.id,
        set: e
      });
    }
  }

  console.log("Done!");
  process.exit(0);
}

run().catch((err) => {
  console.error("Error migrating data:", err);
  process.exit(1);
});
