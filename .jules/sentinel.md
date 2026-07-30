## 2025-06-28 - Secure database migration endpoints
**Vulnerability:** Missing authentication and authorization on database migration endpoints
**Learning:** Administrative API endpoints must be secured using `requireAuth` and `requireRole` to prevent unauthenticated access and enforce proper authorization.
**Prevention:** Always ensure sensitive endpoints enforce authentication and authorization checks.
