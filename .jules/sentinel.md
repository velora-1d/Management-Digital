## 2024-05-30 - [Missing Auth on Migration Endpoints]
**Vulnerability:** Found `force-migrate-prod` and `temp-migrate` endpoints lacking authentication, exposing direct raw SQL modification to any client.
**Learning:** Administrative and utility endpoints, even temporary ones, often skip middleware constraints and require direct enforcement. Ensure `requireAuth` and `requireRole` are explicitly used on server-side Next.js route handlers.
**Prevention:** Apply a strict code-review process to ensure any route containing `sql\`\` ` or Drizzle commands requires an established user payload via RBAC.
