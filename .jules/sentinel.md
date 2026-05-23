## 2024-05-18 - Missing Authentication in User Endpoints
**Vulnerability:** The /api/users endpoints lacked explicit requireAuth() and requireRole() checks, relying solely on edge middleware which does not verify token signatures.
**Learning:** Next.js middleware using edge runtime cannot easily perform JWT signature verification. API routes must always perform their own strict auth and role checks.
**Prevention:** Always include requireAuth() and requireRole() at the start of protected API route handlers, regardless of middleware configuration.
