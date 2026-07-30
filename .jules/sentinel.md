## 2024-07-03 - Missing Authentication on Migration Routes
**Vulnerability:** Unauthenticated access to database migration and temporary script routes (`/api/force-migrate-prod` and `/api/temp-migrate`).
**Learning:** Administrative endpoints used for migrations or database patches might be left without proper authentication/authorization wrappers if developers consider them temporary or one-off tasks, exposing the database to destructive alterations by unauthorized actors.
**Prevention:** Always ensure that all administrative or maintenance endpoints, regardless of their intended lifespan, are secured with the appropriate `requireAuth()` and `requireRole()` checks before deployment.
