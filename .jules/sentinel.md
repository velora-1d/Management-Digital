## 2026-05-02 - [Insecure PRNG for Password Generation]
**Vulnerability:** Weak PRNG (`Math.random()`) was used to generate new passwords during the password reset process.
**Learning:** Using non-cryptographically secure pseudo-random number generators like `Math.random()` for generating sensitive data (passwords, tokens, keys) introduces predictable outputs, making the system vulnerable to brute-force or guessing attacks. This system needs strong unpredictability for resets.
**Prevention:** Always use a cryptographically secure PRNG like `node:crypto`'s `randomInt()` or `randomBytes()` for generating passwords or any security-sensitive strings.
