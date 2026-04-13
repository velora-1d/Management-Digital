
## 2025-02-14 - Fix SQL Injection in Database Restore
**Vulnerability:** The database restore endpoint (`/api/settings/restore/route.ts`) executed raw SQL dump files uploaded by users using `sql.raw()`. This allowed arbitrary command execution (SQL injection) as an attacker could modify the `.sql` dump to include malicious stacked queries (e.g., `INSERT INTO ...; DROP TABLE users;`).
**Learning:** Even administrative restore features handling raw SQL strings need rigorous validation. Using `sql.raw()` safely on raw user-uploaded files requires defense-in-depth string processing to detect stacked queries while accounting for legitimate SQL syntax.
**Prevention:** Always validate `.sql` file lines rigorously before applying `sql.raw()`. Strip string literals to safely locate semicolons, `trim()` inputs before position checks to avoid newline-related false positives, use `[\s\S]` in regex to support multi-line values, and enforce strict table-name whitelists.
