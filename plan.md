1. **Analyze Security Issues:**
   - In `src/middleware.ts`, the JWT payload is decoded without verifying its cryptographic signature (`decodeJwtPayload` function).
   - This allows an attacker to forge a token and impersonate any user, bypass RBAC checks, and access sensitive endpoints.
   - Additionally, the middleware does not verify the `JWT_SECRET` environment variable.
2. **Implement JWT Signature Verification in Edge Runtime (`src/middleware.ts`):**
   - Import Web Crypto API to implement HMAC SHA-256 validation.
   - Re-implement `verifyJwtSignature` function utilizing `crypto.subtle`. Next.js Edge Runtime natively supports standard Web APIs including Web Crypto API.
   - Use `process.env.JWT_SECRET` to get the secret.
   - Reject tokens that fail validation.
3. **Pre-commit Steps:**
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
4. **Submit PR:**
   - Submit PR with the title '🛡️ Sentinel: [CRITICAL] Fix JWT Authentication Bypass in Middleware'.
