## 2024-03-24 - [Unauthenticated Migration Endpoints]
**Vulnerability:** Found two database migration endpoints (`/api/force-migrate-prod` and `/api/temp-migrate`) that execute raw schema-altering SQL without any authentication or authorization checks.
**Learning:** Administrative endpoints created for temporary or "one-off" fixes often bypass standard security middleware and are left exposed to the public internet.
**Prevention:** Always wrap temporary/administrative API routes with strict `requireAuth()` and `requireRole(user, ["superadmin"])` checks, even if they are meant to be used only once.
