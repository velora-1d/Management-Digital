## 2024-07-07 - JWT Signature Bypass
**Vulnerability:** getJwtSecret falls back to an empty string if JWT_SECRET is missing.
**Learning:** Falling back to an empty string for secrets allows attackers to forge JWTs.
**Prevention:** Always throw an Error when critical secrets are missing.
