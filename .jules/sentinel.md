## 2024-06-06 - [Fix Unauthenticated Migrations]
**Vulnerability:** Unauthenticated database migration endpoints (`/api/force-migrate-prod` and `/api/temp-migrate`) that allowed any user to alter the database schema.
**Learning:** Temporary migration scripts or administrative scripts left in the application without authentication controls pose a critical security risk.
**Prevention:** Ensure all API endpoints, including those intended as temporary scripts, are secured with authentication (`requireAuth`) and authorization (`requireRole`) checks before being committed to the codebase.
