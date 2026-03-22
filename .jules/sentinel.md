## 2024-05-24 - JWT Bypass in Middleware
**Vulnerability:** JWT signature is not verified in the middleware, allowing attackers to forge tokens.
**Learning:** `decodeJwtPayload` in `src/middleware.ts` parses the JWT payload without verifying its signature, relying entirely on downstream API routes (which might not always be strict) or returning the forged payload's role to bypass RBAC checks for page access.
**Prevention:** Use Web Crypto API to verify the JWT signature inside Edge Runtime middleware.
