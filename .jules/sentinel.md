## 2024-06-11 - Missing Authentication on Migration Endpoints
**Vulnerability:** Found database migration scripts (`src/app/api/force-migrate-prod/route.ts` and `src/app/api/temp-migrate/route.ts`) exposed without any authentication or authorization.
**Learning:** Administrative endpoints, particularly those executing raw SQL schemas or altering databases, can be completely unprotected if standard RBAC middleware or checks are missed during rapid development or when scripts are left in place post-migration.
**Prevention:** Ensure all API endpoints, especially temporary scripts and database administration routes, are wrapped with `requireAuth()` and explicitly enforce `requireRole(user, ["superadmin"])` before running execution blocks.
