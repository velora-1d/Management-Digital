## 2026-05-01 - [Weak PRNG in Password Reset]
**Vulnerability:** Found `Math.random()` being used to generate new passwords during the password reset process, which is a cryptographically weak pseudo-random number generator.
**Learning:** Insecure random number generators like `Math.random()` should never be used for security-sensitive operations such as password generation, token creation, or cryptography, as they are predictable.
**Prevention:** Always use cryptographically secure APIs, such as `randomInt` or `randomBytes` from `node:crypto` (or `crypto.getRandomValues` in the browser), for security-critical randomness.
