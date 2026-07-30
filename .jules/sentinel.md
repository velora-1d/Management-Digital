## 2025-06-25 - Securing administrative database migration endpoints
**Vulnerability:** Unauthenticated administrative API endpoints (`/api/force-migrate-prod` and `/api/temp-migrate`) that execute raw SQL migrations were accessible to the public, leading to potential unauthorized database modification.
**Learning:** Temporary migration scripts or administrative utility routes are often deployed without authentication checks during development, which become critical security risks when left in production.
**Prevention:** Always wrap temporary administrative and migration API routes with strict authentication and authorization checks (e.g., `requireAuth` and `requireRole` restricted to 'superadmin') from their inception, regardless of their intended temporary nature.
