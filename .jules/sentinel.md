## 2026-06-27 - [CRITICAL] Fixed missing authentication on database migration endpoints
**Vulnerability:** Administrative endpoints (`force-migrate-prod` and `temp-migrate`) lacked authentication and authorization, allowing any unauthenticated user to trigger database schema alterations.
**Learning:** Missing authentication checks in sensitive API routes can lead to severe security risks, including database modifications or denial of service.
**Prevention:** Always enforce `requireAuth()` and `requireRole()` for sensitive administrative endpoints, especially those modifying the database schema directly.
