## 2025-03-05 - [Critical] Middleware Authentication Bypass

**Vulnerability:** The Next.js middleware (`src/middleware.ts`) was only decoding the JWT token to extract the user's role and user ID for access control (RBAC), but it did not verify the token's cryptographic signature. This allowed any user to forge a token, specify an arbitrary role (like 'superadmin'), and bypass authentication entirely.

**Learning:** This occurred because the standard `jsonwebtoken` library cannot be used in Next.js Edge Runtime (where middleware runs). In an attempt to make the middleware work, the previous developer created a function (`decodeJwtPayload`) that only read the JSON payload via `atob()` but skipped signature validation. When implementing JWTs in Edge environments, it's very easy to fall into this trap.

**Prevention:** Always ensure JWT signatures are cryptographically verified in every access control barrier. In Edge environments (like Cloudflare Workers, Next.js Middleware), use the native Web Crypto API (`crypto.subtle`) to manually verify the HMAC signature of the JWT instead of relying solely on `atob()`.
