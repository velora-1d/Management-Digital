## 2024-07-08 - Empty JWT Secret allows token forging
**Vulnerability:** getJwtSecret() returns an empty string if JWT_SECRET environment variable is missing, allowing authentication bypass.
**Learning:** Fallbacks in authentication secrets must throw an error, not return empty strings, to fail securely.
**Prevention:** Always `throw new Error()` when critical environment secrets (like JWT secrets) are missing, to prevent token forging.
