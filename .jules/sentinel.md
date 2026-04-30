## 2026-04-30 - Fix Insecure PRNG for Password Generation
**Vulnerability:** Weak PRNG (`Math.random()`) was used for generating temporary passwords.
**Learning:** Cryptographically weak pseudo-random number generators should not be used for security-sensitive operations.
**Prevention:** Use `randomInt()` or `randomBytes()` from `node:crypto` or `window.crypto` for secure random number generation.
