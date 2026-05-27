## 2026-05-27 - [Sentinel] Fix JWT Authentication Bypass in Middleware
**Vulnerability:** JWT payload in `src/middleware.ts` was being decoded and trusted without validating its HMAC signature, making it possible to forge tokens and bypass RBAC checks.
**Learning:** Next.js Edge Runtime doesn't support the `jsonwebtoken` Node module out of the box, leading developers to sometimes skip signature verification to avoid build errors. However, Edge Runtime supports the Web Crypto API (`crypto.subtle`), which can be used to securely verify HMAC SHA-256 signatures natively without Node modules.
**Prevention:** Always verify cryptographic signatures on JWTs before trusting the payload, even in Edge environments. Use standard Web APIs like `crypto.subtle` if Node built-ins are unavailable.
