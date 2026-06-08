## 2024-05-24 - Secure Database Migration Endpoints
**Vulnerability:** Critical migration endpoints (`force-migrate-prod` and `temp-migrate`) lacked authentication and were exposed via GET requests.
**Learning:** The endpoints directly executed destructive DDL operations (`ALTER TABLE`) without any role-based authorization or session validation, allowing any unauthenticated user to alter the database schema.
**Prevention:** Ensure all administrative endpoints explicitly implement role-based access control, such as `requireAuth()` and `requireRole(user, ["superadmin"])`, and handle authorization errors strictly via proper HTTP response codes.
