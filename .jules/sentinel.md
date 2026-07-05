## 2025-01-01 - JWT Signature Bypass Vulnerability
**Vulnerability:** `getJwtSecret()` in `src/lib/auth.ts` falls back to an empty string `""` if the `JWT_SECRET` environment variable is missing.
**Learning:** Returning an empty string for a cryptographic secret allows attackers to trivially forge signed JWTs by signing them with an empty string, completely bypassing authentication. Weak fallbacks for secrets degrade system security entirely.
**Prevention:** Always throw an error or fail securely when critical cryptographic secrets are missing to prevent the application from running in an insecure state.
