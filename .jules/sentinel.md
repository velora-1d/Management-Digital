## 2024-04-06 - [Disable Vulnerable DB Restore Endpoint]
**Vulnerability:** CRITICAL SQL Injection. The `src/app/api/settings/restore/route.ts` endpoint read a user-uploaded `.sql` file, extracted `INSERT INTO` statements, and executed them directly using `sql.raw(stmt)` via Drizzle ORM. This allows arbitrary SQL execution by an attacker uploading a maliciously crafted file.
**Learning:** Never parse and execute raw SQL statements from user uploads using `sql.raw()`. It completely bypasses Drizzle's parameterized queries and creates severe injection vectors.
**Prevention:** Disable in-app SQL restore features. Database restoration should be handled externally via proper database tools (like `psql` or `pg_restore`) by an authorized database administrator.
