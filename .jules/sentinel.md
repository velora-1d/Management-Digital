## 2024-05-18 - Fix Edge Runtime JWT Signature Bypass
**Vulnerability:** Next.js middleware was decoding JWT tokens without verifying their HMAC signature because `jsonwebtoken` doesn't work in Edge Runtime. This allowed attackers to forge tokens and bypass RBAC checks.
**Learning:** In Edge environments, security checks must use `crypto.subtle` instead of Node.js modules. Also, fallback secrets (if any) must be strictly identical across both Node (`auth.ts`) and Edge (`middleware.ts`) environments, otherwise local development breaks completely.
**Prevention:** Always verify cryptographic signatures before trusting payloads, even in Edge/Middleware routing layers. Use Web Crypto API (`crypto.subtle.verify`) for Edge-compatible HMAC validation.
