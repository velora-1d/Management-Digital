## 2026-04-25 - Replaced Insecure Math.random() with randomInt
**Vulnerability:** The password reset route `src/app/api/users/[id]/reset-password/route.ts` used the cryptographically insecure `Math.random()` to generate the new reset password. This could potentially allow attackers to predict reset passwords.
**Learning:** Relying on pseudo-random number generators like `Math.random()` for any security-sensitive operations (passwords, tokens, cryptography) is a critical vulnerability.
**Prevention:** Always use cryptographically secure random number generators (CSPRNG), such as `randomInt` or `randomBytes` from the `node:crypto` module in Node.js environments.
