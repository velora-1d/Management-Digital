## 2024-05-16 - Prevent SQL Injection via Restore API
**Vulnerability:** The `/api/settings/restore` endpoint parsed user-uploaded `.sql` files and directly executed their contents via Drizzle ORM's `sql.raw()`. This allowed arbitrary command execution and severe SQL injection.
**Learning:** Never pass unsanitized file uploads or user inputs into `sql.raw()` in Drizzle ORM. Doing so entirely circumvents all parameterized query protections.
**Prevention:** Ensure that administrative endpoints like database restore are either handled externally using designated DB tools or strictly utilize parameterized APIs instead of raw string execution.
